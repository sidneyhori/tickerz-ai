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

const queueManager = QueueManager.getInstance();
const parseXml = promisify(parseString);
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// RSS Fetch Worker
const fetchQueue = queueManager.getQueue(QUEUE_NAMES.RSS_FETCH);
fetchQueue.process(JOB_TYPES.FETCH_FEED, async (job: Job) => {
  const { feedId, feedUrl } = job.data;
  try {
    console.log(`Processing fetch job for feed ${feedId} (${feedUrl})`);
    
    // Convert feedId to ObjectId
    const feedObjectId = new mongoose.Types.ObjectId(feedId);

    // Check cache first
    const cachedContent = await redis.get(`feed:${feedId}`);
    if (cachedContent) {
      console.log(`Using cached content for feed ${feedId}`);
      return JSON.parse(cachedContent);
    }

    console.log(`Fetching feed from ${feedUrl}`);
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
    await queueManager.addFeedProcessJob(feedId, feedContent);
    
    console.log(`Successfully processed fetch job for feed ${feedId}`);
    return feedContent;
  } catch (error) {
    console.error(`Failed to fetch feed ${feedUrl}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', {
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
    console.log(`Processing feed content for feed ${feedId}`);
    
    // Process each item in the feed
    const items = content.rss.channel[0].item;
    console.log(`Found ${items.length} items to process`);

    for (const item of items) {
      const guid = item.guid[0]._ || item.guid[0];
      const contentId = `${feedId}:${guid}`;
      
      // Check if we already have this item in MongoDB
      const existingItem = await ContentItem.findOne({ 
        sourceType: 'rss',
        sourceId: contentId
      });

      if (!existingItem) {
        console.log(`Creating new content item: ${contentId}`);
        // Store the item in MongoDB
        await ContentItem.create({
          sourceType: 'rss',
          sourceId: contentId,
          rawData: item,
          metadata: {
            title: item.title[0],
            description: item.description?.[0],
            imageUrl: item['media:content']?.[0]?.$?.url || item['media:thumbnail']?.[0]?.$?.url || item.enclosure?.[0]?.$?.url,
            publishedAt: new Date(item.pubDate[0]),
            author: item.author?.[0] || item['dc:creator']?.[0],
            url: item.link[0]
          }
        });

        // Add to summary queue
        console.log(`Adding content ${contentId} to summary queue`);
        await queueManager.addContentSummaryJob(
          contentId,
          `${item.title[0]}\n\n${item.description?.[0] || ''}`
        );
      }
    }
    
    console.log(`Successfully processed feed ${feedId}`);
    return { processedItems: items.length };
  } catch (error) {
    console.error(`Failed to process feed ${feedId}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', {
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
summaryQueue.process(JOB_TYPES.SUMMARIZE_CONTENT, async (job: Job) => {
  const { contentId, content } = job.data;
  try {
    console.log(`Processing summary for content ${contentId}`);
    
    // Get OpenAI service instance
    const openaiService = OpenAIService.getInstance();
    
    // Generate summary using OpenAI
    const { summary, keyPoints, sentiment } = await openaiService.summarizeContent(content);

    // Cache the summary
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

    // Update the content item in MongoDB with the summary
    await ContentItem.findOneAndUpdate(
      { sourceId: contentId },
      { 
        $set: {
          summary,
          'metadata.sentiment': sentiment
        }
      }
    );

    console.log(`Successfully processed summary for content ${contentId}`);
    return {
      contentId,
      summary,
      keyPoints,
      sentiment
    };
  } catch (error) {
    console.error(`Failed to summarize content ${contentId}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', {
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
    console.error(`Job ${job.id} failed in queue ${queue.name}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  });
}); 