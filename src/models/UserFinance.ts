import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserFinance extends Document {
  age: number;
  income: number;
  expenses: number;
  savings: number;
  investments: string;
  loans: number;
  goals: string;
  score: number;
  ai_summary: string;
  insights: string[];
  monthly_plan: string[];
  createdAt: Date;
}

const UserFinanceSchema: Schema = new Schema({
  age: { type: Number, required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  savings: { type: Number, required: true },
  investments: { type: String, required: true, default: '' },
  loans: { type: Number, required: true },
  goals: { type: String, required: true, default: '' },
  
  score: { type: Number, required: true },
  ai_summary: { type: String, required: true },
  insights: [{ type: String }],
  monthly_plan: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const UserFinance: Model<IUserFinance> = mongoose.models.UserFinance || mongoose.model<IUserFinance>('UserFinance', UserFinanceSchema);
