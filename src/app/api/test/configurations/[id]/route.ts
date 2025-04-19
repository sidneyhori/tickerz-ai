import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SourceConfiguration } from '@/models/SourceConfiguration';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    
    // Update the configuration
    const updatedConfig = await SourceConfiguration.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedConfig) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Configuration not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Configuration updated successfully',
      configuration: {
        id: updatedConfig._id,
        type: updatedConfig.type,
        name: updatedConfig.name,
        config: updatedConfig.config,
        isActive: updatedConfig.isActive,
        syncInterval: updatedConfig.syncInterval
      }
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE({ params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    
    const deletedConfig = await SourceConfiguration.findByIdAndDelete(id);
    
    if (!deletedConfig) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Configuration not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Configuration deleted successfully',
      configuration: {
        id: deletedConfig._id,
        type: deletedConfig.type,
        name: deletedConfig.name
      }
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 