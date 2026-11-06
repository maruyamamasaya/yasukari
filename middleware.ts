import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAccess } from './lib/rateLimit';
import { adminLockRemaining, recordAdminFailure } from './lib/adminLockout';
import { COGNITO_ID_TOKEN_COOKIE } from './lib/cognitoHostedUi';
import {
  MANUAL_BASIC_PASS,
  MANUAL_BASIC_USER,
  isBasicAuthValid,
} from './lib/basicAuth';

const FORCE_HOME_MAINTENANCE = false;

const decodeLocaleFromToken = (token: string | undefined): string | null => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      [key: string]: unknown;
    };
    const locale = payload['custom:locale'];
    if (typeof locale !== 'string') return null;

    const normalized = locale.trim().toLowerCase();
    return normalized || null;
  } catch (error) {
    console.error('Failed to decode ID token payload', error);
    return null;
  }
};

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

  const isValid = /^Basic\s+/i.test(authHeader) && isBasicAuthValid(authHeader, expectedUser, expectedPass);
  if (!isValid) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
    });
  }

  return null;
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = path === '/admin' || path.startsWith('/admin/') ||
    path === '/api/admin' || path.startsWith('/api/admin/') ||
    (path === '/api/license-image' && /^Basic\s+/i.test(req.headers.get('authorization') ?? ''));
  if (isAdmin) {
    const locked = (remaining: number) => new NextResponse(
      '管理者へのアクセスを一時停止しています。30分後に再度お試しください。',
      { status: 503, headers: {
        'Retry-After': String(Math.ceil(remaining / 1000)),
        'Cache-Control': 'private, no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      } }
    );
    const remaining = adminLockRemaining();
    if (remaining) return locked(remaining);
    const header = req.headers.get('authorization');
    const user = process.env.ADMIN_BASIC_USER;
    const pass = process.env.ADMIN_BASIC_PASS;
    if (!user || !pass) return new NextResponse('管理者認証が設定されていません。', {
      status: 503, headers: { 'Cache-Control': 'private, no-store' },
    });
    const authResult = requireBasicAuth(header, user, pass);
    if (authResult) {
      // An initial browser challenge has no credentials and is not an input attempt.
      // Count submitted invalid credentials globally, independent of client IP.
      if (header) {
        const remaining = recordAdminFailure();
        if (remaining) return locked(remaining);
      }
      authResult.headers.set('Cache-Control', 'private, no-store');
      return authResult;
    }
    // Admin APIs need the same gate; do not run page redirects for JSON endpoints.
    if (path === '/api/admin' || path.startsWith('/api/admin/') || path === '/api/license-image') return NextResponse.next();
  }

  if (path === '/api/license-image') return NextResponse.next();

  const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0';
  if (checkAccess(Array.isArray(ip) ? ip[0] : ip)) {
    return NextResponse.redirect(new URL('/wait', req.url));
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

  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/_next') || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const isAdminDashboardPath =
    pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard/');

  let isMaintenanceMode = false;
  try {
    const response = await fetch(new URL('/api/maintenance', req.url), {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = (await response.json()) as { enabled?: boolean };
      isMaintenanceMode = Boolean(data.enabled);
    }
  } catch (error) {
    console.error('Failed to check maintenance status', error);
  }

  if (
    isMaintenanceMode &&
    pathname !== '/maintenance' &&
    pathname !== '/en/maintenance' &&
    !isAdminDashboardPath
  ) {
    const maintenancePath = pathname.startsWith('/en')
      ? '/en/maintenance'
      : '/maintenance';
    return NextResponse.redirect(new URL(maintenancePath, req.url));
  }

  const isHomePath = pathname === '/' || pathname === '/en';
  if (
    FORCE_HOME_MAINTENANCE &&
    isHomePath
  ) {
    const maintenancePath = pathname.startsWith('/en')
      ? '/en/maintenance'
      : '/maintenance';
    return NextResponse.redirect(new URL(maintenancePath, req.url));
  }

  const idToken = req.cookies.get(COGNITO_ID_TOKEN_COOKIE)?.value;
  const userLocale = decodeLocaleFromToken(idToken);
  const localeNeutralPaths = new Set([
    '/account/thanks',
    '/mypage/registration/thanks',
    '/register/thanks',
  ]);

  if (
    userLocale === 'en' &&
    !pathname.startsWith('/en') &&
    !localeNeutralPaths.has(pathname)
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = `/en${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|wait).*)', '/api/admin/:path*', '/api/license-image'],
};
