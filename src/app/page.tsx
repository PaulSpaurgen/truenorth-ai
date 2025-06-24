'use client';

import AstroForm from './components/AstroForm';
import AstroResults from './components/AstroResults';
import { useState } from 'react';
// import Chat from './components/Chat';

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
    observation_point: 'topocentric' | 'geocentric';
    ayanamsha: 'lahiri' | 'raman' | 'krishnamurti' | 'sayan';
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
  [key: string]: Planet | { name?: string; value?: number } | { observation_point?: string; ayanamsa?: string };
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAstroSubmit = async (data: AstroData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/astrodetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setAstroResult(result.data);
        console.log('Astrology Data:', result.data);
      } else {
        setError(result.message || 'Failed to fetch astrology data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex gap-8">
          <div className="w-1/2">
            {astroResult ? (
              <AstroResults data={astroResult} onBack={handleBackToForm} />
            ) : (
              <AstroForm onSubmit={handleAstroSubmit} />
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
          <div className="w-1/2">
            {/* <Chat /> */}
          </div>
        </div>
      </div>
    </main>
  );
}
