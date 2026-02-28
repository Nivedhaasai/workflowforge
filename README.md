# WorkflowForge

A full-stack workflow automation platform where you can visually build multi-step workflows, run them, and track every execution in real time. I built this to learn how workflow engines actually work under the hood — how nodes get chained, how approvals pause execution, how a runner processes steps sequentially, and how to wire all of that into a clean React frontend.

This isn't a toy project. It has proper auth, a drag-and-drop builder, a real execution engine, dark mode, Docker support, and CI. I wanted something I could actually deploy and show to people.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## What it does

You create a workflow by dragging nodes onto a canvas. Each node does something — send a text message, make an HTTP request, wait for a few seconds, branch on a condition, or pause and wait for a human to approve. Once you're happy with the flow, you hit Run, and the engine processes each node one by one. You can watch the steps complete in real time, see their outputs, and if something fails, you see exactly where it broke.

There's also a dashboard that shows stats across all your workflows and runs, a run history page with filters, pre-built templates you can clone, and a full dark/light theme that persists across sessions.

### Node types

| Type | What it does |
|------|-------------|
| **Trigger** | Entry point — every workflow starts with one |
| **Text** | Outputs a configured message |
| **HTTP Request** | Makes a GET/POST/etc. request to any URL, returns the response |
| **Delay** | Waits for N seconds before continuing |
| **Condition** | Evaluates a field against a value, decides whether to continue |
| **Approval** | Pauses the run and waits for someone to approve or reject |
| **Transform** | Applies a template transformation to the data |

---

## Tech stack

**Frontend:** React 18 with Vite, Tailwind CSS (class-based dark mode), Framer Motion for animations, @dnd-kit for drag-and-drop, Axios with request/response interceptors

**Backend:** Node.js 20, Express, Mongoose ODM, JWT auth with bcrypt password hashing, rate limiting on auth routes

**Database:** MongoDB 6.0

**DevOps:** Docker + Docker Compose, Nginx for serving the frontend, GitHub Actions CI pipeline, Playwright E2E tests

---

## Getting started

### What you need

- Node.js 20+ (uses native `fetch` in the workflow runner)
- MongoDB running locally or a remote connection string
- npm

### Setup

```bash
git clone https://github.com/Nivedhaasai/workflowforge.git
cd workflowforge
npm ci
cd frontend && npm ci && cd ..
```

Create a `.env` file in the root:

