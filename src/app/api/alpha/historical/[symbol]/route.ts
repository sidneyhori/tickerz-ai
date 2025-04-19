import { NextRequest, NextResponse } from 'next/server';
import { StockService } from '@/services/stock.service';

const stockService = StockService.getInstance({
  apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  cacheDuration: 5
});

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const awaitedParams = await params;
    const symbol = awaitedParams.symbol;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || 'daily';

    const historicalData = await stockService.getHistoricalData(symbol, interval);
    return NextResponse.json(historicalData);
  } catch (error) {
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