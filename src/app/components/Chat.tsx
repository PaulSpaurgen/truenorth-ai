'use client';

import { useState, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input;
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), content: userMessage, isUser: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { id: data.id, content: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        content: 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, type: 'like' | 'dislike' | 'correction') => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: messageId, type }),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Don't render anything until after hydration
  if (!isMounted) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-[500px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.isUser ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
            {!message.isUser && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleFeedback(message.id, 'like')}
                  className="text-green-500 hover:text-green-700"
                >
                  👍
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'dislike')}
                  className="text-red-500 hover:text-red-700"
                >
                  👎
                </button>
                <button
                  onClick={() => handleFeedback(message.id, 'correction')}
                  className="text-yellow-500 hover:text-yellow-700"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask TrueNorth..."
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 