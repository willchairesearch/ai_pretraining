# CAINode Token Runner (Replit)

This folder contains a ready-to-deploy Replit workspace that wraps the CAINode `generate_token_auto` helper with a small Express backend and a static frontend. Use it to collect Character.AI session tokens from a cohort of users.

## How it works
1. The frontend (`frontend/`) lets an operator queue email addresses and track request states (queued → email sent → success/failed).
2. The backend (`backend/server.mjs`) keeps a single processing queue so only one email flow runs at a time and stores results through `TokenStore`.
3. `TokenStore` persists data either inside Replit DB (when `REPLIT_DB_URL` env var exists) or in `backend/tokens.json` for local testing.

## Quick start
```bash
cd replit-app
npm install
npm start
```
The server listens on `PORT` (default `3000`) and serves both the JSON API and the frontend dashboard.

## Environment
- `PORT` (optional): override the default Express port.
- `REPLIT_DB_URL` (optional): provided automatically in Replit deployments. Leave unset when testing locally to use the JSON file fallback.

## Operator workflow
1. Fill the email field (or click **Use test email**) and press **Start Token Flow**.
2. Ask the participant to open the Character.AI message and confirm the login.
3. Once `generate_token_auto` resolves, the token is stored and appears in the **Stored Tokens** table (and inside Replit DB / `tokens.json`).

You can export the tokens by querying the `/api/tokens` endpoint or copying them directly from the dashboard table.
