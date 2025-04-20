import mongoose from 'mongoose';
import { Feed } from '@/models/feed.model';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createFeed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB Atlas');

    // Create a new feed
    const feed = await Feed.create({
      url: 'https://lexfridman.com/feed/podcast/',
      title: 'Lex Fridman Podcast',
      description: 'Lex Fridman Podcast RSS Feed',
      fetchInterval: 60, // 1 hour
      isActive: true,
      userId: 'system', // or your user ID
    });

    console.log('Created feed:', feed);
    console.log('Feed ID:', feed._id);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createFeed(); 