import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/services/firebaseAdmin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export type RouteHandlerWithUser = (req: Request, user: DecodedIdToken) => Promise<Response> | Response;

/**
 * Higher-order helper that ensures the request passed the global auth middleware.
 * Usage:
 *   export const POST = withAuth(async (req, user) => { ... })
 */
export function withAuth(handler: RouteHandlerWithUser) {
  return async function authWrapped(req: Request): Promise<Response> {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/token=([^;]+)/);
      if (!match) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = decodeURIComponent(match[1]);
      const decoded = await verifyAuthToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return handler(req, decoded);
    } catch (error) {
      console.error('withAuth error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
} 