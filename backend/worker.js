/*
  Simple BullMQ worker to consume 'workflow-runs' queue and execute runs
  Usage: set REDIS_URL (or REDIS_HOST/REDIS_PORT) and run `node backend/worker.js`
*/
require('dotenv').config();
const { Worker, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');
const { runWorkflow } = require('./services/workflowRunner');

const REDIS_URL = process.env.REDIS_URL || null;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

let connection;
try {
  connection = REDIS_URL ? new IORedis(REDIS_URL) : new IORedis({ host: REDIS_HOST, port: REDIS_PORT });
} catch (e) {
  console.error('Failed to create Redis connection for worker:', e?.message || e);
  process.exit(1);
}

// Ensure a QueueScheduler exists to handle stalled jobs
const scheduler = new QueueScheduler('workflow-runs', { connection });

const worker = new Worker(
  'workflow-runs',
  async (job) => {
    const { workflowId, userId, runId } = job.data || {};
    if (!workflowId || !runId) throw new Error('Invalid job payload');
    console.log(`Worker processing run ${runId} for workflow ${workflowId}`);
    // Execute the existing runner which updates the Run document
    await runWorkflow(workflowId, userId, runId);
    return { ok: true };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err?.message || err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err?.message || err);
});

console.log('✓ Worker started for queue: workflow-runs');

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await scheduler.close();
  process.exit(0);
});
