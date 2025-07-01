import { NextRequest, NextResponse } from 'next/server'

const USER = '0000'
const PASS = '0000'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/manual_for_system')) {
    const auth = req.headers.get('authorization') || ''
    if (auth.startsWith('Basic ')) {
      const encoded = auth.split(' ')[1]
      try {
        const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':')
        if (user === USER && pass === PASS) {
          return NextResponse.next()
        }
      } catch {
        /* ignore */
      }
    }
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
    })
  }
  return NextResponse.next()
}

export const config = { matcher: ['/manual_for_system/:path*'] }
