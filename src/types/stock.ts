export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  previousClose: number;
}

export interface StockHistoricalData {
  symbol: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose: number;
  }[];
}

export interface StockMetrics {
  symbol: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  beta: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface StockServiceError extends Error {
  code: 'API_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR';
  details?: any;
}

export interface StockServiceOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheDuration?: number; // in minutes
}

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y';

export interface StockFilterOptions {
  symbols: string[];
  interval?: '1min' | '5min' | '15min' | '30min' | '60min';
  timeRange?: TimeRange;
  includeMetrics?: boolean;
} 