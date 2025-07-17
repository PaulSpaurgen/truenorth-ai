"use client";
import { signOut } from "firebase/auth";
import { useUser } from "@/lib/hooks/useUser";
import { auth } from "../firebaseClient";
import { useRouter } from "next/navigation";

import Image from "next/image";


export default function Nav() {
  const router = useRouter();
  const { user } = useUser();
  const userName = user?.displayName || user?.email || "Cosmic Voyager";
  const userPhotoURL = user?.photoURL; 


  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div>
<div className="fixed top-0 left-0 right-0 flex p-3 bg-[#0E1014] shadow-sm z-10 border-b-[0.3px] border-b-white">        {/* <div className="flex items-center space-x-4">
          
          {user && (
            <>
              <Link href="/dashboard" className="text-white  font-l"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}>
                Dashboard
              </Link>
              <Link href="/profile" className="text-white  font-l"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}>
                Profile
              </Link>
              <Link href="/analytics" className="text-white  font-l"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}>
                Analytics
              </Link>
            </>
          )}
        </div> */}
        {user && (
          <div className="flex justify-between items-center w-full ">
          <button
              className="flex items-center gap-2 text-white rounded py-2 px-3 font-medium hover:bg-[#2a4f5c] transition-colors"
              style={{ fontFamily: "montserrat,serif, Georgia" }}
            >
              {userPhotoURL ? (
                <Image
                  src={userPhotoURL}
                  alt={userName}
                  width={32} 
                  height={32} 
                  className="rounded-full object-cover"
                />
              ) : (
                // Fallback for no profile picture (e.g., a simple circle or initial)
                <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              {userName}
            </button>
        
          
          <div className="flex flex-row items-center ml-[-40px]">
          <img src="/star.svg" alt="Star Logo" className="h-8 w-auto mr-2" />
          <p className="text-white text-4xl"
          style={{ fontFamily: 'montserrat,serif, Georgia' }}
          >TrueNorth</p>
          </div>
        
          <div>
          <button
              onClick={handleSignOut}
              className="text-white px-4 py-0.5 border border-white font-medium hover:bg-[#2a4f5c] transition-colors flex items-center gap-2"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}
            >
              Sign Out
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#F1C4A5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
