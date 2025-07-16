'use client';

import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

type Tab = 'cosmic' | 'astrology' | 'human-design';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-white"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cosmic');
  const [user, setUser] = useState<User | null>(null);
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = user?.displayName || user?.email || 'Cosmic Voyager';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasChatStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, hasChatStarted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!hasChatStarted) {
      setHasChatStarted(true);
    }

    setLoading(true);
    const userMessageContent = input;
    setInput('');

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      isUser: true,
      timestamp: new Date(),
    };
    
    // const aiWelcomeMessage: Message = {
    //     id: 'welcome',
    //     content: `🌟 Welcome! I'm TrueNorth. I have attuned to your cosmic blueprint. How may I assist you on your journey, ${userName}?`,
    //     isUser: false,
    //     timestamp: new Date(),
    // };

    const updatedMessages = hasChatStarted ? [...messages, newUserMessage] :  newUserMessage ? [...messages, newUserMessage] : [];
    setMessages(updatedMessages);

    setTimeout(() => setIsTyping(true), 100);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          conversationHistory: updatedMessages.slice(-6),
        }),
      });

      const data = await response.json();

      const aiResponseMessage: Message = {
        id: data.id || Date.now().toString() + '-ai',
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorResponseMessage: Message = {
        id: Date.now().toString() + '-error',
        content: 'I apologize, but I seem to have lost my cosmic connection. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen w-screen  text-white  bg-transparent px-50" >
      
<div className="w-[100%] h-[100%] bg-black/50 rounded-2xl shadow-2xl ">

        <header className="w-80 pt-6 pb-4 fixed top-15 left-130 right-0 z-10">
          <div className="flex items-center gap-2 p-1  border border-gray-700 bg-gray-900/50">
            <button
              onClick={() => setActiveTab('cosmic')}
              className={`px-4 py-1.5  text-sm transition-colors ${activeTab === 'cosmic' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50 '} `}
              style={{ fontFamily: 'serif' }}
            >
              Cosmic
            </button>
            <button
              onClick={() => setActiveTab('astrology')}
              className={`px-4 py-1.5  text-sm transition-colors ${activeTab === 'astrology' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50'}`}
            >
              Astrology
            </button>
            <button
              onClick={() => setActiveTab('human-design')}
              className={`px-4 py-1.5  text-sm transition-colors ${activeTab === 'human-design' ? ' text-[#F1C4A4]' : 'text-white hover:bg-gray-800/50'}`}
            >
              Human Design
            </button>
          </div>
        </header>

        <div className=''>
          <main className="flex-1 overflow-hidden relative pt-50 pb-16 px-4 sm:px-6 lg:px-8"
        style={{ fontFamily: 'montserrat,serif, Georgia' }}>
          {!hasChatStarted ? (
            <div className="h-full flex flex-col justify-center items-center text-center animate-fadeIn">
              <h1 className="text-5xl font-serif text-[#F1C4A4]"
              style={{ fontFamily: 'montserrat,serif, Georgia' }}>{`Hi, ${userName}`}</h1>
              <p className="mt-2 text-lg text-gray-300">Discover your Cosmic Blueprint!</p>
            </div>
          ) : (
            <div className="p-4 space-y-4 animate-fadeInUp ">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${message.isUser ? 'bg-[#00A79D] text-white' : 'bg-gray-800 text-white'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1.5 ${message.isUser ? 'text-right text-gray-200/70' : 'text-left text-gray-400'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl p-3 max-w-[80%] text-white">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>
        </div>

        <footer className="w-full px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0 fixed bottom-0 left-0 right-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3 p-2 rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question...."
              className="flex-1 p-2 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#00A79D] w-10 h-10 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50 flex-shrink-0"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SendIcon />}
            </button>
          </form>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-in-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}