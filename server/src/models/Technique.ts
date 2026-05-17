import mongoose, { Schema, Document } from "mongoose";

export interface ITechnique extends Document {
  name: string;
}

const TechniqueSchema = new Schema<ITechnique>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITechnique>("Technique", TechniqueSchema);
