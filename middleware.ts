import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const protectedPath = req.nextUrl.pathname.startsWith('/dashboard');

  if (!protectedPath) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token present, assume auth (verified on API routes server-side)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 