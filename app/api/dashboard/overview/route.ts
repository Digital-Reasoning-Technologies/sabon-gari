import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import News from '@/lib/models/news';
import Gallery from '@/lib/models/gallery';
import Project from '@/lib/models/project';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request, ['admin', 'superadmin']);

    const [newsTotal, galleryTotal, projectsTotal, activeProjects, latestNews, latestGallery, latestProjects] =
      await Promise.all([
        News.countDocuments(),
        Gallery.countDocuments(),
        Project.countDocuments(),
        Project.countDocuments({ status: 'active' }),
        News.find().sort({ createdAt: -1 }).limit(3).lean().exec(),
        Gallery.find().sort({ createdAt: -1 }).limit(3).lean().exec(),
        Project.find().sort({ createdAt: -1 }).limit(3).lean().exec(),
      ]);

    const recentHighlights = [
      ...latestNews.map((n: any) => ({
        type: 'news' as const,
        id: n._id?.toString?.() ?? String(n._id),
        title: n.title,
        description: n.description,
        date: n.date ?? null,
        status: 'published',
        createdAt: n.createdAt ?? null,
      })),
      ...latestGallery.map((g: any) => ({
        type: 'gallery' as const,
        id: g._id?.toString?.() ?? String(g._id),
        title: g.title,
        description: g.description,
        date: g.date ?? null,
        status: 'published',
        createdAt: g.createdAt ?? null,
      })),
      ...latestProjects.map((p: any) => ({
        type: 'projects' as const,
        id: p._id?.toString?.() ?? String(p._id),
        title: p.title,
        description: p.description,
        date: p.date ?? null,
        status: p.status ?? null,
        createdAt: p.createdAt ?? null,
      })),
    ]
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime; // Newest first
      })
      .slice(0, 4)
      .map(({ createdAt, ...rest }) => rest);

    return NextResponse.json(
      {
        ok: true,
        data: {
          stats: {
            newsTotal,
            galleryTotal,
            projectsTotal,
            activeProjects,
          },
          recentHighlights,
        },
        message: 'Dashboard overview fetched successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch dashboard overview' },
      { status }
    );
  }
}
