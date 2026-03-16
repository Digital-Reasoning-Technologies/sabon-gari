import { connectDB } from '@/lib/mongodb';
import News from '@/lib/models/news';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const news = await News.findOne({ slug });

    if (!news) {
      return NextResponse.json(
        { ok: false, message: 'News not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ ok: true, data: news }, { status: 200 });
    
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
