import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { hashPassword, requireAuth, UserRole } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(request, ['superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(id).lean().exec() as any;

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return password hash
    const { passwordHash, ...userData } = user;

    return NextResponse.json({ ok: true, data: userData }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to fetch user' },
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
    await requireAuth(request, ['superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const email = formData.get('email') ? (formData.get('email') as string).toLowerCase().trim() : undefined;
    const password = formData.get('password') as string | null;
    const role = formData.get('role') as UserRole | null;

    const updateData: any = {};

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existing = await User.findOne({ email, _id: { $ne: id } }).lean().exec();
      if (existing) {
        return NextResponse.json(
          { ok: false, message: 'Email already exists' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (role !== undefined && role !== null) {
      if (!['user', 'admin', 'superadmin'].includes(role)) {
        return NextResponse.json(
          { ok: false, message: 'Invalid role' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (password !== null && password !== undefined && password !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { ok: false, message: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(password);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean().exec() as any;

    if (!updated) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return password hash
    const { passwordHash, ...userData } = updated;

    return NextResponse.json({ ok: true, data: userData }, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to update user' },
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
    await requireAuth(request, ['superadmin']);

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    const auth = await requireAuth(request, ['superadmin']);
    if (auth.sub === id) {
      return NextResponse.json(
        { ok: false, message: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Failed to delete user' },
      { status }
    );
  }
}

