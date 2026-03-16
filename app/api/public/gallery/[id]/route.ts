import { connectDB } from '@/lib/mongodb';
import Gallery from '@/lib/models/gallery';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

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
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch gallery item' },
      { status: 500 }
    );
  }
}