```
MONGO_URI=mongodb://localhost:27017/workflowforge
JWT_SECRET=pick_something_random_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Running locally

Start the backend:

```bash
npm run dev
```

In a separate terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Go to **http://localhost:5173**. Register a new account or use the seeded account — when the backend starts for the first time, it creates a default user and two demo workflows automatically so you have something to play with right away.

### Running with Docker

```bash
docker compose up --build -d
```

This spins up three containers — MongoDB, the backend API, and the frontend served through Nginx. Frontend is on port 5173, backend on 5000.

If you're deploying somewhere other than localhost, update the `VITE_API_URL` build arg in `docker-compose.yml` to point to your backend URL.

---

## How the project is structured

```
workflowforge/
├── index.js                    # Express server setup, middleware, routes
├── models/                     # Mongoose schemas — User, Workflow, Run
├── routes/                     # REST endpoints — auth, workflows, runs
├── middleware/                  # JWT verification middleware
├── backend/
│   ├── seed.js                 # Creates default user + demo workflows on first boot
│   ├── services/
│   │   └── workflowRunner.js   # The actual engine that processes nodes
│   ├── queue/
│   │   └── publisher.js        # BullMQ publisher (ready but optional)
│   └── templates.js            # Pre-built workflow templates
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, Builder, Workflows, RunsPage, etc.
│   │   ├── components/         # NodeCard, Modal, StatusPill, ThemeToggle, etc.
│   │   ├── context/            # AuthContext (JWT + user state), ThemeContext
│   │   ├── services/           # API wrapper functions for every endpoint
│   │   ├── utils/              # Axios instance with interceptors
│   │   └── layout/             # Layout shell, ProtectedRoute wrapper
│   ├── nginx.conf              # SPA-friendly Nginx config
│   └── Dockerfile              # Multi-stage build (npm ci → vite build → nginx)
├── scripts/
│   ├── dev-seed.js             # Standalone seeder for dev/testing
│   ├── test-smoke.ps1          # Windows smoke test
│   └── test-smoke.sh           # Linux/macOS smoke test
├── e2e/                        # Playwright tests (API + UI)
├── docker-compose.yml
├── nodemon.json
└── .github/workflows/ci.yml   # CI — smoke tests + E2E on every push
```

---

## API endpoints

All routes except `/api/auth/*` require a `Bearer` token in the `Authorization` header.

### Auth

```
POST  /api/auth/register     → { token, user }
POST  /api/auth/login        → { token, user }
GET   /api/auth/me           → { id, name, email }
```

### Workflows

```
GET    /api/workflows                          → list all your workflows
POST   /api/workflows                          → create a new workflow
GET    /api/workflows/:id                      → get one workflow with nodes
PUT    /api/workflows/:id                      → update name/description
DELETE /api/workflows/:id                      → delete workflow

POST   /api/workflows/:id/nodes               → add a node
PUT    /api/workflows/:id/nodes/:nodeId        → update a node's config
DELETE /api/workflows/:id/nodes/:nodeId        → remove a node
PATCH  /api/workflows/:id/nodes/reorder        → reorder nodes by id array

POST   /api/workflows/:id/run                  → start execution → 202 + runId
GET    /api/workflows/:id/runs                 → list runs for this workflow
```

### Runs

```
GET   /api/runs                → all your runs across all workflows
GET   /api/runs/:id            → full run detail with step-by-step results
POST  /api/runs/:id/approve    → approve or reject a pending approval
```

### Templates & Dashboard

```
GET   /api/workflows/templates              → list starter templates
POST  /api/workflows/from-template/:id      → clone a template
GET   /api/workflows/dashboard/stats        → workflow count, run count, success rate
```

---

## How the workflow engine works

This was the most interesting part to build. When you hit "Run" on a workflow:

1. A new `Run` document is created in MongoDB with status `running`
2. The runner loads the workflow and iterates through nodes in order
3. For each node, it creates a step entry, executes the node's logic, and records the result
4. If a node is an **approval**, execution pauses — the run status becomes `waiting_approval` and it saves to the database. When someone approves via the API, the runner picks up from where it left off
5. If any node fails, the run is marked `failed` with the error message
6. Once all nodes complete, the run is marked `completed` with the total duration

The runner supports these execution types:
- **trigger** — logs the start timestamp
- **text** — returns the configured message string
- **delay** — waits using `setTimeout` wrapped in a promise
- **http** — uses Node.js native `fetch` to make real HTTP calls
- **condition** — evaluates field-operator-value against previous output
- **approval** — saves state and exits, resumes on `POST /approve`

There's also a BullMQ queue publisher wired up. Right now execution runs in-process, but the architecture is set up so you could push runs to Redis and have separate worker processes handle them. I documented the plan in [docs/QUEUE_PLAN.md](docs/QUEUE_PLAN.md).

---

## Dark mode

I implemented dark mode using Tailwind's `class` strategy. There's a `ThemeContext` that reads from `localStorage` on first load (falls back to the system's `prefers-color-scheme`), and a toggle button in the sidebar. Every single component and page has dark variants — I went through all of them manually.

---

## Testing

### Smoke tests

```bash
# Windows
.\scripts\test-smoke.ps1

# Linux / macOS
./scripts/test-smoke.sh
```

These start the backend, hit the health endpoint, register a user, login, and fetch workflows. Quick sanity check.

### E2E with Playwright

```bash
cd e2e
npm install
npx playwright install --with-deps
npx playwright test
```

### CI

The GitHub Actions workflow runs on every push to `main` — it starts MongoDB as a service, boots the backend, runs smoke tests, then builds the frontend and runs Playwright E2E tests.

---

## Security notes

- Passwords are hashed with bcrypt (10 rounds) and never stored in plain text
- JWT tokens expire after 7 days
- Auth routes are rate-limited (20 requests per 15-minute window)
- CORS is restricted to `FRONTEND_URL` in production
- The Axios interceptor auto-attaches the token to every request and logs the user out on 401 responses
- Frontend routes are wrapped in a `ProtectedRoute` component that redirects to login if there's no valid session

---

## What I'd do next

If I were to keep building on this:

- **Webhooks** — trigger workflows from external services via webhook URL
- **Parallel branches** — let condition nodes fork into parallel paths
- **Versioning** — save workflow versions so you can roll back
- **Notifications** — email/Slack when a run completes or needs approval
- **Execution logs** — persistent logs with search and filtering
- **Role-based access** — team workspaces with admin/editor/viewer roles

---

## License

MIT — see [LICENSE](LICENSE).

---

Built by [Nivedhaasai](https://github.com/Nivedhaasai)

