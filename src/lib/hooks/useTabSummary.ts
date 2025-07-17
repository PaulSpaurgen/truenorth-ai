"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

type ChatTab = "cosmic" | "astrology" | "destiny";

export function useTabSummary(tab: ChatTab) {
  const { user } = useUser();

  const endpoint =
    tab === "cosmic"
      ? "/api/cosmic/summary"
      : tab === "astrology"
      ? "/api/astro/summary"
      : tab === "destiny"
      ? "/api/destiny/summary"
      : "/api/hd/summary";

  const fetchSummary = async (): Promise<string> => {
    const res = await fetch(endpoint, { credentials: "include" });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to fetch summary");
    }
    return json.summary as string;
  };

  return useQuery({
    queryKey: ["tabSummary", tab, user?.uid],
    queryFn: fetchSummary,
    enabled: !!user, // only fetch when authenticated
    staleTime: 1000 * 60 * 60 * 12, // 12h
  });
} 