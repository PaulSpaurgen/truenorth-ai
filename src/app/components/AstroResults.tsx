'use client';

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

interface ApiResponse {
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

interface AstroResultsProps {
  data: ApiResponse;
  onBack: () => void;
}

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const getZodiacSign = (signNumber: number): string => {
  return zodiacSigns[signNumber - 1] || 'Unknown';
};

const formatDegree = (degree: number): string => {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  const sec = Math.floor(((degree - deg) * 60 - min) * 60);
  return `${deg}°${min}'${sec}"`;
};

const getPlanetEmoji = (planetName: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇',
    'Ascendant': '↗'
  };
  return emojiMap[planetName] || '●';
};

const isPlanet = (data: unknown): data is Planet => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'fullDegree' in data &&
    'normDegree' in data &&
    'current_sign' in data &&
    'isRetro' in data
  );
};

export default function AstroResults({ data, onBack }: AstroResultsProps) {
  // Extract planets from the first element of output array
  const planetsData = data.output[0];
  const planets: Planet[] = [];
  
  // Convert the numbered keys to an array of planets
  Object.keys(planetsData).forEach(key => {
    const planetData = planetsData[key];
    if (isPlanet(planetData) && key !== 'debug' && key !== '13') { // Skip debug and ayanamsa
      planets.push(planetData);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Planetary Positions</h2>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          ← Back to Form
        </button>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <p><strong>Date of Birth:</strong> {data.input.date}/{data.input.month}/{data.input.year}</p>
          <p><strong>Time of Birth:</strong> {data.input.hours}:{data.input.minutes.toString().padStart(2, '0')}</p>
          <p><strong>Location:</strong> {data.input.latitude}°, {data.input.longitude}°</p>
          <p><strong>Ayanamsha:</strong> {data.input.settings.ayanamsha}</p>
          <p><strong>Observation Point:</strong> {data.input.settings.observation_point}</p>
        </div>
      </div>

      <div className="space-y-3">
        {planets.map((planet, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all ${
              planet.name === 'Ascendant' 
                ? 'bg-purple-50 border-purple-200' 
                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPlanetEmoji(planet.name)}</span>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {planet.name}
                    {planet.isRetro === 'true' && (
                      <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                        ℞ Retrograde
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getZodiacSign(planet.current_sign)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-mono text-gray-800">
                  {formatDegree(planet.normDegree)}
                </div>
                <div className="text-sm text-gray-500">
                  {planet.fullDegree.toFixed(5)}°
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Legend:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• ℞ = Retrograde motion</div>
          <div>• Degrees shown in DMS format</div>
          <div>• Full degree = Exact calculation</div>
          <div>• Norm degree = Position in sign</div>
        </div>
      </div>
    </div>
  );
} 