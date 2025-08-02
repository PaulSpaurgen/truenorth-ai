import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect pages, not API routes (API routes use withAuth)
  const isProtected = pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/profile') || 
                     pathname.startsWith('/analytics');

  if (!isProtected) return NextResponse.next();

  // Read token issued during /api/sessionLogin
  const token = req.cookies.get('token')?.value;

  // If missing token –> redirect to login for pages
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For pages, just check if token exists (withAuth will handle API validation)
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/analytics/:path*'],
}; 