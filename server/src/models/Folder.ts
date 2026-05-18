import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  parentFolder: mongoose.Types.ObjectId | null;
  addedDate: Date;
}

const FolderSchema = new Schema<IFolder>({
  name: { type: String, required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  addedDate: { type: Date, default: Date.now },
});

export default mongoose.model<IFolder>("Folder", FolderSchema);
