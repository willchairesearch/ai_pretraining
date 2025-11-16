# Repository Guidelines
## The Goal Of This Project
- We need users to enter their email address.
- Then feed this into 'generate_token_auto' which triggers a third party email
- Our users will receive and open the third-paty email.
- Once they have done this, generate_token_auto should get the token. Which we need to store.
- Because we need to repeat this for 100 people in our group, we will use Replit
- You need to create the Frontend and Backend, and ensure that this works.
- Your test email is will@seamlessml.com
- Finally, we are building ontop of a public repo 'CAINode' but the only functionality we need is generate_token_auto, and the Replit to get and store tokens.

## Project Structure & Module Organization
- `index.js` exposes the CAINode client and helper utilities; keep all runtime logic here or in new modules under `src/` to avoid bloating the entry file.
- `example.cjs` shows CommonJS usage, while `example.ts` mirrors the same API for Bun/Deno TypeScript workflows; update both when you add features.
- `postinstall_info.js` is invoked after install to display notices—update it if you add environment prerequisites.
- Tests and fixtures should live under a top-level `tests/` directory; co-locate any mock data in `tests/fixtures/` to keep the published package lean.

## Build, Test, and Development Commands
- `npm install` installs runtime dependencies (`ws`, optional `@livekit/rtc-node`) and prepares the ESM environment.
- `node example.cjs` is the fastest way to sanity-check new APIs against real Character.AI credentials.
- `bun run example.ts` (or `deno run --allow-net example.ts`) validates cross-runtime compatibility.
- `npm test` is currently a placeholder; replace it with your preferred runner once coverage exists so CI signals breakages.

## Coding Style & Naming Conventions
- The library is shipped as pure ESM (`"type": "module"`); prefer `import`/`export` and avoid mixing CommonJS inside `index.js`.
- Follow the existing four-space indentation and keep lines under ~100 chars to preserve readability in the monolithic file.
- Use descriptive camelCase for functions (`generateTokenAuto`) and SCREAMING_SNAKE_CASE only for constants.
- Document new surfaces with JSDoc blocks so downstream TypeScript projects retain autocomplete without separate `.d.ts` files.

## Testing Guidelines
- Add integration tests that spin up mocked WebSocket/FETCH servers so critical flows (`login`, `send_ws`, voice helpers) can run offline.
- Name test files `<feature>.test.js` inside `tests/`; use the Node test runner or Vitest for parity with async APIs.
- Maintain high coverage on token handling, streaming responses, and error paths (timeouts, LiveKit disconnects) since regressions there break user bots.
- Run `npm test` locally before publishing and ensure tests pass on Node 18+; include Bun/Deno smoke tests when your change touches runtime abstractions.

## Commit & Pull Request Guidelines
- Upstream commits follow short imperative messages and often group by type (e.g., `fix: handle ws timeout`, `feat: add voice interrupt`); mirror that Conventional Commit style for clarity in changelog generation.
- Reference related GitHub issues or discussions in the body, and describe how you validated the change (commands run, environments tested).
- PRs should include before/after behavior, updated docs or examples, and screenshots only when surface-level output changes.
- Coordinate breaking changes in dedicated PRs flagged with `BREAKING CHANGE` and update `example.*` plus README snippets simultaneously.
