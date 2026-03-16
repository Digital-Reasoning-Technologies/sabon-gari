import { connectDB } from '@/lib/mongodb';
import News from '@/lib/models/news';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const { slug } = await params;
    const news = await News.findOne({ slug });

    if (!news) {
      return NextResponse.json(
        { ok: false, message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: news }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch news' },
      { status }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const formData = await request.formData();
    const { slug } = await params;

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string | null;
    const imagesArray = formData.getAll('images[]') as string[];

    const updateBody: any = {
      title,
      description,
      content,
      images: imagesArray,
      date,
    };

    if (location) {
      updateBody.location = location;
    }

    const updated = await News.findOneAndUpdate({ slug }, updateBody, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to update news' },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const { slug } = await params;
    const deleted = await News.findOneAndDelete({ slug });

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'News deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to delete news' },
      { status }
    );
  }
}
