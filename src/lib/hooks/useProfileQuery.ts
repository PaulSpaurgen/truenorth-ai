'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/AuthProvider';

export interface ProfileData {
  natalChart: {
    input: {
      year: number;
      month: number;
      date: number;
      hours: number;
      minutes: number;
      latitude: number;
      longitude: number;
      timezone: number;
      settings: {
        observation_point: string;
        ayanamsha: string;
      };
    };
    output: Array<{
      [key: string]: {
        name?: string;
        fullDegree?: number;
        normDegree?: number;
        current_sign?: number;
        isRetro?: string;
      };
    }>;
  };
  currentTransits: {
    input: {
      year: number;
      month: number;
      date: number;
      hours: number;
      minutes: number;
    };
    output: Array<{
      [key: string]: {
        name?: string;
        fullDegree?: number;
        normDegree?: number;
        current_sign?: number;
        isRetro?: string;
      };
    }>;
  };
  astroSummary: string;
  humanDesignSummary: string;
  cumulativeSummary: string;
  generatedAt: string;
  nextUpdate: string;
}

/**
 * Get current date in user's timezone for cache key
 */
const getCurrentDateInTimezone = (timezoneOffset: number): string => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (timezoneOffset * 3600000));
  return localTime.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Fetch profile data from API
 */
const fetchProfileData = async (): Promise<ProfileData> => {
  // Fetch base profile (natal details, dates)
  const baseRes = await fetch('/api/profile');
  if (!baseRes.ok) {
    const err = await baseRes.json();
    throw new Error(err.error || 'Failed to fetch profile');
  }
  const baseJson = await baseRes.json();

  // Fetch summaries in parallel
  const [astroRes, hdRes, cumulativeRes] = await Promise.all([
    fetch('/api/summary/astro'),
    fetch('/api/summary/human-design'),
    fetch('/api/summary/cumulative'),
  ]);

  if (!astroRes.ok || !hdRes.ok || !cumulativeRes.ok) {
    throw new Error('Failed to fetch summaries');
  }

  const astroJson = await astroRes.json();
  const hdJson = await hdRes.json();
  const cumulativeJson = await cumulativeRes.json();

  return {
    ...baseJson.profile,
    astroSummary: astroJson.summary,
    humanDesignSummary: hdJson.summary,
    cumulativeSummary: cumulativeJson.summary,
  } as ProfileData;
};

/**
 * Custom hook for profile data with React Query
 */
export const useProfileQuery = () => {
  const { user } = useAuth();

  // Get user's timezone from their stored astro data
  // This would require fetching user data first, but for now we'll use a simpler approach
  // You can enhance this by creating a separate query for user data and using it here
  const userTimezone = 0; // Default to UTC, but you can enhance this

  // Create cache key that changes daily based on user's timezone
  const today = getCurrentDateInTimezone(userTimezone);
  const queryKey = ['profile', user?.uid, today];

  return useQuery({
    queryKey,
    queryFn: fetchProfileData,
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 1000 * 60 * 60 * 12, // 12 hours - data is fresh for half a day
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for a full day
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && error.message.includes('401')) return false;
      if (error instanceof Error && error.message.includes('403')) return false;
      return failureCount < 2;
    },
    // Add some additional React Query best practices
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours in background
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}; 