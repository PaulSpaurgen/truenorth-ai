'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

type AppUser = FirebaseUser & { astroDetails?: unknown };

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  setUser: (value: AppUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated, ensure session is established
        if (!sessionEstablished) {
          try {
            const idToken = await firebaseUser.getIdToken();
            await sessionLogin(idToken);
            setSessionEstablished(true);
          } catch (error) {
            console.error('Error establishing session:', error);
          }
        }
      } else {
        // User is not authenticated
        setUser(null);
        setIsNewUser(false);
        setSessionEstablished(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionEstablished]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await sessionLogin(idToken);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

   const sessionLogin = async (idToken: string) => {
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
    setUser(data?.user);
    setSessionEstablished(true);
   }

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear session cookie on server
      await fetch('/api/sessionLogout', { method: 'POST' });
      setSessionEstablished(false);
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
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 