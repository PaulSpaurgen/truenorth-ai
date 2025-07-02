'use client';

import { useAuth } from "@/lib/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AstroForm, { AstroData } from "@/lib/components/AstroForm";

export default function Onboarding() {
  const { isNewUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: AstroData) => {
    const response = await fetch('/api/astrodetails', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });
    const res = await response.json();

    if (res.success) {
        router.push('/dashboard');
    }
  }

  useEffect(() => {
    if (!isNewUser) {
      router.push('/');
    }
  }, [isNewUser, router]);

  if (!isNewUser) {
    return null;
  }

  return <AstroForm onSubmit={handleSubmit} />;
}   