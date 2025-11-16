import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensFile = path.join(__dirname, "tokens.json");

let replitClient = null;
if (process.env.REPLIT_DB_URL) {
    try {
        const { default: Database } = await import("@replit/database");
        replitClient = new Database();
    } catch (error) {
        console.warn("@replit/database not installed; falling back to local JSON store.");
    }
}

export class TokenStore {
    tokens = [];

    async init() {
        if (replitClient) {
            const saved = await replitClient.get("tokens");
            if (Array.isArray(saved)) this.tokens = saved;
            return;
        }

        try {
            const raw = await fs.readFile(tokensFile, "utf8");
            this.tokens = JSON.parse(raw);
        } catch (_) {
            this.tokens = [];
        }
    }

    async save({ email, token }) {
        const entry = {
            email,
            token,
            createdAt: new Date().toISOString()
        };
        this.tokens.push(entry);
        await this.persist();
        return entry;
    }

    async list() {
        return this.tokens.slice().reverse();
    }

    async persist() {
        if (replitClient) {
            await replitClient.set("tokens", this.tokens);
            return;
        }

        await fs.writeFile(tokensFile, JSON.stringify(this.tokens, null, 2));
    }
}
