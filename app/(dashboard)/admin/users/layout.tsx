import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

// Edge-compatible token verification (layout can run in Edge Runtime)
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

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('kudan_token')?.value
  
  if (!token) {
    redirect('/login?next=/admin/users')
  }

  try {
    // Verify token and check role (using Edge-compatible verification)
    const payload = await verifyTokenEdge(token)
    
    if (payload.role !== 'superadmin') {
      redirect('/admin?error=access_denied')
    }
    
    // If we get here, user is authenticated and is superadmin
    return <>{children}</>
  } catch (error: any) {
    // Token is invalid or user is not superadmin
    redirect('/admin?error=access_denied')
  }
}

