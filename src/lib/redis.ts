import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL!;

if (!REDIS_URL) {
  throw new Error('Please define the REDIS_URL environment variable inside .env');
}

let cached = global as any;
cached.redis = cached.redis || { client: null, promise: null };

export async function connectToRedis() {
  if (cached.redis.client) {
    return cached.redis.client;
  }

  if (!cached.redis.promise) {
    cached.redis.promise = createClient({
      url: REDIS_URL
    }).connect();
  }

  try {
    cached.redis.client = await cached.redis.promise;
  } catch (e) {
    cached.redis.promise = null;
    throw e;
  }

  return cached.redis.client;
} 