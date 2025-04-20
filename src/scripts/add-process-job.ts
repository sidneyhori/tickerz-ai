import dotenv from 'dotenv';
import { QueueManager } from '@/lib/queue/queue-manager';
import { QUEUE_NAMES, JOB_TYPES } from '@/lib/queue/config';
import { Redis } from 'ioredis';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function addProcessJob() {
  try {
    const queueManager = QueueManager.getInstance();
    const feedId = '68043ec31f8d03a8d5b9d5e0';

    // Get feed content from Redis
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    const content = await redis.get(`feed:${feedId}`);
    if (!content) {
      throw new Error(`Feed content not found in Redis for feed ID ${feedId}`);
    }

    const processQueue = queueManager.getQueue(QUEUE_NAMES.RSS_PROCESS);
    const job = await processQueue.add(JOB_TYPES.PROCESS_FEED, {
      feedId,
      content: JSON.parse(content)
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    console.log('Added process job with ID:', job.id);
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('Error adding process job:', error);
    process.exit(1);
  }
}

addProcessJob();