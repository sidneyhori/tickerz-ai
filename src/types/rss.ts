export interface RssFeedItem {
  title: string;
  description?: string;
  content?: string;
  link: string;
  pubDate: string;
  guid: string;
  categories: string[];
  author?: string;
  imageUrl?: string;
}

export interface RssFeed {
  title: string;
  description?: string;
  link: string;
  items: RssFeedItem[];
  lastBuildDate?: string;
  language?: string;
}

export interface RssFilterOptions {
  categories?: string[];
  keywords?: string[];
  maxAgeInHours?: number;
  minLength?: number;
  maxLength?: number;
}

export interface RssFetchOptions {
  url: string;
  timeout?: number;
  maxRedirects?: number;
  userAgent?: string;
}

export interface RssServiceError extends Error {
  code: 'FETCH_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
  details?: any;
} 