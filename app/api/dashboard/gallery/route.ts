import { connectDB } from '@/lib/mongodb';
import Gallery from '@/lib/models/gallery';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { generateUniqueSlug, normalizeSlug } from '@/lib/slug';

const DEFAULT_LIMIT = 12;
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

    const [items, total] = await Promise.all([
      Gallery.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Gallery.countDocuments(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        data: items,
        message: 'Gallery fetched successfully',
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
      { ok: false, message: error?.message ?? 'Failed to fetch gallery' },
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
    const date = formData.get('date') as string | null;
    const image = formData.get('image') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const slugBase = title ? normalizeSlug(title) : '';
    const slug = await generateUniqueSlug(Gallery, slugBase);

    const normalizedImages: string[] = imagesArray.length > 0 ? imagesArray : (image ? [image] : []);

    const normalizedBody: any = {
      title,
      description,
      slug,
      images: normalizedImages,
      image: image ?? normalizedImages[0],
    };

    if (date) {
      normalizedBody.date = date;
    }

    const requiredFields = ['title', 'description'];
    const missingFields = requiredFields.filter(
      (field) => normalizedBody[field] == null || normalizedBody[field] === ''
    );

    if (!Array.isArray(normalizedBody.images) || normalizedBody.images.length === 0) {
      missingFields.push('images');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const created = await Gallery.create(normalizedBody);

    return NextResponse.json(
      { ok: true, data: created, message: 'Gallery item created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to create gallery item' },
      { status }
    );
  }
}
