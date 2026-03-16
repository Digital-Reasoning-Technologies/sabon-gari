import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/project';
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
      Project.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Project.countDocuments(),
    ]);

    return NextResponse.json(
      {
        ok: true,
        data: items,
        message: 'Projects fetched successfully',
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
      { ok: false, message: error?.message ?? 'Failed to fetch projects' },
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
    const image = formData.get('image') as string;
    const status = formData.get('status') as string | null;
    const location = formData.get('location') as string | null;
    const date = formData.get('date') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const slugBase = title ? normalizeSlug(title) : '';
    const slug = await generateUniqueSlug(Project, slugBase);

    const normalizedBody: any = {
      title,
      description,
      image,
      slug,
      images: imagesArray,
    };

    if (status) {
      normalizedBody.status = status;
    }

    if (location) {
      normalizedBody.location = location;
    }

    if (date) {
      normalizedBody.date = date;
    }

    const requiredFields = ['title', 'description', 'image'];
    const missingFields = requiredFields.filter(
      (field) => normalizedBody[field] == null || normalizedBody[field] === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    if (normalizedBody.images != null && !Array.isArray(normalizedBody.images)) {
      return NextResponse.json(
        { ok: false, message: 'Field "images" must be an array of strings' },
        { status: 400 }
      );
    }

    const created = await Project.create(normalizedBody);

    return NextResponse.json(
      { ok: true, data: created, message: 'Project created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to create project' },
      { status }
    );
  }
}
