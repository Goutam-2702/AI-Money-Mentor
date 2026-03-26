import mongoose, { Document, Model, Schema } from 'mongoose';

// ── Financial Goal ────────────────────────────────────────────────────────────
export interface IGoal {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: Date;
  currentSaved: number;
  monthlyContribution: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ── Financial Profile ─────────────────────────────────────────────────────────
export interface IFinancialProfile extends Document {
  userId: string;

  // Personal
  age: number;
  city?: string;
  employmentType?: 'salaried' | 'self_employed' | 'freelance';
  familySize?: number;

  // Income & Expenses
  monthlyIncome: number;
  monthlyExpenses: number;
  annualCTC?: number;
  totalEMI?: number;

  // Savings & Investments
  liquidSavings: number;
  totalLoans: number;
  epfBalance?: number;
  mutualFundValue?: number;
  stocksValue?: number;

  // Insurance
  hasTermInsurance: boolean;
  termCoverAmount?: number;
  hasHealthInsurance: boolean;
  healthCoverAmount?: number;

  // Tax
  currentTaxRegime?: 'old' | 'new';
  section80CUsed?: number;

  // Investments text
  investmentsDescription?: string;

  // Goals
  goals: IGoal[];

  // Risk
  riskAppetite: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon?: number;

  // Portfolio fund IDs (AMFI scheme codes)
  fundIds?: string[];

  // Metadata
  lastAnalyzedAt?: Date;
  analysisCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    targetDate: { type: Date, required: true },
    currentSaved: { type: Number, default: 0 },
    monthlyContribution: { type: Number, default: 0 },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
  },
  { _id: false }
);

const FinancialProfileSchema = new Schema<IFinancialProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },

    age: { type: Number, required: true, min: 18, max: 100 },
    city: String,
    employmentType: { type: String, enum: ['salaried', 'self_employed', 'freelance'] },
    familySize: { type: Number, min: 1, max: 30 },

    monthlyIncome: { type: Number, required: true, min: 0 },
    monthlyExpenses: { type: Number, required: true, min: 0 },
    annualCTC: Number,
    totalEMI: { type: Number, default: 0 },

    liquidSavings: { type: Number, required: true, min: 0 },
    totalLoans: { type: Number, default: 0 },
    epfBalance: Number,
    mutualFundValue: Number,
    stocksValue: Number,

    hasTermInsurance: { type: Boolean, default: false },
    termCoverAmount: Number,
    hasHealthInsurance: { type: Boolean, default: false },
    healthCoverAmount: Number,

    currentTaxRegime: { type: String, enum: ['old', 'new'] },
    section80CUsed: Number,

    investmentsDescription: { type: String, maxlength: 500 },

    goals: { type: [GoalSchema], default: [] },

    riskAppetite: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate',
    },
    investmentHorizon: Number,

    fundIds: [{ type: String }],

    lastAnalyzedAt: Date,
    analysisCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'financial_profiles',
  }
);

// Prevent duplicate model registration in Next.js hot-reload
export const FinancialProfile: Model<IFinancialProfile> =
  mongoose.models.FinancialProfile ??
  mongoose.model<IFinancialProfile>('FinancialProfile', FinancialProfileSchema);
