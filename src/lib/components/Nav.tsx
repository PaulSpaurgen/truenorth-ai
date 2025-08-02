"use client";
import { signOut } from "firebase/auth";
import { useUser } from "@/lib/hooks/useUser";
import { auth } from "../services/firebaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "./Logo";
import { FaHome } from "react-icons/fa";

export default function Nav() {
  const router = useRouter();
  const { user } = useUser();

  const userName = user?.name || user?.email || "User";
  const userPhotoURL = user?.photoURL;

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      {user && (
        <div className="flex justify-between items-center w-full  p-2 sm:px-3 sm:py-4 bg-[#0E1014] shadow-sm z-10 border-b-[0.1px] border-b-gray-800">
          <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 text-white text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-4 font-light transition-colors cursor-pointer hover:bg-[#2a4f5c]"
            onClick={() => router.push("/profile")}
          >
            {userPhotoURL && (
              <Image
                src={userPhotoURL}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full h-6 sm:h-8 w-6 sm:w-8"
              />
            )}
            <span className="hidden sm:inline">{userName}</span>
          </button>
          <button
            className="flex items-center gap-2 text-white text-xs sm:text-sm py-1.5 px-2 sm:py-2 sm:px-4 font-light transition-colors cursor-pointer hover:bg-[#2a4f5c]"
            onClick={() => router.push("/dashboard")}
          >
            <FaHome className="text-[#F1C4A5] text-[16px]" />
          </button>
          </div>
          <Logo />

          <div className="flex-shrink-0">
            <button
              onClick={handleSignOut}
              className="text-white px-3 py-1 sm:px-4 sm:py-2 cursor-pointer border text-sm font-light border-gray-600 hover:bg-[#2a4f5c] transition-colors flex items-center gap-2"
            >
              <span className="hidden md:inline">Sign Out</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 sm:h-5 w-4 sm:w-5"
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
  );
}
