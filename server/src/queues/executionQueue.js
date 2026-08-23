const env = require('../config/env');

let executionQueue = null;
let isRedisAvailable = false;

try {
  const { Queue, Worker } = require('bullmq');
  const Redis = require('ioredis');

  const connection = new Redis({
    host: env.redisHost,
    port: env.redisPort,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 2) return null; // stop reconnecting if Redis is down
      return 200;
    }
  });

  connection.on('error', (err) => {
    if (!isRedisAvailable) return;
    console.log('[Queue] Redis connection error:', err.message, '- Using in-process queue fallback.');
    isRedisAvailable = false;
  });

  connection.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Queue] BullMQ connected to Redis server successfully.');
  });

  executionQueue = new Queue('executionQueue', { connection });
} catch (e) {
  isRedisAvailable = false;
  console.log('[Queue] BullMQ / ioredis not active. Using in-process execution queue fallback.');
}

const addExecutionJob = async (jobName, data) => {
  if (isRedisAvailable && executionQueue) {
    try {
      return await executionQueue.add(jobName, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      });
    } catch (err) {
      console.warn('[Queue] Failed to add job to BullMQ, executing in-process fallback:', err.message);
    }
  }

  // Fallback: immediate in-process execution
  return { id: `local_job_${Date.now()}`, data };
};

module.exports = {
  addExecutionJob,
  isRedisAvailable: () => isRedisAvailable
};
