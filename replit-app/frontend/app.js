const form = document.getElementById("token-form");
const jobsBody = document.getElementById("jobs-body");
const tokensBody = document.getElementById("tokens-body");
const statusEl = document.getElementById("form-status");
const prefillBtn = document.getElementById("prefill-test");

const DEFAULT_TIMEOUT = 120;
const JOB_REFRESH_MS = 5000;
const TOKEN_REFRESH_MS = 8000;

const formatDate = value => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";

const renderStatus = status => {
    const normalized = status?.toLowerCase() || "queued";
    const label = normalized.replace(/_/g, " ");
    return `<span class="status-pill" data-status="${normalized}">${label}</span>`;
};

const renderJobs = jobs => {
    jobsBody.innerHTML = jobs
        .map(job => `
            <tr>
                <td>${job.email}</td>
                <td>${renderStatus(job.status)}</td>
                <td>${job.timeoutSeconds === 0 ? "No limit" : `${job.timeoutSeconds}s`}</td>
                <td>${formatDate(job.updatedAt)}</td>
                <td>${job.error ?? ""}</td>
            </tr>`)
        .join("");
};

const renderTokens = tokens => {
    tokensBody.innerHTML = tokens
        .map(token => `
            <tr>
                <td>${token.email}</td>
                <td><code>${token.token}</code></td>
                <td>${formatDate(token.createdAt)}</td>
            </tr>`)
        .join("");
};

const fetchJobs = async () => {
    try {
        const response = await fetch("/api/token-requests");
        const jobs = await response.json();
        renderJobs(jobs);
    } catch (error) {
        console.error("Failed to fetch jobs", error);
    }
};

const fetchTokens = async () => {
    try {
        const response = await fetch("/api/tokens");
        const tokens = await response.json();
        renderTokens(tokens);
    } catch (error) {
        console.error("Failed to fetch tokens", error);
    }
};

const setStatus = message => {
    statusEl.textContent = message;
};

form.addEventListener("submit", async event => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const timeoutSeconds = Number(form.elements.timeout.value) || 0;

    if (!email) {
        setStatus("Please enter an email address.");
        return;
    }

    setStatus("Submitting request...");

    try {
        const response = await fetch("/api/token-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, timeoutSeconds })
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to queue request");

        setStatus("Email queued. Ask the user to click the Character.AI message.");
        form.reset();
        form.elements.timeout.value = timeoutSeconds || DEFAULT_TIMEOUT;
        await fetchJobs();
        await fetchTokens();
    } catch (error) {
        setStatus(`Error: ${error.message}`);
    }
});

prefillBtn.addEventListener("click", () => {
    form.elements.email.value = "will@seamlessml.com";
    form.elements.timeout.focus();
});

fetchJobs();
fetchTokens();
setInterval(fetchJobs, JOB_REFRESH_MS);
setInterval(fetchTokens, TOKEN_REFRESH_MS);
