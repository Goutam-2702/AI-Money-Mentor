/**
 * Centralized Zod schemas — single source of truth for all request validation.
 */
import { z } from 'zod';

// ── Financial Profile Input (from form / PDF extraction) ──────────────────────
export const FinancialProfileInput = z
  .object({
    age: z
      .number()
      .int('Age must be a whole number')
      .min(18, 'You must be at least 18')
      .max(80, 'Maximum supported age is 80'),

    income: z
      .number()
      .positive('Monthly income must be greater than 0')
      .max(10_000_000, 'Monthly income seems too high — please verify'),

    expenses: z
      .number()
      .min(0, 'Expenses cannot be negative'),

    savings: z.number().min(0, 'Savings cannot be negative').default(0),

    loans: z.number().min(0, 'Loan amount cannot be negative').default(0),

    investments: z.string().max(500).default(''),

    goals: z.string().max(500).default(''),

    // Optional advanced fields
    riskAppetite: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
    employmentType: z.enum(['salaried', 'self_employed', 'freelance']).optional(),
    city: z.string().max(50).optional(),
    familySize: z.number().int().min(1).max(20).optional(),
    monthlyEMI: z.number().min(0).optional(),
    hasTermInsurance: z.boolean().optional(),
    hasHealthInsurance: z.boolean().optional(),

    // Portfolio fund IDs
    fundIds: z.array(z.string().max(50)).max(15).optional(),

    // Goals list
    goalsList: z
      .array(
        z.object({
          title: z.string().max(100),
          targetAmount: z.number().positive(),
          targetDate: z.string(), // ISO date string
          currentSaved: z.number().min(0),
          priority: z.enum(['critical', 'high', 'medium', 'low']),
        })
      )
      .max(10)
      .optional(),

    // Extracted Form 16 data
    _form16: z
      .object({
        grossSalary: z.number().optional(),
        hra: z.number().optional(),
        section80C: z.number().optional(),
        section80D: z.number().optional(),
        homeLoanInterest: z.number().optional(),
        taxableIncome: z.number().optional(),
        taxDeducted: z.number().optional(),
      })
      .optional(),
  })
  .refine((d) => d.expenses < d.income * 2.5, {
    message: 'Monthly expenses cannot exceed 2.5× your monthly income',
    path: ['expenses'],
  });

export type FinancialProfileInput = z.infer<typeof FinancialProfileInput>;

// ── NAV Portfolio Request ─────────────────────────────────────────────────────
export const NAVRequest = z.object({
  schemeCodes: z
    .array(z.string().regex(/^\d+$/, 'Scheme codes must be numeric'))
    .min(1)
    .max(20),
});

// ── Goal Plan Request ─────────────────────────────────────────────────────────
export const GoalPlanRequest = z.object({
  goals: z.array(
    z.object({
      title: z.string(),
      targetAmount: z.number().positive(),
      targetDate: z.string(),
      currentSaved: z.number().min(0),
      monthlyContribution: z.number().min(0),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
    })
  ),
  riskAppetite: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
});

// ── Helper: parse and return 422 on failure ────────────────────────────────────
export function parseOrError<T>(schema: z.ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; response: Response } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors = result.error.flatten().fieldErrors;
  return {
    success: false,
    response: Response.json(
      { success: false, error: 'Validation failed', fieldErrors },
      { status: 422 }
    ),
  };
}
