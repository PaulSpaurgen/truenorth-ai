"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "@/lib/components/Logo";

function LoginContent() {
  const { user, signInWithGoogle, loading } = useUser();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const router = useRouter();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6f7c] mx-auto mb-4"></div>
          <p className="text-gray-200">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        {/* <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6f7c] mx-auto mb-4"></div>
          <p className="text-gray-200">Loading...</p>
        </div> */}
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="relative overflow-hidden w-screen h-screen flex items-center justify-center" style={{
          fontFamily: "var(--font-cormorant-garamond), sans-serif",
        }}>
        <AnimatePresence mode="wait">
          {!showLoginOptions ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center">
                <Image
                  src="/Images/logInit.png"
                  alt="TrueNorth"
                  className="mb-2 h-20 md:h-30 w-auto"
                  width={100}
                  height={100}
                />

                <motion.h1 
                  className="font-bold text-6xl md:text-8xl mb-6 text-[#F1C4A4]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  TrueNorth
                </motion.h1>

                <motion.p 
                  className="mb-4 text-white text-xl md:text-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  The Sacred Return to Who We&apos;ve Always Been
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <iframe
                    src="https://lottie.host/embed/112e77db-c31e-42a2-abcc-3c4fd4e5286f/SYJt4jekgg.lottie"
                    className="h-16 w-full max-w-[200px] sm:max-w-sm md:max-w-md lg:max-w-lg mb-6"
                    allowFullScreen
                  ></iframe>
                </motion.div>

                <motion.button
                  onClick={() => setShowLoginOptions(true)}
                  className="text-white px-8 py-3 rounded-full bg-[#1B5C65] cursor-pointer text-lg sm:text-xl shadow-lg hover:brightness-110 mb-30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Begin Your Journey
                </motion.button>
                
                <motion.div
                  className="flex flex-col items-center justify-center"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  <p className="text-white text-center text-xs md:text-base">
                    Discover your cosmic blueprint and navigate life&apos;s journey
                    with clarity and purpose.
                  </p>
                  <p className="text-[#F1C4A4] text-xs md:text-base">
                    TrueNorth connects you to the ancient wisdom of the stars.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              <div className="w-full max-w-sm bg-black/50 p-4 rounded-lg sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center" style={{fontFamily: "var(--font-montserrat), sans-serif"}}>
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Logo/>
                </motion.div>
                
                <motion.button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center text-xs sm:text-sm md:text-lg gap-2 text-white rounded mb-4 py-4"
                  style={{
                    backgroundColor: "#1B5C65",
                    transition: "background-color 0.3s ease, filter 0.3s ease",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 48 48"
                    fill="white"
                  >
                    <path d="M44.5 20H24v8.5h11.8C34.2 33.3 30 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.1 6.4 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.3-7.9 19.3-20 0-1.3-.1-2.4-.3-4z" />
                  </svg>
                  Sign In with Google
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6f7c] mx-auto mb-4"></div>
          <p className="text-gray-200">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
