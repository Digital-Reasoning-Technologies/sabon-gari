import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export type UserRole = 'user' | 'admin' | 'superadmin';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return secret;
}

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded !== 'object' || decoded == null) {
    throw new Error('Invalid token');
  }

  const sub = (decoded as any).sub as string | undefined;
  const role = (decoded as any).role as UserRole | undefined;

  if (!sub || !role) {
    throw new Error('Invalid token');
  }

  return { sub, role } as JwtPayload;
}

export function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;

  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !value) return null;
  return value.trim();
}

export function getCookieToken(request: NextRequest) {
  return request.cookies.get('kudan_token')?.value ?? null;
}

export async function requireAuth(request: NextRequest, allowedRoles?: UserRole[]) {
  const token = getBearerToken(request) ?? getCookieToken(request);
  if (!token) {
    const err: any = new Error('Missing Authorization token');
    err.status = 401;
    throw err;
  }

  let payload: JwtPayload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    const err: any = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    const err: any = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return payload;
}
