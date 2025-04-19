import { parseString } from 'xml2js';
import { promisify } from 'util';
import { RssFeed, RssFeedItem, RssFilterOptions, RssFetchOptions, RssServiceError } from '@/types/rss';

const parseXml = promisify(parseString);

export class RssService {
  private static instance: RssService;
  private defaultFetchOptions: Partial<RssFetchOptions> = {
    timeout: 10000,
    maxRedirects: 5,
    userAgent: 'Tickerz.ai RSS Fetcher/1.0'
  };

  private constructor() {}

  public static getInstance(): RssService {
    if (!RssService.instance) {
      RssService.instance = new RssService();
    }
    return RssService.instance;
  }

  private async fetchFeed(url: string, options: Partial<RssFetchOptions> = {}): Promise<string> {
    const fetchOptions = { ...this.defaultFetchOptions, url, ...options };
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': fetchOptions.userAgent!
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        const rssError = new Error(error.message) as RssServiceError;
        rssError.code = 'NETWORK_ERROR';
        rssError.details = { url, options };
        throw rssError;
      }
      throw error;
    }
  }

  private parseFeed(xml: string): Promise<RssFeed> {
    return parseXml(xml)
      .then((result: any) => {
        try {
          const channel = result.rss.channel[0];
          return {
            title: channel.title[0],
            description: channel.description?.[0],
            link: channel.link[0],
            items: channel.item.map((item: any) => ({
              title: item.title[0],
              description: item.description?.[0],
              content: item['content:encoded']?.[0],
              link: item.link[0],
              pubDate: item.pubDate?.[0] || item['dc:date']?.[0],
              guid: item.guid?.[0]._ || item.guid?.[0],
              categories: item.category?.map((cat: any) => cat._ || cat) || [],
              author: item.author?.[0] || item['dc:creator']?.[0],
              imageUrl: this.extractImageUrl(item)
            })),
            lastBuildDate: channel.lastBuildDate?.[0],
            language: channel.language?.[0]
          };
        } catch (error: unknown) {
          const rssError = new Error('Failed to parse RSS feed structure') as RssServiceError;
          rssError.code = 'PARSE_ERROR';
          rssError.details = { error };
          throw rssError;
        }
      })
      .catch((error: unknown) => {
        const rssError = new Error('Invalid XML format') as RssServiceError;
        rssError.code = 'PARSE_ERROR';
        rssError.details = { error };
        throw rssError;
      });
  }

  private extractImageUrl(item: any): string | undefined {
    // Try different image sources
    return (
      item['media:content']?.[0]?.$?.url ||
      item['media:thumbnail']?.[0]?.$?.url ||
      item.enclosure?.[0]?.$?.url
    );
  }

  private filterItems(items: RssFeedItem[], filters: RssFilterOptions): RssFeedItem[] {
    return items.filter(item => {
      // Category filter
      if (filters.categories?.length) {
        const hasMatchingCategory = item.categories.some(category =>
          filters.categories!.some(filterCat =>
            category.toLowerCase().includes(filterCat.toLowerCase())
          )
        );
        if (!hasMatchingCategory) return false;
      }

      // Keyword filter
      if (filters.keywords?.length) {
        const content = `${item.title} ${item.description || ''} ${item.content || ''}`.toLowerCase();
        const hasKeyword = filters.keywords.some(keyword =>
          content.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      // Age filter
      if (filters.maxAgeInHours) {
        const pubDate = new Date(item.pubDate);
        const ageInHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
        if (ageInHours > filters.maxAgeInHours) return false;
      }

      // Length filter
      if (filters.minLength || filters.maxLength) {
        const contentLength = (item.description || '').length;
        if (filters.minLength && contentLength < filters.minLength) return false;
        if (filters.maxLength && contentLength > filters.maxLength) return false;
      }

      return true;
    });
  }

  public async fetchAndFilterFeed(
    url: string,
    filters: RssFilterOptions = {},
    fetchOptions: Partial<RssFetchOptions> = {}
  ): Promise<RssFeed> {
    try {
      const xml = await this.fetchFeed(url, fetchOptions);
      const feed = await this.parseFeed(xml);
      
      return {
        ...feed,
        items: this.filterItems(feed.items, filters)
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      const rssError = new Error('Unknown error occurred') as RssServiceError;
      rssError.code = 'FETCH_ERROR';
      rssError.details = { error };
      throw rssError;
    }
  }
} 