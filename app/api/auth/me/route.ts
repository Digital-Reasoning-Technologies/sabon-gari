import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { requireAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await requireAuth(request);
    const user = await User.findById(auth.sub).lean().exec() as any;

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, data: { _id: user._id, email: user.email, role: user.role } },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch user' },
      { status }
    );
  }
}
