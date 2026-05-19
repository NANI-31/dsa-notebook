import mongoose, { Schema, Document } from 'mongoose';

export interface ITelemetryLog extends Document {
  metric: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: Date;
}

const TelemetryLogSchema: Schema = new Schema({
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  rating: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ITelemetryLog>('TelemetryLog', TelemetryLogSchema);
