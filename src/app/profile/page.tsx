"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useTabSummary } from "@/lib/hooks/useTabSummary";
import { motion } from "framer-motion";

export default function ProfilePage() {

  // const [contextMessage, setContextMessage] = useState("");
  // const [isRefetching, setIsRefetching] = useState(false);
  const {
    data: astroSummary,
    isLoading: isAstroLoading,
    // error: astroError,
    // refetch: refetchAstro,
  } = useTabSummary("astrology");
  const {
    data: destinySummary,
    isLoading: isDestinyLoading,
    // error: destinyError,
    // refetch: refetchDestiny,
  } = useTabSummary("destiny");

  const { user } = useUser();

  console.log({ user });

  if (isAstroLoading || isDestinyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      

      {/* Section 1: Horizontal Summary Boxes */}
      <div className="flex gap-6 mb-8  md:flex-row flex-col   justify-center mt-6 h-fit">
        {/* Astro Summary Box */}
        <motion.div
          className="h-full w-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="bg-[#0E1014] border border-gray-700 font-light text-xs md:text-sm  rounded-2xl p-6 text-white h-full"
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            <h2 className="md:text-2xl text-xl font-semibold  text-[#F1C4A4] mb-4 flex items-center gap-2">
              Astrology Summary
            </h2>
            <p className="text-xs md:text-sm leading-relaxed">{astroSummary}</p>
          </div>
        </motion.div>

        {/* Destiny Cards Summary Box */}
        <motion.div
          className="h-full w-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="bg-[#0E1014] border border-gray-700 font-light text-xs md:text-sm  rounded-2xl p-6 text-white h-full"
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
            }}
          >
            <h2 className="md:text-2xl text-xl font-semibold  text-[#F1C4A4] mb-4 flex items-center gap-2">
              Destiny Cards Summary
            </h2>
            <p className="text-xs md:text-sm leading-relaxed">
              {destinySummary}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Section 2: Chat Interface using existing Chat component */}
      <div className="rounded-lg shadow-lg p-6 mb-8"></div>
    </div>
  );
}
