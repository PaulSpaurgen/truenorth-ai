import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';

// POST { idToken: string }
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const decoded = await verifyAuthToken(idToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 5-day expiry (seconds)
    const expiresIn = 60 * 60 * 24 * 5;

    const res = NextResponse.json({ success: true });
    res.cookies.set('token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
      sameSite: 'lax',
    });

    return res;
  } catch (err) {
    console.error('Error in sessionLogin:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 