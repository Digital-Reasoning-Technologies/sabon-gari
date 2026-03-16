import { connectDB, isDbConfigured } from '@/lib/mongodb';
import News from '@/lib/models/news';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || String(DEFAULT_LIMIT))));
      return NextResponse.json(
        { ok: true, data: [], message: 'News fetched successfully', pagination: { total: 0, page: 1, pages: 0, limit } },
        { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString()))
    );

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      News.countDocuments(),
    ]);

    const response = NextResponse.json(
      {
        ok: true,
        data: news,
        message: 'News fetched successfully',
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      { status: 200 }
    );

    // Add cache headers - cache for 60 seconds, allow stale-while-revalidate
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=120'
    );

    return response;
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
