***

# WorkflowForge

WorkflowForge is a small, production-minded visual workflow builder and runner. It’s designed to be demo-friendly for interviews and recruiter walkthroughs, yet structured so you can scale it into a real service: visual authoring, persistent runs with per-step results, and an optional queue + worker for production workloads.

T

---

## TL;DR — quick setup

- Backend: Node 18+ (run `node index.js`) — default server: `http://localhost:5000`
- Frontend: Vite dev server (run `npm run dev` from `/frontend`) — default UI: `http://localhost:5173`
- DB: MongoDB (default `mongodb://localhost:27017/workflowforge`)
- Optional queue: Redis + BullMQ (set `REDIS_URL` and run `node backend/worker.js`)

Seeded demo user (dev only):
- Email: `nive@2809.com`
- Password: `nive2809`

---

## Quick start (local development)

1. Clone and install

```powershell
git clone <repo-url>
cd workflowforge
npm install        # backend deps
cd frontend
npm install        # frontend deps
```

2. Configure environment (optional)

Create a `.env` at the repo root with these values for convenience (dev):

```
MONGO_URI=mongodb://localhost:27017/workflowforge
PORT=5000
JWT_SECRET=dev_secret_not_for_prod
FRONTEND_URL=http://localhost:5173
# Optional for queueing
# REDIS_URL=redis://localhost:6379
```

3. Start services

Run the backend (foreground so logs are visible):

```powershell
cd "c:\Users\91994\OneDrive - DAV BHEL Ranipet\Documents\WorkflowForge"
node index.js
```

In another terminal start the frontend:

```powershell
cd frontend
npm run dev
# open http://localhost:5173
```

Optional — start Redis + worker (for queue demo):

```powershell
# ensure Redis is running (docker, local, or remote)
$env:REDIS_URL='redis://localhost:6379'
node backend/worker.js
```

4. Quick smoke checks

Backend health:

```powershell
Invoke-WebRequest -UseBasicParsing 'http://localhost:5000/'
```

Login via API (seeded user):

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"email":"nive@2809.com","password":"nive2809"}' -Uri 'http://localhost:5000/api/auth/login'
```

You should receive a `token` and `user` object.

---

## The demo script (what to show — 3–6 minutes)

This is a tight, recruiter-ready script that demonstrates the system end-to-end.

1. Start backend and frontend (show logs: Mongo connected and server running).
2. Open the UI at `http://localhost:5173` and sign in with the seeded user.
3. Create a workflow: click "New workflow", enter a name like `Demo — Recruiter Run`, save.
4. Add nodes (via the palette or Add Node):
	 - Text node — `content`: `Hello from WorkflowForge`
	 - Delay node — `ms`: `1500`
	 - HTTP node — `url`: `https://jsonplaceholder.typicode.com/todos/1`
5. Edit the Text node: change content to `Hello, I'm demonstrating WorkflowForge` and save.
6. Reorder nodes (Text → Delay → HTTP) and save.
7. Click `Run workflow`. Point out whether the response shows `queued: true` (if worker is running) or `queued: false` (in-process run).
8. Open Run Details: watch per-step status and results update live. Show the HTTP step returning JSON.
9. (Optional) Show the worker terminal output picking up the job if queue mode is enabled.

What to type in each node (copy/paste):

- Text `content`: `Hello from WorkflowForge`
- Delay `ms`: `1500`
- HTTP `url`: `https://jsonplaceholder.typicode.com/todos/1`

Expected HTTP response snippet (for the placeholder API):

```json
{
	"userId": 1,
	"id": 1,
	"title": "delectus aut autem",
	"completed": false
}
```

---

## Architecture and key files (where to look)

- Backend entry: `index.js`
- Routes: `routes/workflows.js`, `routes/runs.js`, `routes/auth.js`
- Runner: `backend/services/workflowRunner.js` (core execution logic)
- Queue publisher: `backend/queue/publisher.js`
- Worker: `backend/worker.js` (BullMQ consumer)
- Models: `models/Workflow.js`, `models/Run.js`, `models/User.js`
- Frontend: `frontend/src/pages/*`, `frontend/src/components/*`
- API helper: `frontend/src/utils/api.js` (baseURL defaults to `http://localhost:5000`)

---

## How Runs work (internals)

- When `POST /api/workflows/:id/run` is called we create a `Run` doc immediately with `status: running` and empty `steps`.
- The runner executes nodes sequentially and updates the Run's `steps` array with `status`, `result`, `error`, and timestamps.
- The frontend polls `GET /api/runs/:id` to render live updates; this makes the UI responsive without WebSockets.

---

## Node types — current & how to extend

Included types:
- `text` — returns `config.content` immediately.
- `delay` — waits `config.ms` milliseconds and returns "done".
- `http` — fetches `config.url` and returns JSON or text depending on content-type.

Add a new node type:

1. Edit `backend/services/workflowRunner.js` and add a case to `executeNode(node)`.
2. Ensure the result is JSON-serializable (or a string) and that you throw on unrecoverable errors.
3. The UI stores `node.config` as freeform JSON — no migration needed.

---

## Queueing & scaling

- The run endpoint will attempt to enqueue jobs when `REDIS_URL` (or `REDIS_HOST`/`REDIS_PORT`) is available and `backend/queue/publisher.js` can connect.
- If enqueue fails the code falls back to the in-process runner so requests do not silently fail.
- To scale: run multiple instances of `backend/worker.js` backed by Redis; workers will update Run documents in Mongo as they progress.

---

## Docker & deployment notes

- A `docker-compose.yml` is included to run Mongo + backend + frontend locally. For a full production demo add `redis` and a `worker` service.
- Example (local quick start with Docker Desktop):

```powershell
docker compose up --build
```

For production consider:
- secrets in environment manager (don't commit `.env`)
- a managed Redis service for reliability
- scaling workers separately from the API

---

## Testing & CI

- Smoke script: `test-step6-verify.js` exercises the main API flows.
- Playwright E2E lives under `e2e/` — run with `npx playwright test` after installing browsers.
- CI: `.github/workflows/ci.yml` runs smoke and (optionally) Playwright tests.

---

## Troubleshooting (common issues)

- "Network Error" during login in the browser:
	- Backend not running — run `node index.js` and verify `GET /` returns a 200.
	- Frontend using wrong API base — check `frontend/src/utils/api.js` for the correct `baseURL`.
	- CORS: if you set `FRONTEND_URL` in `.env` make sure it matches the dev origin.

- Backend logs show `ECONNREFUSED 127.0.0.1:6379`:
	- Redis is not running. Either start Redis or unset Redis env vars to use the in-process fallback.

- Starting backend as a PowerShell `Start-Job` hides stdout/stderr; either run `node index.js` in a visible terminal or redirect logs to a file and tail it:

```powershell
Start-Job -ScriptBlock { node index.js *> backend.log }
Get-Content backend.log -Wait -Tail 50
```

---

## Useful commands 

Start backend (foreground):

```powershell
cd "path"
node index.js
```

Start frontend (foreground):

```powershell
cd frontend
npm run dev
```

Start worker (queue mode):

```powershell
$env:REDIS_URL='redis://localhost:6379'
node backend/worker.js
```

Quick login test from PowerShell:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"email":"nive@2809.com","password":"nive2809"}' -Uri 'http://localhost:5000/api/auth/login'
```




