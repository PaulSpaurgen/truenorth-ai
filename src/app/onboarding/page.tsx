'use client';

import { useUser } from "@/lib/hooks/useUser";
import {  useState } from "react";
import AstroForm, { AstroData } from "@/lib/components/AstroForm";

export default function Onboarding() {
  const { user, loading, hasCompletedOnboarding, setIsNewUser, setUser } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AstroData) => {
    setIsLoading(true);
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
    }
    setIsLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
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

  return <AstroForm onSubmit={handleSubmit} isLoading={isLoading} />;
}   