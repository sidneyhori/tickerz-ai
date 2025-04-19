import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ContentItem } from '@/models/ContentItem';

export async function POST() {
  try {
    await connectDB();
    
    // Create a test content item (RSS feed example)
    const testContent = await ContentItem.create({
      sourceType: 'rss',
      sourceId: 'example-feed-1',
      rawData: {
        feedUrl: 'https://example.com/feed',
        originalContent: 'This is the original content from the RSS feed...',
        categories: ['technology', 'news'],
        guid: 'example-guid-123'
      },
      summary: 'This is a processed summary of the content...',
      metadata: {
        title: 'Example RSS Feed Item',
        description: 'This is an example description of the content item',
        imageUrl: 'https://example.com/image.jpg',
        publishedAt: new Date(),
        author: 'Example Author',
        url: 'https://example.com/article'
      },
      displayCount: 0
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Test content item created successfully',
      item: {
        id: testContent._id,
        sourceType: testContent.sourceType,
        sourceId: testContent.sourceId,
        summary: testContent.summary,
        metadata: testContent.metadata,
        displayCount: testContent.displayCount,
        lastShownAt: testContent.lastShownAt,
        createdAt: testContent.createdAt,
        updatedAt: testContent.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating test content item:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to create test content item',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 