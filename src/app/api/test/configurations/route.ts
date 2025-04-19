import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SourceConfiguration } from '@/models/SourceConfiguration';

export async function GET() {
  try {
    await connectDB();
    
    // Get all configurations
    const configurations = await SourceConfiguration.find({}, {
      type: 1,
      name: 1,
      config: 1,
      isActive: 1,
      lastSyncAt: 1,
      syncInterval: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ type: 1, name: 1 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Configurations retrieved successfully',
      count: configurations.length,
      configurations: configurations.map(config => ({
        id: config._id,
        type: config.type,
        name: config.name,
        config: config.config,
        isActive: config.isActive,
        lastSyncAt: config.lastSyncAt,
        syncInterval: config.syncInterval,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving configurations:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve configurations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 