import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import * as admin from 'firebase-admin';

// POST { idToken: string }
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    console.log('sessionLogin: Received idToken, length:', idToken.length);

    const decoded = await verifyAuthToken(idToken);
    if (!decoded) {
      console.log('sessionLogin: Token verification failed');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('sessionLogin: Token verified for user:', decoded.uid);

    await dbConnect();

    const user = await User.findOne({ uid: decoded.uid });
    const defaultUser = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      photoURL: decoded.picture,
      astroDetails: {},
    }
    if (!user) {
      await User.create(defaultUser);
      console.log('sessionLogin: Created new user');
    } else {
      console.log('sessionLogin: Existing user found');
    }

    // Create a session cookie that lasts 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    
    try {
      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
      console.log('sessionLogin: Session cookie created successfully');
      
      const res = NextResponse.json({ success: true, isNewUser: !user });
      res.cookies.set('token', sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiresIn / 1000, // maxAge expects seconds
        path: '/',
        sameSite: 'lax',
      });
      return res;
    } catch (sessionError) {
      console.error('Error creating session cookie:', sessionError);
      // Fallback to storing the ID token directly (with shorter expiry)
      const res = NextResponse.json({ success: true, isNewUser: !user });
      res.cookies.set('token', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, // 1 hour (ID token expiry)
        path: '/',
        sameSite: 'lax',
      });
      return res;
    }
  } catch (err) {
    console.error('Error in sessionLogin:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
} 