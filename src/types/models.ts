import { DefaultSession } from 'next-auth';

// Extend the default session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export interface UserSettings {
  rssFeeds: {
    enabled: boolean;
    refreshInterval: number; // in minutes
    maxItems: number;
    sources: string[];
  };
  stockTickers: {
    enabled: boolean;
    refreshInterval: number; // in minutes
    symbols: string[];
    displayMode: 'compact' | 'detailed';
  };
  calendars: {
    enabled: boolean;
    refreshInterval: number; // in minutes
    sources: string[];
    displayMode: 'list' | 'grid';
  };
  weather: {
    enabled: boolean;
    refreshInterval: number; // in minutes
    location: string;
    units: 'metric' | 'imperial';
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    layout: 'grid' | 'list';
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: string;
  sourceType: 'rss' | 'stock' | 'calendar' | 'weather';
  sourceId: string;
  rawData: Record<string, any>;
  summary?: string;
  metadata: {
    title: string;
    description?: string;
    imageUrl?: string;
    publishedAt: Date;
    author?: string;
    url?: string;
  };
  displayCount: number;
  lastShownAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceConfiguration {
  id: string;
  type: 'rss' | 'stock' | 'calendar' | 'weather';
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  syncInterval: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Type guards
export function isRssSource(config: SourceConfiguration): config is SourceConfiguration & { type: 'rss' } {
  return config.type === 'rss';
}

export function isStockSource(config: SourceConfiguration): config is SourceConfiguration & { type: 'stock' } {
  return config.type === 'stock';
}

export function isCalendarSource(config: SourceConfiguration): config is SourceConfiguration & { type: 'calendar' } {
  return config.type === 'calendar';
}

export function isWeatherSource(config: SourceConfiguration): config is SourceConfiguration & { type: 'weather' } {
  return config.type === 'weather';
} 