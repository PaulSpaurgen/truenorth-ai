import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema(
  {
    userId: { type: String, required: true }, // Firebase UID
    chatType: { 
      type: String, 
      required: true, 
      enum: ['astro', 'destiny', 'cosmic'] 
    },
    sessionId: { type: String, required: true }, // Unique session identifier
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    feedback: [
      {
        userId: String,
        type: { type: String, enum: ['like', 'dislike', 'correction'] },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient querying
MessageSchema.index({ userId: 1, chatType: 1, sessionId: 1 });
MessageSchema.index({ userId: 1, chatType: 1, createdAt: -1 });

export default models.Message || model('Message', MessageSchema); 