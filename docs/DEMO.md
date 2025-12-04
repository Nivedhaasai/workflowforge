# Demo Script — 3 minute walkthrough

This document helps you demo WorkflowForge to recruiters or interviewers in ~3 minutes.

1. Start the stack (Docker recommended):

```powershell
docker compose up --build -d
```

2. Open the frontend: `http://localhost:5173`

3. Login with the seeded dev account (or register a new one):

- Email: `devtester+1@example.com`
- Password: `Password123!`

4. Quick tour (30s):
- `Workflows` list — shows your workflows.
- Create a new workflow or open the seeded `Dev Seed Workflow`.
- The Builder lets you drag/drop nodes, edit node configs, and reorder steps.

5. Run a workflow (30s):
- Open the Builder and click `Run Workflow`.
- Open `Run History` to observe the run progress and click `View details` to inspect per-step outputs and errors.

6. Show the architecture (30s):
- Backend: Node.js + Express + MongoDB (runs persisted in `runs` collection).
- Runner: In-process worker that persists step results; can be upgraded to a queue-based worker (BullMQ + Redis) for scaling.

7. Closing notes (20s):
- Mention CI smoke tests and Playwright E2E coverage (see `.github/workflows/ci.yml` and `e2e/`).
- Offer to show the code for the runner, the Run model, or the Builder UI on request.
