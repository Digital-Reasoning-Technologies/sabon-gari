import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { signToken, verifyPassword } from '@/lib/auth';
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

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({ sub: user._id.toString(), role: user.role });

    return NextResponse.json(
      {
        ok: true,
        message: 'Logged in successfully',
        data: {
          token,
          user: { _id: user._id, email: user.email, role: user.role },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to login', error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
