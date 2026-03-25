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
  problems: string[];
  actions: string[];
  recommendedInvestments: string[];
  warnings: string[];
  plan: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
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
  problems: [{ type: String }],
  actions: [{ type: String }],
  recommendedInvestments: [{ type: String }],
  warnings: [{ type: String }],
  plan: {
    month1: [{ type: String }],
    month2: [{ type: String }],
    month3: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

export const UserFinance: Model<IUserFinance> = mongoose.models.UserFinance || mongoose.model<IUserFinance>('UserFinance', UserFinanceSchema);
