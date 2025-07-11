"use client";

import { useAuth  } from '@/lib/components/AuthProvider';
import { useEffect } from 'react';
import Chat from '@/lib/components/Chat';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("user", user);
    }
  }, [user]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-16">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.displayName || user?.email}</h1>
      <Chat />
    </main>
  );
}
