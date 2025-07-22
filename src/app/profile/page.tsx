"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useTabSummary } from "@/lib/hooks/useTabSummary";
import Chat from "@/lib/components/Chat";
import { motion } from "framer-motion";
import Modal from "@/lib/components/Modal";
import { useState } from "react";
import Image from "next/image";
import { FaUserAlt } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";

export default function ProfilePage() {
  const [showModal, setShowModal] = useState(false);

  const [contextMessage, setContextMessage] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data: astroSummary,
    isLoading: isAstroLoading,
    // error: astroError,
    refetch: refetchAstro,
  } = useTabSummary("astrology", contextMessage);
  const {
    data: destinySummary,
    isLoading: isDestinyLoading,
    // error: destinyError,
    refetch: refetchDestiny,
  } = useTabSummary("destiny", contextMessage);



  const { user } = useUser();

  if (isAstroLoading || isDestinyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
            onClick={async () => {
              try {
                setIsRefetching(true);
                await Promise.all([refetchAstro(), refetchDestiny()]);
                setIsRefetching(false);
              } catch (error) {
                console.error('Refetch error:', error);
              }
            }}
            disabled={isAstroLoading || isDestinyLoading || contextMessage.length === 0}
          >
            <FiRefreshCcw className="text-[#F1C4A5]" />
            Refetch Summaries
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
                  <span className="text-sm text-gray-400">Name:</span>
                  <p className="font-medium text-white">
                    {user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Email:</span>
                  <p className="font-medium text-white">
                    {user?.email || "N/A"}
                  </p>
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
            Array.isArray(user.astroDetails) &&
            user.astroDetails.length > 1 ? (
              <div className="bg-[#1A1B1E] border border-gray-700 p-6 rounded-xl">
                <h4 className="font-semibold text-purple-400 mb-4 text-lg">
                  Astrological Data
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const zodiacSigns = [
                      "Aries",
                      "Taurus",
                      "Gemini",
                      "Cancer",
                      "Leo",
                      "Virgo",
                      "Libra",
                      "Scorpio",
                      "Sagittarius",
                      "Capricorn",
                      "Aquarius",
                      "Pisces",
                    ];
                    const planetsData = user.astroDetails[1] as Record<
                      string,
                      {
                        current_sign?: number;
                        normDegree?: number;
                        isRetro?: string;
                      }
                    >;

                    return Object.keys(planetsData)
                      .map((key) => {
                        const planetData = planetsData[key];
                        if (
                          planetData &&
                          planetData.current_sign !== undefined &&
                          planetData.normDegree !== undefined
                        ) {
                          const signName =
                            zodiacSigns[planetData.current_sign - 1] ||
                            "Unknown";
                          return (
                            <div
                              key={key}
                              className="bg-[#0E1014] border border-gray-600 p-3 rounded-lg"
                            >
                              <span className="text-sm font-medium text-gray-400">
                                {key}:
                              </span>
                              <p className="text-sm text-white">
                                {planetData.normDegree.toFixed(1)}° {signName}
                                {planetData.isRetro === "true"
                                  ? " (Retrograde)"
                                  : ""}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })
                      .filter(Boolean);
                  })()}
                </div>
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
        <div className="flex gap-6 mb-8  md:flex-row flex-col   justify-center mt-6">
          {/* Astro Summary Box */}
          <motion.div
            className="h-full "
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
              {isRefetching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <p className="text-xs md:text-sm leading-relaxed">{astroSummary}</p>
              )}
            </div>
          </motion.div>

          {/* Destiny Cards Summary Box */}
          <motion.div
            className="h-full "
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
              {isRefetching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <p className="text-xs md:text-sm leading-relaxed">{destinySummary}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Section 2: Chat Interface using existing Chat component */}
        <div className="rounded-lg shadow-lg p-6 mb-8">
          {/* Chat Component */}
          <div className="h-[500px] relative">
            <Chat
              activeTab="cosmic"
              showMetadata={false}
              isSummaryAssistant={false}
              defaultSummary={`These are the summaries of the user's astrology and destiny cards. ${astroSummary} ${destinySummary}`}
              setContextMessage={setContextMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
