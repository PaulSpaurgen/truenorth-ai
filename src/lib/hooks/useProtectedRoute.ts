import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './useUser';

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requireOnboarding?: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, loading, hasCompletedOnboarding , isNewUser } = useUser();
  const router = useRouter();
  const { redirectTo = '/dashboard', requireOnboarding = isNewUser } = options;

  console.log('user', isNewUser, requireOnboarding, hasCompletedOnboarding);
  
  useEffect(() => {
    // Wait until loading is complete
    if (loading) return;
    
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user is logged in but hasn't completed onboarding, redirect to onboarding
    if (requireOnboarding || !hasCompletedOnboarding) {
      router.push('/onboarding');
      return;
    }
    
    // User is authenticated and has completed onboarding (if required)
    // Redirect to specified path
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [user, loading, hasCompletedOnboarding, router, redirectTo, requireOnboarding]);
  
  return { 
    user, 
    loading, 
    hasCompletedOnboarding,
    isAuthenticated: !!user,
    isReady: !loading
  };
} 