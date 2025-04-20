import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Feed } from '@/models/feed.model';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkFeeds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all feeds
    const feeds = await Feed.find({});
    console.log(`Found ${feeds.length} feeds:`);
    
    feeds.forEach((feed, index) => {
      console.log(`\n${index + 1}. Feed Details:`);
      console.log(`ID: ${feed._id}`);
      console.log(`Title: ${feed.title}`);
      console.log(`URL: ${feed.url}`);
      console.log(`Description: ${feed.description || 'N/A'}`);
      console.log(`Last Fetched: ${feed.lastFetched || 'Never'}`);
      console.log(`Fetch Interval: ${feed.fetchInterval} minutes`);
      console.log(`Is Active: ${feed.isActive}`);
      console.log(`User ID: ${feed.userId}`);
      console.log('----------------------------------------');
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error checking feeds:', error);
    process.exit(1);
  }
}

checkFeeds(); 