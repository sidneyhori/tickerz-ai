import { StockQuote, StockHistoricalData, StockMetrics, StockServiceError, StockServiceOptions, StockFilterOptions } from '@/types/stock';

export class StockService {
  private static instance: StockService;
  private options: StockServiceOptions;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  private constructor(options: StockServiceOptions) {
    this.options = {
      baseUrl: 'https://www.alphavantage.co/query',
      timeout: 10000,
      cacheDuration: 5, // 5 minutes default cache
      ...options
    };
  }

  public static getInstance(options: StockServiceOptions): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService(options);
    }
    return StockService.instance;
  }

  private async fetchFromAPI<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const url = new URL(this.options.baseUrl!);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append('apikey', this.options.apiKey);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        const error = new Error('API rate limit reached') as StockServiceError;
        error.code = 'RATE_LIMIT';
        error.details = data['Note'];
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        const stockError = new Error(error.message) as StockServiceError;
        stockError.code = 'NETWORK_ERROR';
        stockError.details = { url: url.toString(), error };
        throw stockError;
      }
      throw error;
    }
  }

  private getCacheKey(endpoint: string, params: Record<string, string>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private async cachedFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < (this.options.cacheDuration! * 60 * 1000)) {
      return cached.data as T;
    }

    const data = await this.fetchFromAPI<T>(endpoint, params);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  public async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];

    for (const symbol of symbols) {
      const data = await this.cachedFetch<any>('GLOBAL_QUOTE', {
        function: 'GLOBAL_QUOTE',
        symbol
      });

      const quote = data['Global Quote'];
      if (quote) {
        quotes.push({
          symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent']),
          volume: parseInt(quote['06. volume']),
          timestamp: quote['07. latest trading day'],
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          previousClose: parseFloat(quote['08. previous close'])
        });
      }
    }

    return quotes;
  }

  public async getHistoricalData(symbol: string, interval: string = 'daily'): Promise<StockHistoricalData> {
    const data = await this.cachedFetch<any>('TIME_SERIES_DAILY_ADJUSTED', {
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize: 'compact'
    });

    const timeSeries = data['Time Series (Daily)'];
    const historicalData: StockHistoricalData = {
      symbol,
      data: []
    };

    if (timeSeries) {
      Object.entries(timeSeries).forEach(([date, values]: [string, any]) => {
        historicalData.data.push({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['6. volume']),
          adjustedClose: parseFloat(values['5. adjusted close'])
        });
      });
    }

    return historicalData;
  }

  public async getMetrics(symbol: string): Promise<StockMetrics> {
    const data = await this.cachedFetch<any>('OVERVIEW', {
      function: 'OVERVIEW',
      symbol
    });

    return {
      symbol,
      marketCap: parseFloat(data['MarketCapitalization']),
      peRatio: parseFloat(data['PERatio']),
      eps: parseFloat(data['EPS']),
      dividendYield: parseFloat(data['DividendYield']),
      beta: parseFloat(data['Beta']),
      fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']),
      fiftyTwoWeekLow: parseFloat(data['52WeekLow'])
    };
  }

  public async getFilteredData(options: StockFilterOptions): Promise<{
    quotes: StockQuote[];
    historicalData?: StockHistoricalData[];
    metrics?: StockMetrics[];
  }> {
    const result: {
      quotes: StockQuote[];
      historicalData?: StockHistoricalData[];
      metrics?: StockMetrics[];
    } = {
      quotes: await this.getQuotes(options.symbols)
    };

    if (options.timeRange) {
      result.historicalData = await Promise.all(
        options.symbols.map(symbol => this.getHistoricalData(symbol))
      );
    }

    if (options.includeMetrics) {
      result.metrics = await Promise.all(
        options.symbols.map(symbol => this.getMetrics(symbol))
      );
    }

    return result;
  }
} 