import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAccess } from './lib/rateLimit';

const BASIC_USER = '0000';
const BASIC_PASS = '0000';

export function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0';
  if (checkAccess(Array.isArray(ip) ? ip[0] : ip)) {
    return NextResponse.redirect(new URL('/wait', req.url));
  }

  if (req.nextUrl.pathname.startsWith('/manual_for_system')) {
    const auth = req.headers.get('authorization');
    if (!auth) {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
      });
    }
    const [, encoded] = auth.split(' ');
    const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
    if (user !== BASIC_USER || pass !== BASIC_PASS) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|wait).*)'],
};
