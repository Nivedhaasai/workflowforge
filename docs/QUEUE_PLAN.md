# Runner Scaling & Queueing Plan

Goal: make workflow execution robust and scalable for production workloads.

Options:

- In-process runner (current): simple, fast for short jobs, limited by single Node process memory/CPU.
- External queue + workers (recommended for production): use Redis + BullMQ to enqueue runs and run workers separately.

Recommended architecture:

1. API receives `POST /api/workflows/:id/run` and creates a `Run` document (status `queued`).
2. Push a job into Redis/Bull queue with `runId` and `workflowId`.
3. Worker processes (horizontally scalable) consume jobs and execute nodes, updating the `Run` doc per-step.
4. Use sensible timeouts and retries for network nodes (HTTP nodes), and allow configuring concurrency per-worker.

Implementation notes:

- Add `bullmq` worker service and a `queue` module that abstracts enqueueing and worker handlers.
- Use Redis for lock/visibility and to coordinate workers.
- Add graceful shutdown and signal handling in workers to mark runs as `failed` or `stopped` if interrupted.
- Add monitoring (Prometheus metrics, logs) for job durations, failure rates, and queue latency.

Migration path (minimal changes):

1. Create a `queue/publish.js` helper that calls `queue.add('run', { runId, workflowId })` instead of calling runner directly.
2. Implement a small `worker.js` process that subscribes to the queue and calls the existing `runWorkflow` function (or a refactored worker-focused runner).
3. Keep the current in-process runner as a fallback for local/dev.

Security & throttling:

- Add per-user rate-limits for job submissions.
- Limit the maximum concurrent jobs per user or per organization.
