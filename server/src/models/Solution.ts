import mongoose, { Schema, Document } from 'mongoose';

export interface ISolution extends Document {
  problemId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  language: string;
}

const SolutionSchema = new Schema<ISolution>({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true }
});

export default mongoose.model<ISolution>('Solution', SolutionSchema);
