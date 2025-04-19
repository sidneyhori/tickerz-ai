import { Schema, model, models } from 'mongoose';
import { ContentItem as ContentItemType } from '../types/models';

const contentItemSchema = new Schema<ContentItemType>({
  sourceType: {
    type: String,
    required: true,
    enum: ['rss', 'stock', 'calendar', 'weather'],
  },
  sourceId: {
    type: String,
    required: true,
  },
  rawData: {
    type: Schema.Types.Mixed,
    required: true,
  },
  summary: {
    type: String,
  },
  metadata: {
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    publishedAt: { type: Date, required: true },
    author: String,
    url: String,
  },
  displayCount: {
    type: Number,
    default: 0,
  },
  lastShownAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
contentItemSchema.index({ sourceType: 1, sourceId: 1 });
contentItemSchema.index({ 'metadata.publishedAt': -1 });
contentItemSchema.index({ lastShownAt: 1 });

export const ContentItem = models.ContentItem || model<ContentItemType>('ContentItem', contentItemSchema); 