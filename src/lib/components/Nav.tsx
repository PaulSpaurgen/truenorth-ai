"use client";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import Link from "next/link";
import { auth } from "../firebaseClient";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-white shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-purple-600 hover:text-purple-800 font-medium">
            Dashboard
          </Link>
          {user && (
            <>
              <Link href="/profile" className="text-purple-600 hover:text-purple-800 font-medium">
                Profile
              </Link>
              <Link href="/analytics" className="text-purple-600 hover:text-purple-800 font-medium">
                Analytics
              </Link>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <p className="text-gray-700">{user?.displayName}</p>
            <button 
              onClick={handleSignOut}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
