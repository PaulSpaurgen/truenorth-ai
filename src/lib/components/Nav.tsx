"use client";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
// import Link from "next/link";
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
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4">
        {/* <Link href="/dashboard">Dashboard</Link> */}
        {user && (
          <div>
            <p>{user?.displayName}</p>
          </div>
        )}
        {user && <button onClick={handleSignOut}>Sign Out</button>}
      </div>
    </div>
  );
}
