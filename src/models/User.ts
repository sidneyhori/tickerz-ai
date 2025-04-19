import { Schema, model, models } from 'mongoose';
import { User as UserType, UserSettings } from '../types/models';

const userSettingsSchema = new Schema<UserSettings>({
  rssFeeds: {
    enabled: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 15 },
    maxItems: { type: Number, default: 10 },
    sources: [{ type: String }],
  },
  stockTickers: {
    enabled: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 5 },
    symbols: [{ type: String }],
    displayMode: { type: String, enum: ['compact', 'detailed'], default: 'compact' },
  },
  calendars: {
    enabled: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 15 },
    sources: [{ type: String }],
    displayMode: { type: String, enum: ['list', 'grid'], default: 'list' },
  },
  weather: {
    enabled: { type: Boolean, default: true },
    refreshInterval: { type: Number, default: 30 },
    location: { type: String, default: '' },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  },
  display: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  },
});

const userSchema = new Schema<UserType>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  settings: { type: userSettingsSchema, default: () => ({}) },
}, {
  timestamps: true,
});

export const User = models.User || model<UserType>('User', userSchema); 