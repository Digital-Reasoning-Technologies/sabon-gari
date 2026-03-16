'use server';

import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/user';
import { signToken, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type LoginState = {
  ok: boolean;
  message: string;
};

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.toLowerCase().trim();
  const password = formData.get('password') as string | null;
  const nextPath = formData.get('next') as string | null;

  if (!email || !password) {
    return { ok: false, message: 'Email and password are required' };
  }

  await connectDB();

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return { ok: false, message: 'Invalid email or password' };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { ok: false, message: 'Invalid email or password' };
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return { ok: false, message: 'Access denied' };
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });

  const cookieStore = await cookies();
  // On Vercel, always use secure cookies (HTTPS is always enabled)
  // Also check for production environment or Vercel deployment
  const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  
  cookieStore.set({
    name: 'kudan_token',
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  
  // Redirect to the intended path or default to /admin
  let redirectPath = nextPath && nextPath.startsWith('/admin') 
    ? nextPath 
    : '/admin';
  
  // Add success parameter to show toast after redirect
  const separator = redirectPath.includes('?') ? '&' : '?';
  redirectPath = `${redirectPath}${separator}login=success`;
  
  redirect(redirectPath);
}
