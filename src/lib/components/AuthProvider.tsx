"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/services/firebaseClient";
import { useRouter, usePathname } from "next/navigation";
import { type NatalChartData } from "@/lib/services/astroCalculation";
import { type DestinyCard } from "@/lib/services/destinyCards";

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  astroDetails: NatalChartData;
  destinyCard: DestinyCard;
  birthData: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
  };
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  setUser: (value: AppUser) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isSeesionLoginInProgress = useRef(false);

  // Handle routing based on auth state
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    console.log("🔐 AuthProvider - Routing check:", {
      pathname,
      user: !!user,
      isNewUser,
    });

    // Public routes that don't need auth
    const publicRoutes = ["/login", "/onboarding"];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isOnboardingCompleted =
      user?.astroDetails && Object.keys(user?.astroDetails).length > 0;

    if (!user) {
      // User not authenticated
      if (!isPublicRoute && pathname !== "/") {
        console.log("🔐 AuthProvider - No user, redirecting to login");
        router.push("/login");
      }
      return;
    }

    // User is authenticated
    if (isNewUser && pathname !== "/onboarding") {
      // New user needs onboarding
      console.log("🔐 AuthProvider - New user, redirecting to onboarding");
      router.push("/onboarding");
      return;
    }

    // User is authenticated and has completed onboarding
    if (
      pathname === "/" ||
      pathname === "/login" ||
      (pathname === "/onboarding" && isOnboardingCompleted)
    ) {
      console.log("🔐 AuthProvider - User ready, redirecting to dashboard");
      router.push("/profile");
      return;
    }
  }, [user, loading, isNewUser, pathname, router]);

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
            console.error("Error establishing session:", error);
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
      console.error("Error signing in with Google:", error);
    }
  };

  const sessionLogin = async (idToken: string) => {
    if (isSeesionLoginInProgress.current) return;
    isSeesionLoginInProgress.current = true;
    const response = await fetch("/api/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    isSeesionLoginInProgress.current = false;
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear session cookie on server
      await fetch("/api/sessionLogout", { method: "POST" });
      setSessionEstablished(false);
    } catch (error) {
      console.error("Error signing out:", error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
