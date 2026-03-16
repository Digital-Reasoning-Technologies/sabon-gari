import { connectDB } from '@/lib/mongodb';
import Gallery from '@/lib/models/gallery';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid gallery ID' },
        { status: 400 }
      );
    }

    const item = await Gallery.findById(id);

    if (!item) {
      return NextResponse.json(
        { ok: false, message: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: item }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch gallery item' },
      { status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid gallery ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string | null;
    const image = formData.get('image') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const normalizedImages: string[] = imagesArray.length > 0 ? imagesArray : (image ? [image] : []);

    const updateBody: any = {
      title,
      description,
      images: normalizedImages,
      image: image ?? normalizedImages[0],
    };

    if (date) {
      updateBody.date = date;
    }

    const updated = await Gallery.findByIdAndUpdate(id, updateBody, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to update gallery item' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid gallery ID' },
        { status: 400 }
      );
    }

    const deleted = await Gallery.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Gallery item deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to delete gallery item' },
      { status }
    );
  }
}
