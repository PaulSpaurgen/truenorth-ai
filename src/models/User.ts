import { Schema, models, model } from 'mongoose';

const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String },
    name: String,
    photoURL: String,
    astroDetailsAsString: String,
    destinyCardDetailsAsString: String,
    astroSummary: String,
    destinySummary: String,
    profileSummary: String,
    astroDetails: {
      type: Schema.Types.Mixed,
      default: {}
    },
    destinyCard: {
      type: Schema.Types.Mixed,
      default: {}
    },
    birthData: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema); 