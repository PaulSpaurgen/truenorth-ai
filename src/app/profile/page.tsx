"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useTabSummary } from "@/lib/hooks/useTabSummary";
import { motion } from "framer-motion";
import Modal from "@/lib/components/Modal";
import { useState } from "react";
import Image from "next/image";
import { FaUserAlt, FaSync } from "react-icons/fa";
import ChatSessionsTab from "@/lib/components/ChatSessionsTab";
import BgLogo from "@/lib/components/BgLogo";

export default function ProfilePage() {
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: astroSummary,
    isLoading: isAstroLoading,
    refetch: refetchAstro,
  } = useTabSummary("astrology");
  const {
    data: destinySummary,
    isLoading: isDestinyLoading,
    refetch: refetchDestiny,
  } = useTabSummary("destiny");

  const { user } = useUser();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Use the hook's refetch functionality with fetchWithPreviousChats context
      await Promise.all([
        refetchAstro(true),
        refetchDestiny(true),
      ]);
    } catch (error) {
      console.error('Error refreshing summaries:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log({ user });

  if (isAstroLoading || isDestinyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
    <BgLogo />
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center">
        <button
          className="text-white px-3 py-1 text-xs md:text-sm sm:px-4 sm:py-2 cursor-pointer border text-sm font-light border-gray-600 hover:bg-[#2a4f5c] transition-colors flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaUserAlt className="text-[#F1C4A5]" />
          View profile data
        </button>
        <button
          className="text-white px-3 py-1 text-xs md:text-sm sm:px-4 sm:py-2 cursor-pointer border text-sm font-light border-gray-600 hover:bg-[#2a4f5c] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <FaSync className={`text-[#F1C4A5] ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="User Profile Details"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#1A1B1E] border border-gray-700 p-6 rounded-xl">
            <h4 className="font-semibold text-[#F1C4A4] mb-4 text-lg">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.photoURL && (
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-400">
                    Profile Picture:
                  </span>
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mt-2 border-2 border-gray-600"
                    width={64}
                    height={64}
                  />
                </div>
              )}
              <div>
                <span className="text-sm text-gray-400">Date of Birth:</span>
                <p className="font-medium text-white">
                  {user?.birthData?.date || "N/A"} -{" "}
                  {user?.birthData?.month || "N/A"} -{" "}
                  {user?.birthData?.year || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Name:</span>
                <p className="font-medium text-white">{user?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-400">Email:</span>
                <p className="font-medium text-white">{user?.email || "N/A"}</p>
              </div>
            </div>
          </div>
          {/* Destiny Card */}
          {user?.destinyCard &&
          typeof user.destinyCard === "object" &&
          "card" in user.destinyCard ? (
            <div className="bg-[#1A1B1E] border border-gray-700 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-400 mb-4 text-lg">
                Destiny Card
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Card:</span>
                  <p className="font-medium text-lg text-white">
                    {
                      (
                        user.destinyCard as {
                          card: string;
                          rank: string;
                          suit: string;
                          description: string;
                        }
                      ).card
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Rank:</span>
                  <p className="font-medium text-white">
                    {
                      (
                        user.destinyCard as {
                          card: string;
                          rank: string;
                          suit: string;
                          description: string;
                        }
                      ).rank
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Suit:</span>
                  <p className="font-medium text-white">
                    {
                      (
                        user.destinyCard as {
                          card: string;
                          rank: string;
                          suit: string;
                          description: string;
                        }
                      ).suit
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Description:</span>
                  <p className="text-sm mt-2 text-gray-300 leading-relaxed">
                    {
                      (
                        user.destinyCard as {
                          card: string;
                          rank: string;
                          suit: string;
                          description: string;
                        }
                      ).description
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Astrological Data */}
          {user?.astroDetails &&
          typeof user.astroDetails === "object" &&
          user.astroDetails.planets ? (
            <div className="bg-[#1A1B1E] border border-gray-700 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-400 mb-4 text-lg">
                Astrological Data
              </h4>
              
              {/* Birth Information */}
              {user.astroDetails.birthInfo && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">
                    Birth Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="text-white">{user.astroDetails.birthInfo.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="text-white">
                        {user.astroDetails.birthInfo.latitude}°N, {user.astroDetails.birthInfo.longitude}°E
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timezone:</span>
                      <p className="text-white">
                        UTC{user.astroDetails.birthInfo.timezone >= 0 ? '+' : ''}{user.astroDetails.birthInfo.timezone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Planetary Positions */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-400 mb-3">
                  Planetary Positions
                </h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {Object.entries(user.astroDetails.planets).map(([planetKey, planetData]: [string, {
                     name: string;
                     position: {
                       degrees: number;
                       minutes: number;
                       seconds: number;
                       longitude: number;
                     };
                     signName: string;
                     retrograde: boolean;
                   }]) => {
                     if (planetData && planetData.position && planetData.signName) {
                       return (
                         <div
                           key={planetKey}
                           className="bg-[#0E1014] border border-gray-600 p-3 rounded-lg"
                         >
                           <span className="text-sm font-medium text-gray-400">
                             {planetData.name}:
                           </span>
                           <p className="text-sm text-white">
                             {planetData.position.degrees}°{planetData.position.minutes}&apos;{planetData.position.seconds}&quot; {planetData.signName}
                             {planetData.retrograde ? " (Retrograde)" : ""}
                           </p>
                         </div>
                       );
                     }
                     return null;
                   }).filter(Boolean)}
                </div>
              </div>

              {/* Chart Patterns */}
              {user.astroDetails.chartPatterns && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">
                    Chart Patterns
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.astroDetails.chartPatterns.stelliums && user.astroDetails.chartPatterns.stelliums.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Stelliums:</span>
                        <p className="text-sm text-white">
                          {user.astroDetails.chartPatterns.stelliums.join(', ')}
                        </p>
                      </div>
                    )}
                    {user.astroDetails.chartPatterns.elementEmphasis && (
                      <div>
                        <span className="text-sm text-gray-500">Element Emphasis:</span>
                        <p className="text-sm text-white">
                          {Object.entries(user.astroDetails.chartPatterns.elementEmphasis)
                            .map(([element, count]) => `${element}: ${count}`)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                    {user.astroDetails.chartPatterns.qualityEmphasis && (
                      <div>
                        <span className="text-sm text-gray-500">Quality Emphasis:</span>
                        <p className="text-sm text-white">
                          {Object.entries(user.astroDetails.chartPatterns.qualityEmphasis)
                            .map(([quality, count]) => `${quality}: ${count}`)
                            .join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interpretations */}
              {user.astroDetails.interpretations && (
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-3">
                    Interpretations
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Sun Sign:</span>
                      <p className="text-sm text-white">{user.astroDetails.interpretations.sunSign}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Moon Sign:</span>
                      <p className="text-sm text-white">{user.astroDetails.interpretations.moonSign}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Rising Sign:</span>
                      <p className="text-sm text-white">{user.astroDetails.interpretations.risingSign}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Dominant Elements:</span>
                      <p className="text-sm text-white">{user.astroDetails.interpretations.dominantElements.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Dominant Qualities:</span>
                      <p className="text-sm text-white">{user.astroDetails.interpretations.dominantQualities.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculation Timestamp */}
              {user.astroDetails.calculatedAt && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <span className="text-xs text-gray-500">
                    Calculated: {new Date(user.astroDetails.calculatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Raw Data */}
          <div className="bg-[#1A1B1E] border border-gray-700 p-6 rounded-xl">
            <details className="group">
              <summary className="font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors">
                Raw Data (Click to expand)
              </summary>
              <div className="mt-3 bg-[#0E1014] border border-gray-600 p-4 rounded-lg">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify({ user }, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      </Modal>

      {/* Section 1: Horizontal Summary Boxes */}
      <div className="flex gap-6 mb-8  md:flex-row flex-col   justify-center mt-6 h-fit">
        {/* Astro Summary Box */}
        <motion.div
          className="h-[300px] w-full overflow-y-auto"
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
            <p className="text-xs  leading-relaxed">{astroSummary}</p>
          </div>
        </motion.div>

        {/* Destiny Cards Summary Box */}
        <motion.div
          className="h-[300px] w-full overflow-y-auto"
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
            <p className="text-xs  leading-relaxed">
              {destinySummary}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Section 2: Previous Chat Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="rounded-lg shadow-lg p-6 mb-8"
      >
        <ChatSessionsTab
          showTitle={true}
          className="h-full"
        />
      </motion.div>
    </div>
    </>
    
  );
}
