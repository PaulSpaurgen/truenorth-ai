import * as admin from 'firebase-admin';

// Initialize Firebase Admin once per cold start.
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase service account environment variables');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function verifyAuthToken(token: string) {
  try {
    
    // First try to verify as a session cookie
    try {
      const decoded = await admin.auth().verifySessionCookie(token, true);
      return decoded;
    } catch {
      
      // If session cookie verification fails, try as ID token
      const decoded = await admin.auth().verifyIdToken(token);
      console.log('verifyAuthToken: ID token verified successfully for user:', decoded.uid);
      return decoded;
    }
  } catch (err) {
    console.error('Error verifying Firebase token:', err);
    console.error('Token that failed verification:', token.substring(0, 50) + '...');
    return null;
  }
} 