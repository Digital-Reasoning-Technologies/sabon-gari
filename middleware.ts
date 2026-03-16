import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-compatible token verification (middleware runs in Edge Runtime)
async function verifyTokenEdge(token: string): Promise<{ sub: string; role: string }> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  const secretKey = new TextEncoder().encode(secret);
  
  try {
    const { payload } = await jwtVerify(token, secretKey);
    
    if (typeof payload !== 'object' || payload == null) {
      throw new Error('Invalid token');
    }

    const sub = payload.sub as string | undefined;
    const role = payload.role as string | undefined;

    if (!sub || !role) {
      throw new Error('Invalid token');
    }

    return { sub, role };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid token');
  }
}

const PROTECTED_PAGE_PREFIXES = ['/admin'];
const PROTECTED_API_PREFIXES = ['/api/dashboard', '/api/upload'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get('kudan_token')?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token validity (using Edge-compatible verification)
  try {
    await verifyTokenEdge(token);
  } catch (error) {
    // Token is invalid or expired - clear cookie and redirect/logout
    const response = isProtectedApi
      ? NextResponse.json(
          { ok: false, message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login?expired=true', request.url));

    // On Vercel, always use secure cookies (HTTPS is always enabled)
    const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    
    // Clear the token cookie
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/dashboard/:path*', '/api/upload'],
};
