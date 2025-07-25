'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/lib/hooks/useUser';

export default function UserMenu() {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {user.name?.[0] || user.email?.[0] || '?'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.name || user.email}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-3 border-b">
              <p className="text-sm font-medium text-gray-900">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
} 