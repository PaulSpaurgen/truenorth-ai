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
<div className="">   
       {/* <div className="flex items-center space-x-4">
          
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
          <div className="flex justify-between items-center w-full fixed top-0 left-0 right-0 p-2 sm:p-3 bg-[#0E1014] shadow-sm z-10 border-b-[0.3px] border-b-white"
            style={{
              minHeight: "clamp(48px, 7vw, 72px)",
              paddingRight: "clamp(0.5rem, 3vw, 2.5rem)",
            }}
          >
            <button
              className="flex items-center gap-2 text-white rounded py-1.5 px-2 sm:py-2 sm:px-3 font-medium hover:bg-[#2a4f5c] transition-colors"
              style={{
                fontFamily: "montserrat,serif, Georgia",
                fontSize: "clamp(0.75rem, 2vw, 0.95rem)",
                maxWidth: "clamp(220px, 50vw, 400px)",
                overflow: "visible",
                whiteSpace: "nowrap",
              }}
            >
              {userPhotoURL && (
                <Image
                  src={userPhotoURL}
                  alt={userName}
                  width={28}
                  height={28}
                  className="rounded-full"
                  style={{
                    width: "clamp(1.7rem, 4vw, 2.1rem)",
                    height: "clamp(1.7rem, 4vw, 2.1rem)",
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "clamp(0.6rem, 2vw, 0.95rem)",
                  display: "inline-block",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                  overflow: "visible",
                  textOverflow: "unset",
                  maxWidth: "none",
                }}
              >
                {userName}
              </span>
            </button>

            <div className="flex flex-row items-center mx-2 sm:mx-0">
              <img
                src="/star.svg"
                alt="Star Logo"
                className="h-7 w-auto sm:h-8 mr-1 sm:mr-2"
                style={{
                  height: "clamp(1.5rem, 4vw, 2.25rem)",
                  minWidth: "clamp(1.5rem, 4vw, 2.25rem)",
                }}
              />
              <p
                className="text-white"
                style={{
                  fontFamily: "montserrat,serif, Georgia",
                  fontSize: "clamp(1rem, 5vw, 2.5rem)",
                  lineHeight: 1.1,
                  letterSpacing: "0.01em",
                  fontWeight: 500,
                  marginBottom: 0,
                }}
              >
                TrueNorth
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={handleSignOut}
                className="text-white px-3 sm:px-4 py-1 border border-white font-medium hover:bg-[#2a4f5c] transition-colors flex items-center gap-2"
                style={{
                  fontFamily: "montserrat,serif, Georgia",
                  fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
                  
                }}
              >
                <span className="hidden md:inline">Sign Out</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  style={{
                    height: "clamp(1.1rem, 3vw, 1.25rem)",
                    width: "clamp(1.1rem, 3vw, 1.25rem)",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#F1C4A5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
