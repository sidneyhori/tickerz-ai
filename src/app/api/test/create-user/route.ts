import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST() {
  try {
    await connectDB();
    
    // Create a test user with default settings
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      settings: {
        rssFeeds: {
          enabled: true,
          refreshInterval: 15,
          maxItems: 10,
          sources: ['https://example.com/feed']
        },
        stockTickers: {
          enabled: true,
          refreshInterval: 5,
          symbols: ['AAPL', 'GOOGL'],
          displayMode: 'compact'
        },
        calendars: {
          enabled: true,
          refreshInterval: 15,
          sources: ['primary'],
          displayMode: 'list'
        },
        weather: {
          enabled: true,
          refreshInterval: 30,
          location: 'New York, NY',
          units: 'metric'
        },
        display: {
          theme: 'system',
          layout: 'grid',
          fontSize: 'medium'
        }
      }
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Test user created successfully',
      user: {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        settings: testUser.settings
      }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create test user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 