import { QueueOptions } from 'bull';

export const defaultQueueConfig: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100, // Keep the last 100 completed jobs
    },
    removeOnFail: false,
  },
};

export const QUEUE_NAMES = {
  RSS_FETCH: 'rss-fetch',
  RSS_PROCESS: 'rss-process',
  RSS_SUMMARY: 'rss-summary',
} as const;

export const JOB_TYPES = {
  FETCH_FEED: 'fetch-feed',
  PROCESS_FEED: 'process-feed',
  SUMMARIZE_CONTENT: 'summarize-content',
} as const;

export const CACHE_TTL = {
  FEED_CONTENT: 60 * 60, // 1 hour
  FEED_SUMMARY: 24 * 60 * 60, // 24 hours
} as const; 