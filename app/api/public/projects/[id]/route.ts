import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/project';
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
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
