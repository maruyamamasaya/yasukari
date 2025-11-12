import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAccess } from './lib/rateLimit';

const MANUAL_BASIC_USER = '0000';
const MANUAL_BASIC_PASS = '0000';
const ADMIN_BASIC_USER = 'yasukari';
const ADMIN_BASIC_PASS = 'yasukari2022';

const requireBasicAuth = (
  authHeader: string | null,
  expectedUser: string,
  expectedPass: string
): NextResponse | null => {
  if (!authHeader) {
    return new NextResponse('Auth Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
    });
  }

  const [, encoded] = authHeader.split(' ');
  const [user, pass] = Buffer.from(encoded ?? '', 'base64').toString().split(':');
  if (user !== expectedUser || pass !== expectedPass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
    });
  }

  return null;
};

export function middleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0';
  if (checkAccess(Array.isArray(ip) ? ip[0] : ip)) {
    return NextResponse.redirect(new URL('/wait', req.url));
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    const authResult = requireBasicAuth(
      req.headers.get('authorization'),
      ADMIN_BASIC_USER,
      ADMIN_BASIC_PASS
    );
    if (authResult) {
      return authResult;
    }
  }

  if (req.nextUrl.pathname.startsWith('/manual_for_system')) {
    const authResult = requireBasicAuth(
      req.headers.get('authorization'),
      MANUAL_BASIC_USER,
      MANUAL_BASIC_PASS
    );
    if (authResult) {
      return authResult;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|wait).*)'],
};
