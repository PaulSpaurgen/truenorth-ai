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

export async function verifyAuthToken(idToken: string) {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded; // contains uid, email, etc.
  } catch (err) {
    console.error('Error verifying Firebase ID token:', err);
    return null;
  }
} 