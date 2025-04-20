import { Job } from 'bull';
import { QUEUE_NAMES, JOB_TYPES, CACHE_TTL } from './config';
import { QueueManager } from './queue-manager';
import { Feed } from '@/models/feed.model';
import { ContentItem } from '@/models/ContentItem';
import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { Redis } from 'ioredis';
import mongoose from 'mongoose';
import { OpenAIService } from '@/services/openai.service';
import winston from 'winston';
import path from 'path';

const queueManager = QueueManager.getInstance();
const parseXml = promisify(parseString);
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Winston logger setup
const logDir = path.join(process.cwd(), 'logs');
// @ts-ignore: If you see a type error for winston, run: npm install --save-dev @types/winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'worker-trace.log'), maxsize: 10485760, maxFiles: 5 })
  ]
});

// RSS Fetch Worker
const fetchQueue = queueManager.getQueue(QUEUE_NAMES.RSS_FETCH);
fetchQueue.process(JOB_TYPES.FETCH_FEED, async (job: Job) => {
  const { feedId, feedUrl } = job.data;
  try {
    logger.info(`Processing fetch job for feed ${feedId} (${feedUrl})`);
    
    // Convert feedId to ObjectId
    const feedObjectId = new mongoose.Types.ObjectId(feedId);

    // Check cache first
    const cachedContent = await redis.get(`feed:${feedId}`);
    if (cachedContent) {
      logger.info(`Using cached content for feed ${feedId}`);
      return JSON.parse(cachedContent);
    }

    logger.info(`Fetching feed from ${feedUrl}`);
    const response = await axios.get(feedUrl);
    const feedContent = await parseXml(response.data);
    
    // Cache the content
    await redis.setex(
      `feed:${feedId}`,
      CACHE_TTL.FEED_CONTENT,
      JSON.stringify(feedContent)
    );

    // Update last fetched timestamp
    await Feed.findByIdAndUpdate(feedObjectId, { lastFetched: new Date() });

    // Add to processing queue
    logger.info('Adding feed to processing queue');
    await queueManager.addFeedProcessJob(feedId, feedContent);
    
    logger.info(`Successfully processed fetch job for feed ${feedId}`);
    return { feedId, content: feedContent };
  } catch (error) {
    logger.error(`Failed to fetch feed ${feedUrl}:`, error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
});

// RSS Process Worker
const processQueue = queueManager.getQueue(QUEUE_NAMES.RSS_PROCESS);
processQueue.process(JOB_TYPES.PROCESS_FEED, async (job: Job) => {
  const { feedId, content } = job.data;
  try {
    logger.info(`Processing feed content for feed ${feedId}`);
    logger.info('Feed content structure:', JSON.stringify(content, null, 2));
    
    if (!content?.rss?.channel?.[0]?.item) {
      throw new Error('Invalid feed content structure');
    }
    
    // Process each item in the feed
    const items = content.rss.channel[0].item;
    logger.info(`Found ${items.length} items to process`);

    for (const item of items) {
      const guid = item.guid?.[0]?._ || item.guid?.[0] || item.link?.[0];
      if (!guid) {
        logger.warn('Item missing guid:', item);
        continue;
      }
      
      const contentId = `${feedId}:${guid}`;
      logger.info(`Processing item ${contentId}`);
      
      // Check if we already have this item in MongoDB
      const existingItem = await ContentItem.findOne({ 
        sourceType: 'rss',
        sourceId: contentId
      });

      if (!existingItem) {
        logger.info(`Creating new content item: ${contentId}`);
        const title = item.title?.[0] || '';
        const description = item.description?.[0] || '';
        const imageUrl = item['media:content']?.[0]?.$?.url || 
                        item['media:thumbnail']?.[0]?.$?.url || 
                        item.enclosure?.[0]?.$?.url;
        const publishedAt = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date();
        const author = item.author?.[0] || item['dc:creator']?.[0] || 'Unknown';
        const url = item.link?.[0] || '';
        
        logger.info('Item metadata:', {
          title,
          description: description.substring(0, 100) + '...',
          imageUrl,
          publishedAt,
          author,
          url
        });
        
        // Store the item in MongoDB
        const contentItem = await ContentItem.create({
          sourceType: 'rss',
          sourceId: contentId,
          rawData: item,
          metadata: {
            title,
            description,
            imageUrl,
            publishedAt,
            author,
            url,
            sentiment: 'neutral'
          }
        });
        
        logger.info(`Created content item with ID: ${contentItem._id}`);

        // Add to summary queue
        logger.info(`Adding content ${contentId} to summary queue`);
        const summaryContent = `${title}\n\n${description}`;
        logger.info(`Summary content length: ${summaryContent.length}`);
        const summaryJob = await queueManager.addContentSummaryJob(
          contentId,
          summaryContent
        );
        logger.info(`Summary job added with ID: ${summaryJob.id}`);
      } else {
        logger.info(`Item ${contentId} already exists, skipping`);
      }
    }
    
    logger.info(`Successfully processed all items for feed ${feedId}`);
    return { processed: items.length };
  } catch (error) {
    logger.error(`Failed to process feed ${feedId}:`, error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
});

// Content Summary Worker
const summaryQueue = queueManager.getQueue(QUEUE_NAMES.RSS_SUMMARY);
summaryQueue.on('active', (job) => {
  logger.info(`Summary job ${job.id} has started processing`);
});

summaryQueue.on('completed', (job, result) => {
  logger.info(`Summary job ${job.id} has completed with result:`, result);
});

summaryQueue.on('failed', (job, error) => {
  logger.error(`Summary job ${job.id} has failed:`, error);
});

summaryQueue.on('error', (error) => {
  logger.error('Summary queue error:', error);
});

summaryQueue.process(JOB_TYPES.SUMMARIZE_CONTENT, async (job: Job) => {
  const { contentId, content } = job.data;
  try {
    logger.info(`Processing summary for content ${contentId}`);
    logger.info(`Content length: ${content.length}`);
    logger.info(`Content: ${content.substring(0, 100)}...`);
    
    // Get OpenAI service instance
    logger.info('Initializing OpenAI service...');
    const openaiService = OpenAIService.getInstance();
    logger.info('OpenAI service initialized');
    
    // Generate summary using OpenAI
    logger.info('Generating summary with OpenAI');
    const { summary, keyPoints, sentiment } = await openaiService.summarizeContent(content);
    logger.info('OpenAI Response:', {
      summary,
      keyPoints,
      sentiment,
      contentLength: content.length,
      summaryLength: summary.length,
      keyPointsCount: keyPoints.length
    });

    // Cache the summary
    logger.info('Caching summary in Redis');
    await redis.setex(
      `summary:${contentId}`,
      CACHE_TTL.FEED_SUMMARY,
      JSON.stringify({
        contentId,
        summary,
        keyPoints,
        sentiment,
        timestamp: new Date().toISOString()
      })
    );
    logger.info('Summary cached in Redis');

    // Update the content item in MongoDB with the summary
    logger.info('Updating content item in MongoDB');
    logger.info('Searching for content item with sourceId:', contentId);
    const result = await ContentItem.findOneAndUpdate(
      { sourceId: contentId },
      { 
        $set: {
          summary,
          'metadata.sentiment': sentiment
        }
      },
      { new: true } // Return the updated document
    );
    logger.info('MongoDB Update Result:', {
      success: !!result,
      contentId,
      summary: result?.summary,
      sentiment: result?.metadata?.sentiment,
      error: !result ? 'Failed to find content item' : null
    });

    if (!result) {
      logger.error('Failed to find content item with sourceId:', contentId);
      throw new Error(`Content item not found: ${contentId}`);
    }

    logger.info(`Successfully processed summary for content ${contentId}`);
    return {
      contentId,
      summary,
      keyPoints,
      sentiment
    };
  } catch (error) {
    logger.error(`Failed to summarize content ${contentId}:`, error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
});

// Error handling for all queues
[fetchQueue, processQueue, summaryQueue].forEach(queue => {
  queue.on('failed', (job: Job, error: Error) => {
    logger.error(`Job ${job.id} failed in queue ${queue.name}:`, error);
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  });
}); 