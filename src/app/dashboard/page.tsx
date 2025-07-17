"use client";

import { useUser } from '@/lib/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Chat from '@/lib/components/Chat';
type Tab = 'cosmic' | 'astrology' | 'human-design';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('cosmic');
  const { user, loading, hasCompletedOnboarding } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

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
    <>
      <div className="flex justify-center w-full fixed top-30 z-10">
        <div className="flex w-2/3 md:w-2/3 lg:w-1/3 border bg-gray-900/50 top-0 z-10">
          <button
            onClick={() => setActiveTab('cosmic')}
            className={`px-4 flex-1 py-1.5 border text-md transition-colors cursor-pointer relative
              ${activeTab === 'cosmic' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-20 text-white border-gray-900'}`}
            style={{ fontFamily: 'serif' }}
          >
            Cosmic
          </button>

          <button
            onClick={() => setActiveTab('astrology')}
            className={`px-4 flex-1 py-1.5 border -ml-px text-md transition-colors cursor-pointer relative
              ${activeTab === 'astrology' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-10 text-white border-gray-900'}`}
            style={{ fontFamily: 'serif' }}
          >
            Astrology
          </button>

          <button
            onClick={() => setActiveTab('human-design')}
            
            className={`px-4 flex-1 py-1.5 border -ml-px text-md transition-colors cursor-pointer relative
              ${activeTab === 'human-design' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-0 text-white border-gray-900'}`}
            style={{ fontFamily: 'serif' }}
          >
            Cards System
          </button>
        </div>
      </div>
      <Chat />
    </>
  );
}