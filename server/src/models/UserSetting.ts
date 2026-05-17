import mongoose from 'mongoose';

export interface IUserSetting {
  theme: 'light' | 'dark';
  accentColor: string;
  syncWithSystem: boolean;
  terminalLayout: 'sidebar' | 'bottom';
  editorHighContrast: boolean;
  editorTheme: string;
  editorFontSize: number;
  editorFontLigatures: boolean;
  updatedAt: Date;
}

const userSettingSchema = new mongoose.Schema<IUserSetting>({
  theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  accentColor: { type: String, default: '#6366f1' },
  syncWithSystem: { type: Boolean, default: false },
  terminalLayout: { type: String, enum: ['sidebar', 'bottom'], default: 'bottom' },
  editorHighContrast: { type: Boolean, default: false },
  editorTheme: { type: String, default: 'custom-dark' },
  editorFontSize: { type: Number, default: 14 },
  editorFontLigatures: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IUserSetting>('UserSetting', userSettingSchema);
