'use client';
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
// import Link from "next/link";
import { auth } from "../firebaseClient";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  }
  return <div>
    <div className="flex justify-between items-center p-4">
        {/* <Link href="/dashboard">Dashboard</Link> */}

        <button onClick={handleSignOut}>Sign Out</button>
    </div>
  </div>;
}