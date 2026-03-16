import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/project';
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
        { ok: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const item = await Project.findById(id);

    if (!item) {
      return NextResponse.json(
        { ok: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: item }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch project' },
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
        { ok: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string | null;
    const status = formData.get('status') as string | null;
    const location = formData.get('location') as string | null;
    const date = formData.get('date') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const updateBody: any = {
      title,
      description,
    };

    if (image) {
      updateBody.image = image;
    }

    if (imagesArray.length > 0) {
      updateBody.images = imagesArray;
    }

    if (status) {
      updateBody.status = status;
    }

    if (location) {
      updateBody.location = location;
    }

    if (date) {
      updateBody.date = date;
    }

    const updated = await Project.findByIdAndUpdate(id, updateBody, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to update project' },
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
        { ok: false, message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to delete project' },
      { status }
    );
  }
}
