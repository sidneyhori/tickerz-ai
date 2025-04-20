import Bull, { Queue } from 'bull';
import { QUEUE_NAMES, JOB_TYPES, defaultQueueConfig } from './config';

export class QueueManager {
  private static instance: QueueManager;
  private queues: Map<string, Queue>;

  private constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  private initializeQueues() {
    // Initialize queues with error handling
    Object.values(QUEUE_NAMES).forEach(queueName => {
      const queue = new Bull(queueName, defaultQueueConfig);
      
      // Add error handling
      queue.on('error', (error) => {
        console.error(`Queue ${queueName} error:`, error);
      });

      queue.on('failed', (job, error) => {
        console.error(`Job ${job.id} in queue ${queueName} failed:`, error);
      });

      queue.on('stalled', (job) => {
        console.warn(`Job ${job.id} in queue ${queueName} is stalled`);
      });

      this.queues.set(queueName, queue);
    });
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  public getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue ${name} not found`);
    }
    return queue;
  }

  public async addFeedFetchJob(feedId: string, feedUrl: string) {
    const queue = this.getQueue(QUEUE_NAMES.RSS_FETCH);
    return queue.add(JOB_TYPES.FETCH_FEED, { feedId, feedUrl }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  public async addFeedProcessJob(feedId: string, content: any) {
    const queue = this.getQueue(QUEUE_NAMES.RSS_PROCESS);
    return queue.add(JOB_TYPES.PROCESS_FEED, { feedId, content });
  }

  public async addContentSummaryJob(contentId: string, content: string) {
    const queue = this.getQueue(QUEUE_NAMES.RSS_SUMMARY);
    return queue.add(JOB_TYPES.SUMMARIZE_CONTENT, { contentId, content });
  }

  public async closeAll() {
    const closePromises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(closePromises);
  }

  public async getQueueStats() {
    const stats: Record<string, any> = {};
    for (const [name, queue] of this.queues) {
      stats[name] = {
        waiting: await queue.getWaitingCount(),
        active: await queue.getActiveCount(),
        completed: await queue.getCompletedCount(),
        failed: await queue.getFailedCount(),
        delayed: await queue.getDelayedCount(),
      };
    }
    return stats;
  }
} 