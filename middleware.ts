import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login & logout without an existing cookie
  const isAuthEndpoint =
    pathname.startsWith('/api/sessionLogin') ||
    pathname.startsWith('/api/sessionLogout');

  const isProtected =
    (pathname.startsWith('/api') && !isAuthEndpoint) ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/analytics');

  if (!isProtected) return NextResponse.next();

  // Read token issued during /api/sessionLogin
  const token = req.cookies.get('token')?.value;

  // If missing token –> redirect to login for pages, 401 for API
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode token payload (without verifying) to extract basic user info.
  let uid: string | undefined;
  let email: string | undefined;
  let name: string | undefined;
  let picture: string | undefined;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decode = typeof atob === 'function' ? atob : (b: string) => Buffer.from(b, 'base64').toString('binary');
    const jsonPayload = JSON.parse(decode(base64));
    uid = jsonPayload.user_id || jsonPayload.uid || jsonPayload.sub;
    email = jsonPayload.email;
    name = jsonPayload.name;
    picture = jsonPayload.picture;
  } catch (e) {
    console.error('Failed to decode JWT payload in middleware:', e);
  }

  const requestHeaders = new Headers(req.headers);
  if (uid) requestHeaders.set('x-user-uid', uid);
  if (email) requestHeaders.set('x-user-email', email);
  if (name) requestHeaders.set('x-user-name', name);
  if (picture) requestHeaders.set('x-user-picture', picture);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/analytics/:path*', '/api/:path*'],
}; 