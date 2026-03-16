import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { hashPassword, signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const email = (body?.email as string | undefined)?.toLowerCase().trim();
    const password = body?.password as string | undefined;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields: email, password' },
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
    const created = await User.create({ email, passwordHash, role: 'user' });

    const token = signToken({ sub: created._id.toString(), role: created.role });

    return NextResponse.json(
      {
        ok: true,
        message: 'Registered successfully',
        data: {
          token,
          user: { _id: created._id, email: created.email, role: created.role },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Auth register error:', error);

    let message = 'Failed to register';
    let status = 500;

    if (error?.code === 11000) {
      message = 'Email already exists';
      status = 400;
    }

    return NextResponse.json(
      { ok: false, message, error: error?.message ?? String(error) },
      { status }
    );
  }
}
