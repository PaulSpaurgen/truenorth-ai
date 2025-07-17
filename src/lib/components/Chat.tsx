"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useTabSummary } from "@/lib/hooks/useTabSummary";
import { useRef } from "react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

type ChatTab = 'cosmic' | 'astrology' | 'destiny';

interface ChatProps {
  activeTab: ChatTab;
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

const CosmicLoading = () => (
  <div className="flex justify-start">
    <motion.div
      className="bg-gray-800 rounded-2xl p-4 max-w-[80%] text-white"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <motion.div
            className="w-3 h-3 bg-[#F1C4A4] rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-3 h-3 bg-[#1B5C65] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
        <div className="flex space-x-1">
          <motion.div
            className="w-2 h-2 bg-[#F1C4A4] rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-2 h-2 bg-[#1B5C65] rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-[#00A79D] rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>
        <span className="text-sm text-gray-300">Cosmic connection...</span>
      </div>
    </motion.div>
  </div>
);

// MODULE cache no longer needed – handled by React Query

export default function Chat({ activeTab }: ChatProps) {
  const [user, setUser] = useState<User | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<ChatTab, Message[]>>({
    cosmic: [],
    astrology: [],
    destiny: [],
  });

  const messages = messagesMap[activeTab];
  const hasChatStarted = messages.length > 0;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { data: summary, isLoading: summaryLoading } = useTabSummary(activeTab);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = user?.displayName || user?.email || "Cosmic Voyager";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // no reset; history preserved automatically

  useEffect(() => {
    if (hasChatStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, hasChatStarted]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!hasChatStarted) {
      // setHasChatStarted(true); // This line is removed as per the new_code
    }

    setLoading(true);
    const userMessageContent = input;
    setInput("");

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      isUser: true,
      timestamp: new Date(),
    };

    let updatedMessages: Message[];

    if (hasChatStarted) {
      updatedMessages = [...messages, newUserMessage];
    } else {
      // First user message in this tab – prepend summary as assistant message if available
      const summaryAssistant: Message | null = summary
        ? {
            id: Date.now().toString() + "-summary",
            content: summary,
            isUser: false,
            timestamp: new Date(),
          }
        : null;

      updatedMessages = summaryAssistant
        ? [...messages, summaryAssistant, newUserMessage]
        : [...messages, newUserMessage];
    }
    setMessagesMap((prev) => ({ ...prev, [activeTab]: updatedMessages }));

    setTimeout(() => setIsTyping(true), 100);

    try {
      const tabMap = {
        cosmic: 'cosmic',
        astrology: 'astro',
        destiny: 'destiny',
      } as const;

      const endpoint = `/api/${tabMap[activeTab]}/chat`;

      // Build chat history from last messages (summary already included if first message)
      const chatHistory = updatedMessages.slice(-7).map((m) => ({
        role: m.isUser ? 'user' : ('assistant' as const),
        content: m.content,
      }));

      const body = { messages: chatHistory };

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      const aiResponseMessage: Message = {
        id: Date.now().toString() + "-ai",
        content: data.response || "I'm here to help!",
        isUser: false,
        timestamp: new Date(),
      };

      setMessagesMap((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], aiResponseMessage] }));
    } catch (error) {
      console.error("Error:", error);
      const errorResponseMessage: Message = {
        id: Date.now().toString() + "-error",
        content:
          "I apologize, but I seem to have lost my cosmic connection. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessagesMap((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], errorResponseMessage] }));
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'cosmic':
        return 'Cosmic';
      case 'astrology':
        return 'Astrology';
      case 'destiny':
        return 'Destiny Cards';
      default:
        return 'Cosmic';
    }
  };

  return (
    <>
      <div className={`max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-400px)]  max-w-4xl mx-auto chat-scrollbar ${hasChatStarted ? "overflow-y-auto " : "overflow-y-auto"}`}>
        {!hasChatStarted ? (
          <div
            className="h-full w-full"
            style={{
              fontFamily: "var(--font-cormorant-garamond), sans-serif",
            }}
          >
            <motion.div
              className="flex flex-col items-center justify-center h-full px-4 sm:px-8"
              initial={{ opacity: 0, y: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="font-serif text-[#F1C4A4] text-center text-4xl md:text-6xl mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {`Hi, ${userName}`}
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-300 text-center text-lg md:text-xl mb-4"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {activeTab === 'cosmic' ? 'Discover your Cosmic Blueprint!' : `${getTabTitle()} Insights`}
              </motion.p>
              {summaryLoading ? (
                <motion.div
                  className="mt-6 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <CosmicLoading />
                </motion.div>
              ) : (
                summary && (
                <motion.div
                  className="mt-6 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="bg-[#0E1014] border border-gray-700 font-light text-xs md:text-sm  rounded-2xl p-6 text-white" style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                  }}>
                    <p className="text-sm leading-relaxed">{summary}</p>
                  </div>
                </motion.div>)
              )}
            </motion.div>
          </div>
        ) : (
          <div className="p-4 space-y-6 pr-10">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      message.isUser ? "items-end" : "items-start"
                    } max-w-[85%]`}
                  >
                    <motion.div
                      className={`px-4 py-3 rounded-2xl ${
                        message.isUser
                          ? "bg-[#1B5C65] text-white rounded-br-md"
                          : "bg-[#0E1014] text-white rounded-bl-md border border-gray-700"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </motion.div>
                    <motion.p
                      className={`text-xs mt-2 ${
                        message.isUser
                          ? "text-right text-gray-300/70"
                          : "text-left text-gray-400"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {formatTime(message.timestamp)}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>{isTyping && <CosmicLoading />}</AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0 fixed bottom-0 left-0 right-0">
        <motion.form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-center gap-3 p-3 rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${getTabTitle().toLowerCase()}...`}
            className="flex-1 p-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#00A79D] w-12 h-12 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-50 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <SendIcon />
            )}
          </motion.button>
        </motion.form>
      </div>
    </>
  );
}
