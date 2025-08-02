import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatData {
  _id: string;
  userId: string;
  chatType: 'astro' | 'destiny' | 'cosmic';
  sessionId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatSessionsTabProps {
  className?: string;
  showTitle?: boolean;
}

type Tab = 'cosmic' | 'astrology' | 'destiny';

export default function ChatSessionsTab({ 
  className = "",
  showTitle = false
}: ChatSessionsTabProps) {
  const [user, setUser] = useState<User | null>(null);
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('cosmic');

  // Map activeTab to chatType for API
  const getChatType = (tab: string) => {
    switch (tab) {
      case 'astrology': return 'astro';
      case 'destiny': return 'destiny';
      case 'cosmic': return 'cosmic';
      default: return 'astro';
    }
  };

  // Load chat data
  const loadChatData = async (uid: string) => {
    if (!uid) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/previousChats');
      if (response.ok) {
        const allChats = await response.json();
        // Filter by chat type
        const filteredChats = allChats.filter((chat: ChatData) => 
          chat.chatType === getChatType(activeTab)
        );
        setChatData(filteredChats);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadChatData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Reload data when activeTab changes
  useEffect(() => {
    if (user) {
      loadChatData(user.uid);
    }
  }, [activeTab, user]);

  if (!user) {
    return null;
  }

  const title = showTitle ? (
    <h3 className="text-lg font-semibold text-[#F1C4A4] mb-4">Previous Chat Sessions</h3>
  ) : null;

  return (
    <div className={`bg-[#0E1014] border border-gray-700 rounded-lg p-4 ${className}`}>
      {title}
      
      {/* Tab System */}
      <div className="flex justify-center w-full mb-4">
        <div className="flex w-full border font-light text-xs sm:text-sm bg-gray-900/50">
          <button
            onClick={() => setActiveTab('cosmic')}
            className={`px-2 sm:px-4 flex-1 py-1 sm:py-1.5 border transition-colors cursor-pointer relative w-full
              ${activeTab === 'cosmic' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-20 text-white border-gray-900'}`}
          >
            Cosmic
          </button>

          <button
            onClick={() => setActiveTab('astrology')}
            className={`px-4 flex-1 py-1.5 border transition-colors cursor-pointer relative w-full
              ${activeTab === 'astrology' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-10 text-white border-gray-900'}`}
          >
            Astrology
          </button>

          <button
            onClick={() => setActiveTab('destiny')}
            className={`px-4 flex-1 py-1.5 border transition-colors cursor-pointer relative w-full
              ${activeTab === 'destiny' ? 'z-30 text-[#F1C4A4] border-[#1B5C65]' : 'z-0 text-white border-gray-900'}`}
          >
            Destiny Cards
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F1C4A4]"></div>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {chatData.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-400 text-sm py-4"
              >
                No previous {activeTab} chats
              </motion.div>
            ) : (
              chatData.map((chat) => (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#1A1B1E] border border-gray-600 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm text-gray-400">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {chat.messages.length} messages
                    </div>
                  </div>
                  
                  {chat.messages.length > 0 && (
                    <div className="space-y-3">
                      {/* Show all messages */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {chat.messages.map((message, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex items-start gap-2">
                              <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                                message.role === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-600 text-gray-200'
                              }`}>
                                {message.role === 'user' ? 'Q' : 'A'}
                              </span>
                              <div className="text-gray-300 leading-relaxed">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}