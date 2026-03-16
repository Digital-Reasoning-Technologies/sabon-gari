import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { hashPassword, requireAuth, UserRole } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request, ['superadmin']);

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(
      {
        ok: true,
        data: users,
        message: 'Users fetched successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch users' },
      { status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request, ['superadmin']);

    const formData = await request.formData();
    const email = (formData.get('email') as string | null)?.toLowerCase().trim();
    const password = formData.get('password') as string | null;
    const role = formData.get('role') as UserRole | null;

    if (!email || !password || !role) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields: email, password, role' },
        { status: 400 }
      );
    }

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email }).lean().exec();
    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const created = await User.create({ email, passwordHash, role });

    return NextResponse.json(
      {
        ok: true,
        message: 'User created successfully',
        data: { _id: created._id, email: created.email, role: created.role },
      },
      { status: 201 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to create user' },
      { status }
    );
  }
}
