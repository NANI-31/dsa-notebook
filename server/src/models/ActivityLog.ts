import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: 'create' | 'update' | 'delete' | 'solve';
  itemType: 'problem' | 'folder' | 'technique' | 'category';
  itemName: string;
  itemId?: string;
  timestamp: Date;
  details?: string;
}

const ActivityLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  itemType: { type: String, required: true },
  itemName: { type: String, required: true },
  itemId: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
