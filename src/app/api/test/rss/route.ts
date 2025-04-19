import { NextResponse } from 'next/server';
import { RssService } from '@/services/rss.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const categories = searchParams.get('categories')?.split(',');
    const keywords = searchParams.get('keywords')?.split(',');
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!) : undefined;
    const minLength = searchParams.get('minLength') ? parseInt(searchParams.get('minLength')!) : undefined;
    const maxLength = searchParams.get('maxLength') ? parseInt(searchParams.get('maxLength')!) : undefined;

    if (!url) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'URL parameter is required',
        },
        { status: 400 }
      );
    }

    const rssService = RssService.getInstance();
    const feed = await rssService.fetchAndFilterFeed(url, {
      categories,
      keywords,
      maxAgeInHours: maxAge,
      minLength,
      maxLength
    });

    return NextResponse.json({
      status: 'success',
      message: 'RSS feed fetched and filtered successfully',
      feed: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        itemCount: feed.items.length,
        items: feed.items.map(item => ({
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.pubDate,
          categories: item.categories,
          author: item.author,
          imageUrl: item.imageUrl
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch RSS feed',
        error: error instanceof Error ? {
          message: error.message,
          code: 'code' in error ? error.code : 'UNKNOWN_ERROR',
          details: 'details' in error ? error.details : undefined
        } : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 