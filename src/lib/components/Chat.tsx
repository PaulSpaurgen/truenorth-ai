'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome message when component mounts
  useEffect(() => {
    const welcomeMessage = "🌟 Welcome! I'm TrueNorth, your spiritual guide. To provide personalized astrological insights, please first generate your birth chart using the form on the left. How may I assist you on your cosmic journey?";
    
    setMessages([{
      id: 'welcome',
      content: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setIsTyping(true);
    const userMessage = input;
    setInput('');

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory: messages.slice(-6) // Send last 6 messages for context
        }),
      });

      const data = await response.json();
      
      // Simulate typing delay for more natural conversation
      setTimeout(() => {
        setIsTyping(false);
        // Add AI response
        setMessages(prev => [...prev, {
          id: data.id,
          content: data.response,
          isUser: false,
          timestamp: new Date()
        }]);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      // Add error message
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        content: 'I apologize, but I seem to have lost my cosmic connection momentarily. Please try reaching out again.', 
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, type: 'like' | 'dislike' | 'correction') => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const idToken = currentUser ? await currentUser.getIdToken() : null;
      
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ chatId: messageId, type }),
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Blended Astro-HD starter questions
  const suggestedQuestions = [
    "What is my Human Design type and strategy?",
    "Which gates are activated by my Sun and Moon placements?",
    "How do my planetary positions interact with my design channels?",
    "What does my profile say about my life path?",
    "Which current transits are lighting up my gates right now?"
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
          🌙◈ TrueNorth Astro-Design Oracle
        </h2>
        <p className="text-sm opacity-90">Your Astrology ✧ Human Design Guide</p>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg flex-1 flex flex-col px-2 sm:px-4">
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800 border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                  {formatTime(message.timestamp)}
                </div>
                {!message.isUser && message.id !== 'welcome' && (
                  <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleFeedback(message.id, 'like')}
                      className="text-green-500 hover:text-green-700 p-1 rounded"
                      title="Helpful"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'dislike')}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="Not helpful"
                    >
                      👎
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'correction')}
                      className="text-yellow-500 hover:text-yellow-700 p-1 rounded"
                      title="Needs correction"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border rounded-2xl p-3 max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">TrueNorth is consulting the stars...</div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
      

        {/* Astrology-specific suggestions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-blue-50">
            <p className="text-sm text-purple-700 mb-2">🔮 Explore your chart:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask TrueNorth about your cosmic journey..."
              className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Channeling...
                </>
              ) : (
                <>
                  Send ✨
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 