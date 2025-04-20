import mongoose from 'mongoose';

export interface IFeed extends mongoose.Document {
  url: string;
  title: string;
  description?: string;
  lastFetched?: Date;
  fetchInterval: number; // in minutes
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  lastFetched: Date,
  fetchInterval: {
    type: Number,
    default: 60, // 1 hour
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Add TTL index for feed content
feedSchema.index({ lastFetched: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // 24 hours

// Prevent model overwrite
const Feed = mongoose.models.Feed || mongoose.model<IFeed>('Feed', feedSchema);

export { Feed }; 