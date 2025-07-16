"use client";
import { signOut } from "firebase/auth";
import { useUser } from "@/lib/hooks/useUser";
import Link from "next/link";
import { auth } from "../firebaseClient";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-[#0E1014 ] shadow-sm z-10">
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
          <div className="flex items-center space-x-4">
            <p className="text-gray-700">{user?.displayName}</p>
            <button 
              onClick={handleSignOut}
              className="bg-[#3a6f7c] text-white  rounded p-3 font-medium hover:bg-[#2a4f5c] transition-colors"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
