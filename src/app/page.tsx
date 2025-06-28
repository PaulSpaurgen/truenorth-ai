"use client";

import AstroForm from "./components/AstroForm";
import AstroResults from "./components/AstroResults";
import Modal from "./components/Modal";
import { useState, useEffect } from "react";
import Chat from "./components/Chat";

interface AstroData {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  latitude: number;
  longitude: number;
  timezone: number;
  settings: {
    observation_point: "topocentric" | "geocentric";
    ayanamsha: "lahiri" | "raman" | "krishnamurti" | "sayan";
  };
}

interface Planet {
  name: string;
  fullDegree: number;
  normDegree: number;
  current_sign: number;
  isRetro: string;
}

interface PlanetData {
  [key: string]:
    | Planet
    | { name?: string; value?: number }
    | { observation_point?: string; ayanamsa?: string };
}

interface AstroResultData {
  statusCode: number;
  input: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
    latitude: number;
    longitude: number;
    timezone: number;
    settings: {
      observation_point: string;
      ayanamsha: string;
    };
  };
  output: PlanetData[];
}

export default function Home() {
  const [astroResult, setAstroResult] = useState<AstroResultData | null>(null);
  const [savedInput, setSavedInput] = useState<AstroData | null>(null);
  const [modal, setModal] = useState<null | "form" | "results">(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAstroSubmit = async (data: AstroData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/astrodetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setAstroResult(result.data);
        console.log("Astrology Data:", result.data);

        // Persist input for future sessions
        localStorage.setItem("astroInput", JSON.stringify(data));
        setSavedInput(data);
      } else {
        setError(result.message || "Failed to fetch astrology data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load saved input on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("astroInput");
      if (stored) {
        setSavedInput(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleBackToForm = () => {
    setAstroResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          TrueNorth - Vibrational Intelligence
        </h1>
        <div className="w-full">
            {!astroResult && (
              <AstroForm onSubmit={handleAstroSubmit} initialData={savedInput || undefined} />
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-blue-700">🔄 Fetching astrology data...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700">❌ Error: {error}</p>
                <button
                  onClick={handleBackToForm}
                  className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        {astroResult && (
            <div className="w-full">
              <div className="flex  gap-4">
                <button onClick={()=>setModal("form")} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"> View Form</button>
                <button onClick={()=>setModal("results")} className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"> View Results</button>
              </div>
             
              <Chat astroData={astroResult} />
            </div>
          )}

        {/* Modal */}
        <Modal
          open={modal!==null}
          onClose={()=>setModal(null)}
          title={modal === "form" ? "Enter Birth Details" : "Astro-Design Results"}
        >
          {modal === "form" && (
            <AstroForm
              onSubmit={(data)=>{
                handleAstroSubmit(data);
                setModal(null);
              }}
              initialData={savedInput || undefined}
            />
          )}
          {modal === "results" && (
            astroResult ? (
              <AstroResults data={astroResult} />
            ) : (
              <p className="text-center text-gray-700">Please generate your chart first.</p>
            )
          )}
        </Modal>
      </div>
    </main>
  );
}
