"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";

type ChatTab = "cosmic" | "astrology" | "destiny";

export function useTabSummary(tab: ChatTab, contextMessage?: string) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const endpoint =
    tab === "cosmic"
      ? "/api/cosmic/summary"
      : tab === "astrology"
      ? "/api/astro/summary"
      : tab === "destiny"
      ? "/api/destiny/summary"
      : "/api/hd/summary";

  const fetchSummary = async (context?: string): Promise<string> => {
    const res = await fetch(endpoint,  { 
      method: 'POST',
      credentials: "include", 
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contextMessage: context || contextMessage || "" })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to fetch summary");
    }
    return json.summary as string;
  };

  const query = useQuery({
    queryKey: ["tabSummary", tab, user?.uid],
    queryFn: () => fetchSummary(),
    enabled: !!user, // only fetch when authenticated
    staleTime: 0, // 12h
  });

  return {
    ...query,
    refetch: async () => {
      // Fetch with current context directly
      const result = await fetchSummary(contextMessage);
      // Update the cache with new data
      queryClient.setQueryData(["tabSummary", tab, user?.uid], result);
      return { data: result, error: null };
    }
  };
} 