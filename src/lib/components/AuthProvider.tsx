'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';

type AppUser = FirebaseUser & { astroDetails?: unknown };

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user as AppUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      if (isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [user, loading, isNewUser, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      // Create session cookie on server
      const response = await fetch('/api/sessionLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (data.isNewUser) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear session cookie on server
      await fetch('/api/sessionLogout', { method: 'POST' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    isNewUser,
    signInWithGoogle,
    logout,
    setIsNewUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 