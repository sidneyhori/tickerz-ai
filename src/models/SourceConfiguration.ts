import { Schema, model, models } from 'mongoose';
import { SourceConfiguration as SourceConfigurationType } from '../types/models';

const sourceConfigurationSchema = new Schema<SourceConfigurationType>({
  type: {
    type: String,
    required: true,
    enum: ['rss', 'stock', 'calendar', 'weather'],
  },
  name: {
    type: String,
    required: true,
  },
  config: {
    type: Schema.Types.Mixed,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSyncAt: {
    type: Date,
  },
  syncInterval: {
    type: Number,
    required: true,
    default: 15, // minutes
  },
}, {
  timestamps: true,
});

// Add validation based on source type
sourceConfigurationSchema.pre('save', function(next) {
  const config = this.config;
  
  switch (this.type) {
    case 'rss':
      if (!config.url) {
        next(new Error('RSS source must have a URL'));
        return;
      }
      break;
      
    case 'stock':
      if (!config.symbols || !Array.isArray(config.symbols)) {
        next(new Error('Stock source must have an array of symbols'));
        return;
      }
      break;
      
    case 'calendar':
      if (!config.calendarId) {
        next(new Error('Calendar source must have a calendar ID'));
        return;
      }
      break;
      
    case 'weather':
      if (!config.location) {
        next(new Error('Weather source must have a location'));
        return;
      }
      break;
  }
  
  next();
});

// Index for efficient querying
sourceConfigurationSchema.index({ type: 1, isActive: 1 });
sourceConfigurationSchema.index({ lastSyncAt: 1 });

export const SourceConfiguration = models.SourceConfiguration || 
  model<SourceConfigurationType>('SourceConfiguration', sourceConfigurationSchema); 