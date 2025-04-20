import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ContentItem } from '@/models/ContentItem';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkSummaries() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all content items with summaries
    const items = await ContentItem.find({ 
      summary: { $exists: true, $ne: null } 
    }).sort({ 'metadata.publishedAt': -1 }).limit(5).lean();

    console.log('\nLatest 5 content items with summaries:');
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.metadata.title}`);
      console.log(`Published: ${new Date(item.metadata.publishedAt).toLocaleString()}`);
      console.log(`URL: ${item.metadata.url}`);
      console.log('\nSummary:');
      console.log(item.summary);
      console.log('\nKey Points:');
      console.log(item.keyPoints?.join('\n- '));
      console.log('\nSentiment:', item.metadata.sentiment);
      console.log('----------------------------------------');
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error checking summaries:', error);
    process.exit(1);
  }
}

checkSummaries(); 