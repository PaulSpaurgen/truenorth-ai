import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema(
  {
    userId: { type: String, required: true }, // Firebase UID
    userMessage: String,
    aiResponse: String,
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

export default models.Message || model('Message', MessageSchema); 