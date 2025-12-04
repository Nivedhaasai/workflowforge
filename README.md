# WorkflowForge — Development README

This repo contains a Node/Express backend and a React (Vite) frontend for WorkflowForge.

## Quick start (development)

Prerequisites:
- Node 18+ (for global `fetch` support in runner)
- MongoDB running and reachable via `MONGO_URI`

1. Install dependencies

WorkflowForge — a concise, developer-friendly workflow automation builder

Why this project exists

I built WorkflowForge to have a small, focused playground for composing automation flows and demonstrating a full-stack feature set end-to-end. The goal was simple: make it trivial to create a workflow visually, run it, and inspect every step of the execution. That makes it great for demos, interviews, or as a foundation for production features.

What’s in the repository

- Backend: Node.js + Express with Mongoose models for Workflows and Runs. A small runner executes nodes sequentially and persists per-step results.
- Frontend: React + Vite app with a Builder UI (palette, inspector), Run History, and Run Details views.
- Dev tooling: `scripts/dev-seed.js`, Docker and Docker Compose files, a GitHub Actions CI workflow, and Playwright tests (API + UI).

Quick start — local development (how I run it)

1) Clone and install

```powershell
git clone <repo-url>
cd WorkflowForge
npm ci
cd frontend
npm ci
```

2) Create a small `.env` in the repo root

```
MONGO_URI=mongodb://localhost:27017/workflowforge
JWT_SECRET=replace_with_a_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3) Seed a dev account and sample workflow

```powershell
node scripts/dev-seed.js
```

Seeded credentials (convenience)

- Email: `devtester+1@example.com`
- Password: `Password123!`

4) Start the app

Native (fast for development):

```powershell
# make sure MongoDB is running
node index.js          # start backend
cd frontend
npm run dev            # start frontend (Vite)
```

Using Docker (reproducible):

```powershell
# requires Docker Desktop with 'docker compose'
docker compose up --build -d
```

Open the frontend in your browser and log in.

Test:

- Open Workflows, create a new workflow.
- Open Builder, add a Text node, set its text and save.
- Click `Run Workflow`; open `Run History` and click `View details` to inspect per-step output.

Key API endpoints (most used)

- `POST /api/auth/register` — register a user
- `POST /api/auth/login` — login, returns JWT
- `GET /api/workflows` — list workflows for the current user
- `POST /api/workflows` — create a workflow
- `GET /api/workflows/:id` — fetch a workflow
- `POST /api/workflows/:id/run` — start a run (returns 202 and `runId`)
- `GET /api/workflows/:id/runs` — list runs for a workflow
- `GET /api/runs/:id` — fetch run details with per-step results

How the runner works (quick)

- When you start a run we create a `Run` document with `status: running` and push step objects to the `steps` array as nodes execute.
- The frontend polls `GET /api/runs/:id` while the run is `running` to show live progress and per-step outputs.
- Supported node types (out of the box): `text`, `delay`, `http` (fetches JSON/text from remote URLs).

Cloud & production notes

- This repo includes Dockerfiles and `docker-compose.yml` for local and simple cloud deployments.
- For production workloads I recommend moving to a queue-based runner (BullMQ + Redis): enqueue runs on request and process them with separate worker instances so execution scales independently of the API.
- See `docs/QUEUE_PLAN.md` for a step-by-step migration plan and `docs/CLOUD.md` for provider-specific deployment notes.

Tests and CI

- CI: `.github/workflows/ci.yml` includes smoke tests and Playwright E2E (API + UI).
- Local E2E: run `cd e2e && npm install && npx playwright install --with-deps && npx playwright test`.

Quick smoke test (one-command)

I added simple helpers you can run locally to validate the backend and basic API flows.

PowerShell (Windows):

```powershell
# from repo root
.\scripts\test-smoke.ps1
```

Bash (macOS / Linux / WSL):

```bash
# from repo root
./scripts/test-smoke.sh
```

Notes:
- The scripts start the backend temporarily, run `test-step6-verify.js`, and then stop the backend process.
- They are convenience helpers — feel free to inspect the scripts under `scripts/` before running.

Performance & scaling (practical advice)

- The in-process runner is great for demos and short jobs. When you need to scale:
	- Push runs to Redis (BullMQ) and run workers that consume jobs and update `Run` documents.
	- Add timeouts, retries, and backoff for HTTP nodes; isolate long-running steps into background workers.
	- Use a CDN for static frontend assets, and serve the built frontend from a static host in production.

Security checklist

- Always set `JWT_SECRET` in production; do not commit secrets.
- Set `FRONTEND_URL` to your frontend origin to restrict CORS.

Recent work:

- Observable runs: Run model + runner persist step outputs so the UI can poll and show live progress.
- UX polish: modal improvements, favicon + manifest, Run History modal, and Run Details modal with copy-to-clipboard for outputs.
- CI & tests: smoke tests and Playwright E2E coverage added.

