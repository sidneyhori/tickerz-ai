import { Router, Request, Response } from 'express';
import { StockService } from '@/services/stock.service';
import { StockFilterOptions, TimeRange } from '@/types/stock';

const router = Router();
const stockService = StockService.getInstance({
  apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  cacheDuration: 5
});

// Get real-time quotes for multiple symbols
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const symbols = (req.query.symbols as string)?.split(',') || [];
    if (!symbols.length) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    const quotes = await stockService.getQuotes(symbols);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes', details: error });
  }
});

// Get historical data for a symbol
router.get('/historical/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query;

    const historicalData = await stockService.getHistoricalData(symbol, interval as string);
    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data', details: error });
  }
});

// Get metrics for a symbol
router.get('/metrics/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const metrics = await stockService.getMetrics(symbol);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics', details: error });
  }
});

// Get filtered data based on options
router.get('/filtered', async (req: Request, res: Response) => {
  try {
    const options: StockFilterOptions = {
      symbols: (req.query.symbols as string)?.split(',') || [],
      timeRange: req.query.timeRange as TimeRange,
      includeMetrics: req.query.includeMetrics === 'true'
    };

    if (!options.symbols.length) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    const data = await stockService.getFilteredData(options);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch filtered data', details: error });
  }
});

export default router; 