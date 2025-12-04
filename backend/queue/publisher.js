const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const DISABLE_QUEUE = process.env.DISABLE_QUEUE === 'true' || process.env.DISABLE_QUEUE === '1';

if (DISABLE_QUEUE) {
  console.log('DISABLE_QUEUE is set; queue producer disabled')
  module.exports = {
    enqueueRun: async () => {
      throw new Error('Queue is disabled via DISABLE_QUEUE env var')
    },
    isQueueEnabled: false,
  }
} else {
  const REDIS_URL = process.env.REDIS_URL || null;
  const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
  const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

  let connection;
  try {
    connection = REDIS_URL ? new IORedis(REDIS_URL) : new IORedis({ host: REDIS_HOST, port: REDIS_PORT });
  } catch (e) {
    console.error('Failed to create Redis connection for queue:', e?.message || e);
    connection = null;
  }

  const isQueueEnabled = !!connection;

  let queue = null;
  if (isQueueEnabled) {
    queue = new Queue('workflow-runs', { connection });
  }

  async function enqueueRun(workflowId, userId, runId) {
    if (!isQueueEnabled) throw new Error('Queue is not configured');
    // job name 'run' with payload
    return queue.add('run', { workflowId, userId, runId }, { removeOnComplete: 1000, removeOnFail: 1000 });
  }

  module.exports = { enqueueRun, isQueueEnabled };
}
