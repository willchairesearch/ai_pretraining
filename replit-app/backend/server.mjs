import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAINode } from "../../index.js";
import { TokenStore } from "./tokenStore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const cainode = new CAINode();
const tokenStore = new TokenStore();
await tokenStore.init();

const jobs = new Map();
const queue = [];
let processing = false;

const sanitizeJob = job => {
    const { timeoutPer2s, ...rest } = job;
    return rest;
};

const enqueue = job => {
    queue.push(job);
    processQueue();
};

const updateJob = (job, patch) => {
    Object.assign(job, patch, { updatedAt: new Date().toISOString() });
};

const processQueue = async () => {
    if (processing) return;
    const job = queue.shift();
    if (!job) return;
    processing = true;
    updateJob(job, { status: "processing" });

    try {
        const mailCb = () => updateJob(job, { status: "email_sent" });
        const token = await cainode.generate_token_auto(job.email, job.timeoutPer2s, mailCb);
        await tokenStore.save({ email: job.email, token });
        updateJob(job, { status: "success", tokenStored: true, completedAt: new Date().toISOString() });
    } catch (error) {
        updateJob(job, { status: "failed", error: error?.message || String(error) });
    } finally {
        processing = false;
        setImmediate(processQueue);
    }
};

app.post("/api/token-requests", (req, res) => {
    const { email, timeoutSeconds = 120 } = req.body || {};
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required." });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
        return res.status(400).json({ error: "Email is required." });
    }
    const parsedSeconds = Number(timeoutSeconds);
    const seconds = Number.isFinite(parsedSeconds) ? Math.max(0, parsedSeconds) : 0;
    const timeoutPer2s = seconds <= 0 ? 0 : Math.ceil(seconds / 2);

    const job = {
        id: randomUUID(),
        email: trimmedEmail,
        timeoutSeconds: seconds,
        timeoutPer2s,
        status: "queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tokenStored: false,
        error: null
    };

    jobs.set(job.id, job);
    enqueue(job);

    return res.status(202).json(sanitizeJob(job));
});

app.get("/api/token-requests", (_req, res) => {
    const all = Array.from(jobs.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(all.map(sanitizeJob));
});

app.get("/api/token-requests/:id", (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found." });
    return res.json(sanitizeJob(job));
});

app.get("/api/tokens", async (_req, res) => {
    const tokens = await tokenStore.list();
    res.json(tokens);
});

const frontendDir = path.resolve(__dirname, "../frontend");
app.use(express.static(frontendDir));
app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(port, () => {
    console.log(`CAINode token relay listening on port ${port}`);
});
