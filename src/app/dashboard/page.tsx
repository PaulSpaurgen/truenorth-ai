"use client";

import { useAuth } from '@/lib/components/AuthProvider';
import Chat from '@/lib/components/Chat';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold">Welcome, {user?.displayName || user?.email}</h1>
      <Chat />
    </main>
  );
}
