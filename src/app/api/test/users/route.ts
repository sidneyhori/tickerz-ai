import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all users with their settings
    const users = await User.find({}, {
      name: 1,
      email: 1,
      settings: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Users retrieved successfully',
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 