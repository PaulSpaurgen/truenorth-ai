"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/components/AuthProvider';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const params = useSearchParams();
  const router = useRouter();

  // If already signed in, redirect back
  useEffect(() => {
    if (!loading && user) {
      const redirectPath = params.get('redirect') || '/';
      router.replace(redirectPath);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  // if (user) {
  //   router.replace('/dashboard');
  //   return null;
  // }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to TrueNorth</h1>
        <button
          onClick={signInWithGoogle}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
