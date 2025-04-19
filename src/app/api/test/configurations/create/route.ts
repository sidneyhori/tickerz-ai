import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SourceConfiguration } from '@/models/SourceConfiguration';

export async function POST() {
  try {
    await connectDB();
    
    // Create test configurations for each source type
    const configurations = await Promise.all([
      // RSS Feed Configuration
      SourceConfiguration.create({
        type: 'rss',
        name: 'Tech News RSS',
        config: {
          url: 'https://example.com/tech-feed.xml',
          updateInterval: 15,
          maxItems: 20
        },
        isActive: true,
        syncInterval: 15
      }),
      
      // Stock Ticker Configuration
      SourceConfiguration.create({
        type: 'stock',
        name: 'Tech Stocks',
        config: {
          symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN'],
          updateInterval: 5,
          priceHistory: true
        },
        isActive: true,
        syncInterval: 5
      }),
      
      // Calendar Configuration
      SourceConfiguration.create({
        type: 'calendar',
        name: 'Work Calendar',
        config: {
          calendarId: 'primary',
          timezone: 'America/New_York',
          maxEvents: 10
        },
        isActive: true,
        syncInterval: 15
      }),
      
      // Weather Configuration
      SourceConfiguration.create({
        type: 'weather',
        name: 'New York Weather',
        config: {
          location: 'New York, NY',
          units: 'metric',
          forecastDays: 3
        },
        isActive: true,
        syncInterval: 30
      })
    ]);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test configurations created successfully',
      count: configurations.length,
      configurations: configurations.map(config => ({
        id: config._id,
        type: config.type,
        name: config.name,
        config: config.config,
        isActive: config.isActive,
        syncInterval: config.syncInterval
      }))
    });
  } catch (error) {
    console.error('Error creating test configurations:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create test configurations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 