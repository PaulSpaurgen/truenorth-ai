'use client';

import { useAuth } from '@/lib/components/AuthProvider';
import { useProfileQuery, type ProfileData } from '@/lib/hooks/useProfileQuery';

export default function ProfilePage() {
  const { user } = useAuth();
  const { 
    data: profileData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    dataUpdatedAt 
  } = useProfileQuery();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBirthInfo = (input: ProfileData['natalChart']['input']) => {
    return `${input.date}/${input.month}/${input.year} at ${input.hours}:${input.minutes.toString().padStart(2, '0')}`;
  };

  const parseSynthesis = (synthesis: string) => {
    // Split by double newlines or numbered paragraphs
    const paragraphs = synthesis.split(/\n\s*\n|\d+\.\s*\*\*/).filter(p => p.trim().length > 0);
    
    // If we don't have 5 paragraphs, split by sentences and group
    if (paragraphs.length < 5) {
      const sentences = synthesis.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      const sentencesPerParagraph = Math.ceil(sentences.length / 5);
      const newParagraphs = [];
      
      for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        newParagraphs.push(sentences.slice(i, i + sentencesPerParagraph).join(' '));
      }
      
      return newParagraphs.slice(0, 5);
    }
    
    return paragraphs.slice(0, 5);
  };

  const getSectionTitle = (index: number) => {
    const titles = [
      'Core Identity & Life Purpose',
      'Emotional & Relationship Patterns',
      'Career & Life Direction',
      'Current Life Phase & Transits',
      'Practical Guidance & Next Steps'
    ];
    return titles[index] || `Section ${index + 1}`;
  };

  const getSectionIcon = (index: number) => {
    const icons = ['🌟', '💖', '🎯', '🌙', '✨'];
    return icons[index] || '📖';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your cosmic profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Authentication Required</h2>
            <p className="text-yellow-600 mb-4">Please log in to view your cosmic profile.</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Generate Profile</h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <p className="text-gray-600">No profile data available</p>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = parseSynthesis(profileData.synthesis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌟 Your Cosmic Profile
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Astrology & Human Design Synthesis
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <span>📅 Born: {formatBirthInfo(profileData.natalChart.input)}</span>
            <span>•</span>
            <span>🔄 Updated: {formatDate(profileData.generatedAt)}</span>
            {dataUpdatedAt && (
              <>
                <span>•</span>
                <span>📱 Cached: {formatDate(new Date(dataUpdatedAt).toISOString())}</span>
              </>
            )}
          </div>
        </div>

        {/* Birth Chart Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ⭐ Birth Chart Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>Date:</strong> {formatBirthInfo(profileData.natalChart.input)}</p>
              <p><strong>Location:</strong> {profileData.natalChart.input.latitude}°, {profileData.natalChart.input.longitude}°</p>
              <p><strong>Timezone:</strong> UTC{profileData.natalChart.input.timezone >= 0 ? '+' : ''}{profileData.natalChart.input.timezone}</p>
            </div>
            <div className="space-y-2">
              <p><strong>Ayanamsha:</strong> {profileData.natalChart.input.settings.ayanamsha}</p>
              <p><strong>Observation:</strong> {profileData.natalChart.input.settings.observation_point}</p>
              <p><strong>Current Date:</strong> {formatDate(profileData.generatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Synthesis Sections */}
        <div className="space-y-6">
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">{getSectionIcon(index)}</span>
                {getSectionTitle(index)}
              </h3>
              <div className="text-gray-700 leading-relaxed">
                {paragraph.split('**').map((part, i) => 
                  i % 2 === 1 ? (
                    <strong key={i} className="text-purple-700">{part}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Refresh Section */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🔄 Stay Updated</h3>
          <p className="text-gray-600 mb-4">
            Your profile updates daily with current transits. Next update: {formatDate(profileData.nextUpdate)}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Refreshing...' : 'Refresh Profile'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Data is cached daily - refresh only if you need the latest transits
          </p>
        </div>
      </div>
    </div>
  );
} 