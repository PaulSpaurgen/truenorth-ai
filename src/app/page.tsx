'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/components/AuthProvider';

export default function Home() {
  const { user, loading , isNewUser} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && isNewUser) {
      router.replace('/onboarding');
    } else if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router, isNewUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );
}