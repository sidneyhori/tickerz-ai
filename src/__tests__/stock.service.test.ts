import { StockService } from '@/services/stock.service';
import { StockQuote, StockHistoricalData, StockMetrics } from '@/types/stock';

describe('StockService - Real API Tests', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = StockService.getInstance({
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
      cacheDuration: 5
    });
  });

  describe('getQuotes', () => {
    it('should return real quotes for given symbols', async () => {
      const symbols = ['AAPL', 'GOOGL'];
      console.log('Fetching real-time quotes for:', symbols);
      
      const quotes = await stockService.getQuotes(symbols);
      console.log('Received quotes:', JSON.stringify(quotes, null, 2));
      
      expect(quotes).toBeInstanceOf(Array);
      expect(quotes.length).toBe(symbols.length);
      
      quotes.forEach((quote: StockQuote) => {
        expect(quote).toHaveProperty('symbol');
        expect(quote).toHaveProperty('price');
        expect(quote).toHaveProperty('change');
        expect(quote).toHaveProperty('changePercent');
        expect(quote).toHaveProperty('volume');
        expect(quote).toHaveProperty('timestamp');
      });
    });

    it('should handle empty symbols array', async () => {
      const quotes = await stockService.getQuotes([]);
      expect(quotes).toEqual([]);
    });
  });

  describe('getHistoricalData', () => {
    it('should return real historical data for a symbol', async () => {
      const symbol = 'AAPL';
      console.log('Fetching historical data for:', symbol);
      
      const historicalData = await stockService.getHistoricalData(symbol);
      console.log('Received historical data sample:', JSON.stringify(historicalData.data.slice(0, 2), null, 2));
      
      expect(historicalData).toHaveProperty('symbol', symbol);
      expect(historicalData).toHaveProperty('data');
      expect(Array.isArray(historicalData.data)).toBe(true);
      
      if (historicalData.data.length > 0) {
        const firstDataPoint = historicalData.data[0];
        expect(firstDataPoint).toHaveProperty('date');
        expect(firstDataPoint).toHaveProperty('open');
        expect(firstDataPoint).toHaveProperty('high');
        expect(firstDataPoint).toHaveProperty('low');
        expect(firstDataPoint).toHaveProperty('close');
        expect(firstDataPoint).toHaveProperty('volume');
        expect(firstDataPoint).toHaveProperty('adjustedClose');
      }
    });
  });

  describe('getMetrics', () => {
    it('should return real metrics for a symbol', async () => {
      const symbol = 'AAPL';
      console.log('Fetching metrics for:', symbol);
      
      const metrics = await stockService.getMetrics(symbol);
      console.log('Received metrics:', JSON.stringify(metrics, null, 2));
      
      expect(metrics).toHaveProperty('symbol', symbol);
      expect(metrics).toHaveProperty('marketCap');
      expect(metrics).toHaveProperty('peRatio');
      expect(metrics).toHaveProperty('eps');
      expect(metrics).toHaveProperty('dividendYield');
      expect(metrics).toHaveProperty('beta');
      expect(metrics).toHaveProperty('fiftyTwoWeekHigh');
      expect(metrics).toHaveProperty('fiftyTwoWeekLow');
    });
  });

  describe('getFilteredData', () => {
    it('should return real filtered data based on options', async () => {
      const options = {
        symbols: ['AAPL', 'GOOGL'],
        timeRange: '1mo' as const,
        includeMetrics: true
      };

      console.log('Fetching filtered data with options:', options);
      
      const result = await stockService.getFilteredData(options);
      console.log('Received filtered data:', JSON.stringify({
        quotes: result.quotes,
        historicalDataSample: result.historicalData?.map(d => ({ symbol: d.symbol, dataPoints: d.data.length })),
        metrics: result.metrics
      }, null, 2));
      
      expect(result).toHaveProperty('quotes');
      expect(result).toHaveProperty('historicalData');
      expect(result).toHaveProperty('metrics');
      
      expect(result.quotes.length).toBe(options.symbols.length);
      expect(result.historicalData?.length).toBe(options.symbols.length);
      expect(result.metrics?.length).toBe(options.symbols.length);
    });
  });
}); 