import { useContext } from 'react';
import { AuthContext } from '@/lib/components/AuthProvider';

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  
  const { user, loading, isNewUser,  signInWithGoogle, logout, setIsNewUser, setUser } = context;
  
  // A user has completed onboarding if they have astroDetails
  const hasCompletedOnboarding = Boolean(user?.astroDetails && Object.keys(user?.astroDetails).length > 0);
  console.log('hasCompletedOnboarding', hasCompletedOnboarding , user?.astroDetails);
  return {
    user,
    loading,
    isNewUser,
    hasCompletedOnboarding,
    signInWithGoogle,
    logout,
    setIsNewUser,
    setUser,
  };
} 