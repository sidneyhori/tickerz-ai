import { NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import { Feed } from '@/models/feed.model'
import { IFeed } from '@/models/feed.model'
import { Document, Types } from 'mongoose'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

interface FeedRequestBody {
  url: string
  title: string
  description?: string
  isActive?: boolean
}

interface MongoFeed extends IFeed, Document {
  _id: Types.ObjectId
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()
    const feeds = await Feed.find({ userId: token.email }).sort({ createdAt: -1 }) as MongoFeed[]
    
    // Transform MongoDB documents to match our Feed type
    const transformedFeeds = feeds.map(feed => ({
      id: feed._id.toString(),
      url: feed.url,
      title: feed.title,
      description: feed.description,
      lastFetched: feed.lastFetched,
      isActive: feed.isActive
    }))
    
    return NextResponse.json({
      status: 'success',
      data: transformedFeeds
    })
  } catch (error) {
    console.error('Error fetching feeds:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch feeds' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.email) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as FeedRequestBody
    const feedData: Partial<IFeed> = {
      url: body.url,
      title: body.title,
      description: body.description,
      isActive: body.isActive ?? true,
      userId: token.email
    }
    
    await connectMongoDB()
    
    const feed = new Feed({
      ...feedData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    const savedFeed = await feed.save() as MongoFeed
    
    // Transform the saved feed to match our Feed type
    const transformedFeed = {
      id: savedFeed._id.toString(),
      url: savedFeed.url,
      title: savedFeed.title,
      description: savedFeed.description,
      lastFetched: savedFeed.lastFetched,
      isActive: savedFeed.isActive
    }
    
    return NextResponse.json({
      status: 'success',
      data: transformedFeed
    })
  } catch (error) {
    console.error('Error creating feed:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to create feed' },
      { status: 500 }
    )
  }
} 