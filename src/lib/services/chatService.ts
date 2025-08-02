import Message from '@/models/Messages';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  sessionId: string;
  chatType: 'astro' | 'destiny' | 'cosmic';
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatService {
  /**
   * Save a new chat session or update existing one
   */
  static async saveChatSession(
    userId: string,
    chatType: 'astro' | 'destiny' | 'cosmic',
    messages: ChatMessage[],
    sessionId?: string
  ): Promise<string> {
    const finalSessionId = sessionId || uuidv4();
    
    // Check if session exists
    const existingSession = await Message.findOne({
      userId,
      chatType,
      sessionId: finalSessionId
    });

    if (existingSession) {
      // Update existing session
      await Message.updateOne(
        { userId, chatType, sessionId: finalSessionId },
        { 
          $set: { 
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp || new Date()
            }))
          },
          updatedAt: new Date()
        }
      );
    } else {
      // Create new session
      await Message.create({
        userId,
        chatType,
        sessionId: finalSessionId,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date()
        }))
      });
    }

    return finalSessionId;
  }

  /**
   * Get all chat sessions for a user by type
   */
  static async getChatSessions(
    userId: string,
    chatType: 'astro' | 'destiny' | 'cosmic'
  ): Promise<ChatSession[]> {
    const sessions = await Message.find({ userId, chatType })
      .sort({ updatedAt: -1 })
      .lean();

    return sessions.map(session => ({
      sessionId: session.sessionId,
      chatType: session.chatType,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));
  }

  /**
   * Get a specific chat session
   */
  static async getChatSession(
    userId: string,
    chatType: 'astro' | 'destiny' | 'cosmic',
    sessionId: string
  ): Promise<ChatSession | null> {
    const session = await Message.findOne({ userId, chatType, sessionId }).lean() as {
      sessionId: string;
      chatType: 'astro' | 'destiny' | 'cosmic';
      messages: ChatMessage[];
      createdAt: Date;
      updatedAt: Date;
    } | null;
    
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      chatType: session.chatType,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }

  /**
   * Delete a chat session
   */
  static async deleteChatSession(
    userId: string,
    chatType: 'astro' | 'destiny' | 'cosmic',
    sessionId: string
  ): Promise<boolean> {
    const result = await Message.deleteOne({ userId, chatType, sessionId });
    return result.deletedCount > 0;
  }

  /**
   * Get recent chat sessions (last 10) for a user
   */
  static async getRecentChatSessions(userId: string): Promise<ChatSession[]> {
    const sessions = await Message.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    return sessions.map(session => ({
      sessionId: session.sessionId,
      chatType: session.chatType,
      messages: session.messages,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));
  }
} 