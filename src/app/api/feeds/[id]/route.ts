import { NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import { Feed } from '@/models/feed.model'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    const result = await Feed.findByIdAndDelete(params.id)
    
    if (!result) {
      return NextResponse.json(
        { status: 'error', message: 'Feed not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Feed deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting feed:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete feed' },
      { status: 500 }
    )
  }
} 