'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';

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
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export default function AstroForm({ onSubmit, initialData }: AstroFormProps) {
  const { user } = useUser();
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
      ayanamsha: 'lahiri'
    }
  };

  const [formData, setFormData] = useState<AstroData>({
    ...defaultData,
    ...initialData,
    settings: {
      ...defaultData.settings,
      ...(initialData?.settings || {})
    }
  });

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update when initialData changes (e.g., when modal opens)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        settings: { ...prev.settings, ...(initialData.settings || {}) }
      }));
    }
  }, [initialData]);

  // Close suggestions when clicking outside
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

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleInputChange = (field: keyof Omit<AstroData, 'settings'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get current timezone offset in hours
  const getTimezoneOffset = () => {
    const now = new Date();
    return -now.getTimezoneOffset() / 60; // Convert minutes to hours and flip sign
  };

  // Search for locations using Nominatim API
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

  // Handle location search input
  const handleLocationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);
    
    setSearchTimeout(timeoutId);
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationSuggestion) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    setFormData(prev => ({
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
    <div className="bg-white rounded-lg shadow-lg p-6 mt-40 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Hello {user?.name}</h2>
      <p className="text-sm text-gray-600 mb-6">Please enter your birth details to get started</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Date and Time Section */}
        <div className="grid grid-cols-1 gap-4">
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Year</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Month</label>
              <select
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.date}
                onChange={(e) => handleInputChange('date', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Location Search */}
          <div className="relative location-search-container">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Search for a place (City, State, Country)
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationSearch}
                placeholder="e.g., New York City, New York, United States"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            
            {/* Location Suggestions Dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((location) => (
                  <button
                    key={location.place_id}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm text-gray-800 truncate">
                      {location.display_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Submit Birth Details
        </button>
      </form>
    </div>
  );
} 