import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { ok: true, message: 'Logged out' },
    { status: 200 }
  );

  // On Vercel, always use secure cookies (HTTPS is always enabled)
  const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  
  response.cookies.set({
    name: 'kudan_token',
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
