'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/components/AuthProvider';

interface FeedbackSummary {
  totalMessages: number;
  totalFeedback: number;
  satisfactionRate: string;
  feedbackTypes: {
    like: number;
    dislike: number;
    correction: number;
  };
}

interface FeedbackOverTime {
  date: string;
  like: number;
  dislike: number;
  correction: number;
}

interface RecentFeedback {
  id: string;
  userMessage: string;
  aiResponse: string;
  feedback: Array<{
    type: 'like' | 'dislike' | 'correction';
    comment?: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface AnalyticsData {
  summary: FeedbackSummary;
  feedbackOverTime: FeedbackOverTime[];
  recentFeedback: RecentFeedback[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'No data available'}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'dislike': return '👎';
      case 'correction': return '✏️';
      default: return '❓';
    }
  };

  const getFeedbackColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-green-600 bg-green-50';
      case 'dislike': return 'text-red-600 bg-red-50';
      case 'correction': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor AI performance and user feedback</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalFeedback}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">😊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-green-600">{data.summary.satisfactionRate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Feedback Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalMessages > 0 
                    ? ((data.summary.totalFeedback / data.summary.totalMessages) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Types Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Feedback Distribution</h3>
            <div className="space-y-4">
              {Object.entries(data.summary.feedbackTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getFeedbackIcon(type)}</span>
                    <span className="capitalize font-medium">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${
                          type === 'like' ? 'bg-green-500' : 
                          type === 'dislike' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{
                          width: `${data.summary.totalFeedback > 0 
                            ? (count / data.summary.totalFeedback) * 100 
                            : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Feedback Trend</h3>
            <div className="space-y-2">
              {data.feedbackOverTime.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <span className="text-green-600">👍{day.like}</span>
                    <span className="text-red-600">👎{day.dislike}</span>
                    <span className="text-yellow-600">✏️{day.correction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Feedback</h3>
          </div>
          <div className="divide-y">
            {data.recentFeedback.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">User Message:</p>
                    <p className="text-gray-900 mb-3">{item.userMessage}</p>
                    <p className="text-sm text-gray-600 mb-1">AI Response:</p>
                    <p className="text-gray-700 mb-3">{item.aiResponse}</p>
                  </div>
                  <div className="ml-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.feedback.map((fb, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFeedbackColor(fb.type)}`}
                    >
                      {getFeedbackIcon(fb.type)} {fb.type}
                      {fb.comment && <span className="ml-1">: {fb.comment}</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 