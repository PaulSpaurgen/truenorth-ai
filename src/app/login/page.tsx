"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';

function LoginContent() {
  const { user, signInWithGoogle, loading } = useUser();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const router = useRouter();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState('signIn'); // State for tabs: 'signIn' or 'signUp'

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
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-gray-950" 
      style={{ backgroundImage: 'url("/images/true-north-star-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="relative bg-black bg-opacity-90 p-8 rounded-lg shadow-xl text-center overflow-hidden w-screen h-screen flex items-center justify-center"> 
        
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${!showLoginOptions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center">
            <img src="/images/truenorth-logo-white.png" alt="TrueNorth Logo" className="mb-4 h-12" />
            <h1 className="text-7xl font-normal mb-6 text-[#ffba74]" style={{ fontFamily: 'serif, Georgia' }}>TrueNorth</h1>
            <p className="text-xl  mb-6 text-white" style={{ fontFamily: 'Times New Roman, serif' }}>The Sacred Return to Who We've Always Been</p>
            <button
              onClick={() => setShowLoginOptions(true)}
              className="text-white px-8 py-3 rounded-full text-xl  shadow-lg hover:brightness-110 mt-20 mb-30"
              style={{ backgroundColor: '#134f5c', transition: 'background-color 0.3s ease, filter 0.3s ease' }}
            >
              Begin Your Journey
            </button>
            <p className="text-base whitespace-nowrap  text-gray-400">Discover your cosmic blueprint and navigate life's journey with clarity and purpose.</p>
            <p className="text-base whitespace-nowrap text-[#ffba74]">TrueNorth connects you to the ancient wisdom of the stars.</p>
            
          </div>
        </div>

        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${showLoginOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <div className="w-[35%] max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center bg-black bg-opacity-90 p-8 rounded-lg shadow-xl border-1 mt-auto border-white ">
            <img src="/images/truenorth-logo-dark.png" alt="TrueNorth Logo" className="mb-4 h-10" />
            <h1 className="text-3xl  mb-6 text-white" style={{ fontFamily: 'serif, Georgia' }}>TrueNorth</h1>
            
            <div className="flex w-full mb-6 border-b border-gray-700">
              <button 
                className={`flex-1 pb-2  text-lg ${activeTab === 'signIn' ? 'border-b-2 border-[#3a6f7c] text-[#3a6f7c]' : 'text-gray-400'}`}
                onClick={() => setActiveTab('signIn')}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 pb-2  text-lg ${activeTab === 'signUp' ? 'border-b-2 border-[#3a6f7c] text-[#3a6f7c]' : 'text-gray-400'}`}
                onClick={() => setActiveTab('signUp')}
              >
                
              </button>
            </div>
            
            {activeTab === 'signIn' ? (
              <>
                <input
                  type="email"
                  placeholder="@email.com"
                  className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a6f7c]"
                />
                <input
                  type="password"
                  placeholder="********"
                  className="w-full p-3 mb-2 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a6f7c]"
                />

                <button
                onClick={handleGoogleSignIn}
                  className="w-full text-white px-6 py-2 rounded  mt-5 mb-4 hover:brightness-110"
                  style={{ backgroundColor: '#3a6f7c', transition: 'background-color 0.3s ease, filter 0.3s ease' }}
                >
                  Sign In
                </button>
                <div className="relative w-full mb-4">
                  <span className="block absolute left-0 right-0 top-1/2 h-px bg-gray-700 -translate-y-1/2"></span>
                  <span className="relative z-10 bg-gray-800 bg-opacity-90 px-2 text-gray-400">or</span>
                </div>
                <div className="flex w-full justify-center">
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center border border-gray-700 rounded-full py-2 px-6 text-gray-200 hover:bg-gray-700 w-full"
                    disabled={isSigningIn}
                  >
                    
                    Sign in with Google
                  </button>
                </div>
                
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder=" Name"
                  className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a6f7c]"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a6f7c]"
                />
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full p-3 mb-4 border border-gray-700 rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a6f7c]"
                />
                
                <button
                  className="w-full text-white px-6 py-2 rounded mb-4 hover:brightness-110"
                  style={{ backgroundColor: '#3a6f7c', transition: 'background-color 0.3s ease, filter 0.3s ease' }}
                >
                  Temp
                </button>
                <div className="relative w-full mb-4">
                  <span className="block absolute left-0 right-0 top-1/2 h-px bg-gray-700 -translate-y-1/2"></span>
                  <span className="relative z-10 bg-gray-800 bg-opacity-90 px-2 text-gray-400">or</span>
                </div>
                <div className="flex w-full justify-center">
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center border border-gray-700 rounded-full py-2 px-6 text-gray-200 hover:bg-gray-700 w-full"
                    disabled={isSigningIn}
                  >
                    Sign Up with Google
                  </button>
                </div>
                
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a6f7c] mx-auto mb-4"></div>
        <p className="text-gray-200">Loading...</p>
      </div>
    </div>}>
      <LoginContent />
    </Suspense>
  );
}