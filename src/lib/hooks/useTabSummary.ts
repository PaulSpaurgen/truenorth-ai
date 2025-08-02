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

  const fetchSummary = async (context?: string, fetchWithPreviousChats?: boolean): Promise<string> => {
    const res = await fetch(endpoint,  { 
      method: 'POST',
      credentials: "include", 
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        contextMessage: context || contextMessage || "",
        fetchWithPreviousChats: fetchWithPreviousChats || false
      })
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
    enabled: !!user, 
    staleTime: 0, 
  });

  return {
    ...query,
    refetch: async (fetchWithPreviousChats?: boolean) => {
      // Fetch with current context and fetchWithPreviousChats parameter
      const result = await fetchSummary(contextMessage, fetchWithPreviousChats);
      // Update the cache with new data
      queryClient.setQueryData(["tabSummary", tab, user?.uid], result);
      return { data: result, error: null };
    }
  };
} 