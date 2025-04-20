import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ContentItem } from '@/models/ContentItem';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function purgeContentItems() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete all content items
    const result = await ContentItem.deleteMany({});
    console.log(`Deleted ${result.deletedCount} content items`);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error purging content items:', error);
    process.exit(1);
  }
}

purgeContentItems(); 