import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      message: 'Successfully connected to MongoDB',
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      ok: false,
      message: 'Failed to connect to MongoDB',
      error: errorMessage,
      status: 'disconnected',
      timestamp: new Date().toISOString(),
      solution: 'Please check if MongoDB is running and your MONGODB_URI in .env is correct'
    }, { status: 500 });
  }
}
