import { QueueManager } from '@/lib/queue/queue-manager';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

// Connect to MongoDB with retry logic
async function connectMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

async function startWorkers() {
  try {
    // Ensure MongoDB is connected
    await connectMongoDB();

    // Ensure Redis is connected
    await redis.ping();
    console.log('Connected to Redis');

    // Import and initialize workers after connections are established
    await import('@/lib/queue/workers');
    
    const queueManager = QueueManager.getInstance();
    console.log('RSS Feed Workers started. Press Ctrl+C to exit.');

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing queues and connections...');
      await queueManager.closeAll();
      await mongoose.connection.close();
      await redis.quit();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received. Closing queues and connections...');
      await queueManager.closeAll();
      await mongoose.connection.close();
      await redis.quit();
      process.exit(0);
    });

  } catch (err) {
    console.error('Failed to start workers:', err);
    process.exit(1);
  }
}

startWorkers(); 