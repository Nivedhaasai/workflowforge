<div align="center">

# 🔀 WorkflowForge

**Visual workflow automation platform — design, execute, and monitor multi-step automations in minutes.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ What is WorkflowForge?

WorkflowForge is a **Kissflow-inspired** SaaS workflow automation platform that lets teams design, run, and monitor multi-step workflows through a beautiful drag-and-drop interface. Built as a production-quality full-stack application demonstrating modern web architecture patterns.

### Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Workflow Builder** | Drag-and-drop canvas with 7 node types across 4 categories |
| ▶️ **One-Click Execution** | Run workflows instantly with real-time step-by-step progress |
| ✅ **Human-in-the-Loop Approvals** | Pause workflows at approval gates — approve or reject from the UI |
| 📊 **Dashboard & Analytics** | Live stats — total workflows, runs, success rates, pending approvals |
| 📋 **Pre-Built Templates** | Clone from a library of starter workflows to get productive fast |
| 🔐 **JWT Authentication** | Secure user accounts with token-based auth |
| 🐳 **Docker-Ready** | One-command deployment with Docker Compose |

### Supported Node Types

| Category | Nodes | Description |
|----------|-------|-------------|
| **Triggers** | `trigger` | Entry point — starts the workflow |
| **Actions** | `text`, `http`, `delay` | Output text, make HTTP requests, wait N seconds |
| **Logic** | `condition`, `transform` | Branch on conditions, transform data with templates |
| **Approvals** | `approval` | Pause for human review — approve or reject |

---

## 🖥️ Screenshots

| Dashboard | Workflow Builder | Run Details |
|:---------:|:----------------:|:-----------:|
| Stats, recent runs, quick actions | Drag-and-drop with node inspector | Step timeline with live status |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (for native `fetch` support)
- **MongoDB** running locally or via connection string
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/Nivedhaasai/workflowforge.git
cd workflowforge
npm ci
cd frontend && npm ci && cd ..
```

### 2. Configure Environment

Create `.env` in the project root:

```env
MONGO_URI=mongodb://localhost:27017/workflowforge
JWT_SECRET=your_secure_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Sample Data

```bash
node scripts/dev-seed.js
```

> **Demo credentials:** `devtester+1@example.com` / `Password123!`

### 4. Start Development Servers

```bash
# Terminal 1 — Backend API
node index.js

# Terminal 2 — Frontend (Vite dev server)
cd frontend && npm run dev
```

Open **http://localhost:5173** and log in.

---

## 🐳 Docker Deployment

```bash
docker compose up --build -d
```

| Service | Port | Description |
|---------|------|-------------|
| Frontend | `5173` | Nginx serving React SPA |
| Backend | `5000` | Express API server |
| MongoDB | `27017` | Database |

The frontend Dockerfile includes nginx SPA routing — all client-side routes work on page refresh.

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <token>` except auth routes.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login — returns JWT |

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workflows` | List user's workflows |
| `POST` | `/api/workflows` | Create a workflow |
| `GET` | `/api/workflows/:id` | Get workflow details |
| `PUT` | `/api/workflows/:id` | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |
| `POST` | `/api/workflows/:id/run` | Execute a workflow (returns `202` + `runId`) |
| `GET` | `/api/workflows/:id/runs` | List runs for a workflow |

### Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/runs/:id` | Get run details with per-step results |
| `POST` | `/api/runs/:id/approve` | Approve or reject a pending approval step |

### Templates & Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workflows/templates` | List available templates |
| `POST` | `/api/workflows/from-template/:id` | Clone a template as a new workflow |
| `GET` | `/api/workflows/dashboard/stats` | Dashboard statistics |

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React SPA  │────▶│  Express API │────▶│   MongoDB    │
│  (Vite + TW) │     │  (REST/JWT)  │     │  (Mongoose)  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │   Workflow    │
                     │   Runner     │
                     │ (sequential) │
                     └──────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4, Framer Motion, @dnd-kit |
| **Backend** | Node.js 20, Express, Mongoose, JWT (jsonwebtoken) |
| **Database** | MongoDB 6.0 |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions CI |
| **Testing** | Playwright (E2E), smoke scripts |

### Project Structure

```
workflowforge/
├── index.js                 # Express entry point
├── models/                  # Mongoose schemas (User, Workflow, Run)
├── routes/                  # API routes (auth, workflows, runs)
├── middleware/               # JWT auth middleware
├── backend/
│   ├── services/            # Workflow runner engine
│   └── queue/               # Queue publisher (BullMQ-ready)
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route pages (Dashboard, Builder, etc.)
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── services/        # API client functions
│   │   └── utils/           # Axios instance + helpers
│   ├── nginx.conf           # SPA routing config
│   └── Dockerfile           # Multi-stage build
├── docker-compose.yml       # Full-stack orchestration
├── scripts/                 # Dev seed, smoke tests
└── e2e/                     # Playwright E2E tests
```

---

## 🧪 Testing

### Smoke Tests

```bash
# PowerShell (Windows)
.\scripts\test-smoke.ps1

# Bash (macOS / Linux / WSL)
./scripts/test-smoke.sh
```

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npx playwright install --with-deps
npx playwright test
```

---

## 🔒 Security

- JWT tokens stored in `localStorage` with `Bearer` auth header
- CORS restricted to `FRONTEND_URL` origin
- Passwords hashed with bcrypt (10 salt rounds)
- Never commit `.env` — use environment variables in production

---

## 📈 Scaling Notes

The in-process sequential runner works well for demos and moderate workloads. For production scale:

- **Queue-based execution**: Push runs to Redis (BullMQ) and process with dedicated workers — see [QUEUE_PLAN.md](docs/QUEUE_PLAN.md)
- **Horizontal scaling**: Separate API and worker processes behind a load balancer
- **Static hosting**: Serve the built frontend from a CDN (Cloudflare, Vercel, Netlify)
- **Database**: Add MongoDB indexes on `workflow.user`, `run.workflow`, `run.status`

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/Nivedhaasai">Nivedhaasai</a></strong>
</div>

