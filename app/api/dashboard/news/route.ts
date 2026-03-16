import { connectDB } from '@/lib/mongodb';
import News from '@/lib/models/news';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { generateUniqueSlug, normalizeSlug } from '@/lib/slug';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

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

    return NextResponse.json(
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
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch news' },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const slugBase = title ? normalizeSlug(title) : '';
    const slug = await generateUniqueSlug(News, slugBase);

    const normalizedBody: any = {
      title,
      description,
      content,
      images: imagesArray,
      date,
      slug,
    };

    if (location) {
      normalizedBody.location = location;
    }

    const requiredFields = ['title', 'content', 'description', 'images', 'date'];
    const missingFields = requiredFields.filter((field) => {
      if (field === 'images') {
        return !Array.isArray(normalizedBody.images) || normalizedBody.images.length === 0;
      }
      return normalizedBody[field] == null || normalizedBody[field] === '';
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const created = await News.create(normalizedBody);

    return NextResponse.json(
      { ok: true, data: created, message: 'News created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to create news' },
      { status }
    );
  }
}
