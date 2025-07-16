"use client";

import { useUser } from '@/lib/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Chat from '@/lib/components/Chat'; // Ensure this path is correct
type Tab = 'cosmic' | 'astrology' | 'human-design';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('cosmic');
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
    <>
      <div className="flex justify-center w-full fixed top-16 z-10">
          <div className="flex w-fit border border-gray-700 bg-gray-900/50  top-0 z-10 ">
            <button
              onClick={() => setActiveTab('cosmic')}
              className={`px-4 py-1.5 border-r border-gray-700  text-md transition-colors cursor-pointer ${activeTab === 'cosmic' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50 '} `}
              style={{ fontFamily: 'serif' }}
            >
              Cosmic
            </button>
            <button
              onClick={() => setActiveTab('astrology')}
              className={`px-4 py-1.5 border-r border-gray-700  text-md transition-colors cursor-pointer ${activeTab === 'astrology' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50'}`}
            >
              Astrology
            </button>
            <button
              onClick={() => setActiveTab('human-design')}
              className={`px-4 py-1.5 border-r border-gray-700  text-md transition-colors cursor-pointer ${activeTab === 'human-design' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50'}`}
            >
               Cards System
            </button>
          </div>
      </div>
      <Chat />
    </>
  );
}