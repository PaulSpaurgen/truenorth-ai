import mongoose, { Schema, Document } from 'mongoose';

export type SummaryType = 'astro' | 'human-design' | 'cumulative';

export interface SummaryDoc extends Document {
  uid: string;
  date: string; // YYYY-MM-DD
  type: SummaryType;
  summary: string;
  feedback: string[];
  createdAt: Date;
}

const SummarySchema = new Schema<SummaryDoc>(
  {
    uid: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    type: { type: String, enum: ['astro', 'human-design', 'cumulative'], required: true },
    summary: { type: String, required: true },
    feedback: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now, index: { expires: 60 * 60 * 24 } } // 24h TTL
  },
  { timestamps: true }
);

export default mongoose.models.Summary || mongoose.model<SummaryDoc>('Summary', SummarySchema); 