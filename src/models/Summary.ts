import mongoose, { Schema, Document } from 'mongoose';



export interface SummaryDoc extends Document {
  uid: string;
  summaries: {
    astroSummary: string;
    destinySummary: string;
    cumulativeSummary: string;
  };
  lastUpdatedAt: Date;

}

const SummarySchema = new Schema<SummaryDoc>(
  {
    uid: { type: String, required: true, index: true },
    summaries: {
      astroSummary: { type: String, required: false },
      destinySummary: { type: String, required: false },
      cumulativeSummary: { type: String, required: false },
    },
    lastUpdatedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Summary || mongoose.model<SummaryDoc>('Summary', SummarySchema); 