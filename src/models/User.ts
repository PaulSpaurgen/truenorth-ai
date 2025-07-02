import { Schema, models, model } from 'mongoose';

const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String },
    name: String,
    photoURL: String,
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema); 