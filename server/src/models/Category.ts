import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  subCategories: string[];
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  subCategories: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
