import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ContentItem } from '@/models/ContentItem';

export async function GET() {
  try {
    await connectDB();
    
    // Get all content items with their metadata
    const contentItems = await ContentItem.find({}, {
      sourceType: 1,
      sourceId: 1,
      summary: 1,
      metadata: 1,
      displayCount: 1,
      lastShownAt: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ 'metadata.publishedAt': -1 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Content items retrieved successfully',
      count: contentItems.length,
      items: contentItems.map(item => ({
        id: item._id,
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        summary: item.summary,
        metadata: item.metadata,
        displayCount: item.displayCount,
        lastShownAt: item.lastShownAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving content items:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve content items',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 