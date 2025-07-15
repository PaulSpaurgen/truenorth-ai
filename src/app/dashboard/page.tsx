"use client";

import { useUser } from '@/lib/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Chat from '@/lib/components/Chat';

export default function Dashboard() {
  const { user, loading, hasCompletedOnboarding } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    // If user is not authenticated, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user hasn't completed onboarding, redirect to onboarding
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
      return;
    }
  }, [user, loading, hasCompletedOnboarding, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-16">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.displayName || user?.email}</h1>
      <Chat />
    </main>
  );
}
