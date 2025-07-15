'use client';

import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AstroForm, { AstroData } from "@/lib/components/AstroForm";

export default function Onboarding() {
  const { user, loading, hasCompletedOnboarding, setIsNewUser, setUser } = useUser();
  const router = useRouter();

  const handleSubmit = async (data: AstroData) => {
    const response = await fetch('/api/saveUserData', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });
    const res = await response.json();

    if (res.success) {
      setIsNewUser(false);
      setUser(res.user);
      router.push('/dashboard');
    }
  }

  useEffect(() => {
    if (loading) return;
    
    // If user is not authenticated, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user has already completed onboarding, redirect to dashboard
    if (hasCompletedOnboarding) {
      router.push('/dashboard');
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

  if (!user || hasCompletedOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <AstroForm onSubmit={handleSubmit} />;
}   