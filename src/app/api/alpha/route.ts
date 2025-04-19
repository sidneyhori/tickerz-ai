import { NextRequest, NextResponse } from 'next/server';
import { StockService } from '@/services/stock.service';
import { StockFilterOptions, TimeRange } from '@/types/stock';

const stockService = StockService.getInstance({
  apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  cacheDuration: 5
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const timeRange = searchParams.get('timeRange') as TimeRange;
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    if (!symbols) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    // Validate symbols
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    if (symbolList.some(s => !s)) {
      return NextResponse.json(
        { error: 'Invalid symbols provided' },
        { status: 400 }
      );
    }

    const options: StockFilterOptions = {
      symbols: symbolList,
      timeRange,
      includeMetrics
    };

    console.log('Fetching data with options:', options);
    const data = await stockService.getFilteredData(options);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in alpha route:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 