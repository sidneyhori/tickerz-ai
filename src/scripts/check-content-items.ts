import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ContentItem } from '@/models/ContentItem';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkContentItems() {
  try {
    // Connect to MongoDB using URI from .env.local
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Count total content items
    const totalItems = await ContentItem.countDocuments();
    console.log(`Total content items: ${totalItems}`);

    // Count items by source type
    const itemsBySource = await ContentItem.aggregate([
      { $group: { _id: '$sourceType', count: { $sum: 1 } } }
    ]);
    console.log('Items by source type:', itemsBySource);

    // Count items with summaries
    const itemsWithSummaries = await ContentItem.countDocuments({ summary: { $exists: true, $ne: null } });
    console.log(`Items with summaries: ${itemsWithSummaries}`);

    // Count items with sentiment
    const itemsWithSentiment = await ContentItem.countDocuments({ 'metadata.sentiment': { $exists: true, $ne: null } });
    console.log(`Items with sentiment: ${itemsWithSentiment}`);

    process.exit(0);
  } catch (error) {
    console.error('Error checking content items:', error);
    process.exit(1);
  }
}

checkContentItems(); 