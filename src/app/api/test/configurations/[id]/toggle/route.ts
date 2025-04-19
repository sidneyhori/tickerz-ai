import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SourceConfiguration } from '@/models/SourceConfiguration';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH({ params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    
    // Find the configuration and toggle its active status
    const config = await SourceConfiguration.findById(id);
    
    if (!config) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Configuration not found',
        },
        { status: 404 }
      );
    }
    
    // Toggle the active status
    config.isActive = !config.isActive;
    await config.save();
    
    return NextResponse.json({
      status: 'success',
      message: `Configuration ${config.isActive ? 'activated' : 'deactivated'} successfully`,
      configuration: {
        id: config._id,
        type: config.type,
        name: config.name,
        isActive: config.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling configuration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to toggle configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 