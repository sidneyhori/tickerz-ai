import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function clearCache() {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    console.log('Connected to Redis');
    console.log('Clearing all keys...');
    
    // Clear all keys
    await redis.flushall();
    
    console.log('Cache cleared successfully');
    await redis.quit();
  } catch (error) {
    console.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache(); 