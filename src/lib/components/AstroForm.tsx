'use client';

import { useState, useEffect } from 'react';
// import { useUser } from '@/lib/hooks/useUser';

export interface AstroData {
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

interface AstroFormProps {
  onSubmit: (data: AstroData) => void;
  initialData?: Partial<AstroData>;
  isLoading?: boolean;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export default function AstroForm({ onSubmit, initialData , isLoading = false }: AstroFormProps) {
  // const { user } = useUser(); // Removed unused variable

  const defaultData: AstroData = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    date: new Date().getDate(),
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: 0,
    latitude: 17.38333,
    longitude: 78.4666,
    timezone: 5.5,
    settings: {
      observation_point: 'topocentric',
      ayanamsha: 'lahiri',
    },
  };

  const [formData, setFormData] = useState<AstroData>({
    ...defaultData,
    ...initialData,
    settings: {
      ...defaultData.settings,
      ...(initialData?.settings || {}),
    },
  });

  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        settings: { ...prev.settings, ...(initialData.settings || {}) },
      }));
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.location-search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleInputChange = (field: keyof Omit<AstroData, 'settings'>, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTimezoneOffset = () => {
    const now = new Date();
    return -now.getTimezoneOffset() / 60;
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    setSearchTimeout(timeoutId);
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      timezone: getTimezoneOffset(),
    }));

    setLocationQuery(location.display_name);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className=" min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#0E1014] rounded-lg shadow-lg p-6 sm:p-8 w-full sm:max-w-[90%] md:max-w-2xl border border-gray-700 flex flex-col justify-center">
        <h2 className="text-3xl sm:text-4xl text-[#F1C4A4] mb-2 text-center">
          Birth Details
        </h2>
        <p className="text-lg sm:text-xl text-center text-white mb-6" >
          Please enter your birth details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1" >
                Year
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                placeholder="YYYY"
                className="w-full p-2 border border-gray-700 rounded-md placeholder-gray-400 text-white bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1" >
                Month
              </label>
              <select
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md text-white bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1" >
                Date
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date}
                onChange={(e) => handleInputChange('date', parseInt(e.target.value))}
                placeholder="DD"
                className="w-full p-2 border border-gray-700 rounded-md placeholder-gray-400 text-white bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="relative location-search-container">
            <label className="block text-sm font-medium text-white mb-1 mt-6" >
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationSearch}
                placeholder="Search for a place (City, State, Country)"
                className="w-full p-2 border border-gray-700 rounded-md text-white placeholder-gray-400 bg-[#1a1a1a] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                
                required
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">Example: New York, NY, USA</p>

            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((location) => (
                  <button
                    key={location.place_id}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm text-gray-800 truncate">{location.display_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className=" cursor-pointer w-full bg-[#3a6f7c] text-white py-3 px-4 rounded-md focus:ring-blue-500 focus:ring-offset-2  font-medium hover:bg-[#2a4f5c] transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Submit Birth Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
