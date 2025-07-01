import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAccess } from './lib/rateLimit';

export function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0';
  if (checkAccess(Array.isArray(ip) ? ip[0] : ip)) {
    return NextResponse.redirect(new URL('/wait', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|wait).*)'],
};
