"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import Image from 'next/image';

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6f7c] mx-auto mb-4"></div>
          <p className="text-gray-200">Loading...</p>
        </div>
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
    <main
      className="min-h-screen flex items-center justify-center"
    >
      <div className="relative overflow-hidden w-screen h-screen flex items-center justify-center"> 
        
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${!showLoginOptions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center "> 
            <Image src="/star.svg" alt="TrueNorth" className="mb-4 h-12" width={48} height={48} />
            
            
            <h1
              className="font-normal mb-2 text-[#F1C4A4]"
              style={{
                fontFamily: 'montserrat,serif, Georgia',
                fontSize: 'clamp(2.5rem, 8vw, 5rem)'
              }}
            >
              TrueNorth
            </h1>
            
            
            <p
              className="mb-6 text-white"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: 'clamp(1.03rem, 3vw, 1.7rem)'
              }}
            >
              The Sacred Return to Who We&apos;ve Always Been
            </p>
            <iframe 
              src="https://lottie.host/embed/112e77db-c31e-42a2-abcc-3c4fd4e5286f/SYJt4jekgg.lottie" 
              className="h-16 w-full max-w-[200px] sm:max-w-sm md:max-w-md lg:max-w-lg mb-6" 
              allowFullScreen
            ></iframe>

            <button
              onClick={() => setShowLoginOptions(true)}
              className="text-white px-8 py-3 rounded-full text-lg sm:text-xl shadow-lg hover:brightness-110 mb-30"
              style={{ backgroundColor: '#1B5C65', transition: 'background-color 0.3s ease, filter 0.3s ease', fontFamily: 'montserrat,serif, Georgia' }}
            >
              Begin Your Journey
            </button>
            <p
              className="whitespace-nowrap text-white"
              style={{
                fontFamily: 'montserrat,serif, Georgia',
                fontSize: 'clamp(0.65rem, 3vw, 1.125rem)'
              }}
            >
              Discover your cosmic blueprint and navigate life&apos;s journey with clarity and purpose.
            </p>
            <p
              className="whitespace-nowrap text-[#F1C4A4]"
              style={{
                fontFamily: 'montserrat,serif, Georgia',
                fontSize: 'clamp(0.65rem, 3vw, 1.125rem)'
              }}
            >
              TrueNorth connects you to the ancient wisdom of the stars.
            </p>
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${showLoginOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          
          <div className="w-full max-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center bg-black bg-opacity-90 p-8 rounded-lg shadow-xl border-[0.1px] border-gray-600">  {/* Kept bg-opacity on inner div for content readability */}
            
            <div className="flex items-center justify-center mb-6">
              <Image src="/star.svg" alt="TrueNorth Logo" className="h-8 w-8 mr-2" width={32} height={32} />
              <h1
                className="text-2xl sm:text-3xl text-white"
                style={{
                  fontFamily: 'montserrat,serif, Georgia',
                  fontSize: 'clamp(1.3rem, 4vw, 2.2rem)'
                }}
              >
                TrueNorth
              </h1>
            </div>
            
            <div className="flex w-full mb-6 border-b-[0.3px] border-gray-700">
              <button 
                className="flex-1 pb-2 border-b-1 border-[#3a6f7c] text-white"
                style={{ 
                  fontFamily: 'montserrat,serif, Georgia',
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
                }}
              >
                Sign In
              </button>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 text-white  py-5 rounded mb-4 hover:brightness-110 px-4"
              style={{
                backgroundColor: '#1B5C65',
                transition: 'background-color 0.3s ease, filter 0.3s ease',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 48 48"
                fill="white"
              >
                <path d="M44.5 20H24v8.5h11.8C34.2 33.3 30 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.1 6.4 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.6 0 19.3-7.9 19.3-20 0-1.3-.1-2.4-.3-4z"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        </div>
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