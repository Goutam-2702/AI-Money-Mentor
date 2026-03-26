/**
 * Server-side input validation for financial profile data.
 * Returns field-level validation errors with actionable suggestions.
 */

export interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateFinancialProfile(input: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];

  const {
    age, income, expenses, savings, loans,
    investments, goals
  } = input;

  // ── AGE ───────────────────────────────────────────────────────────────────
  if (age === undefined || age === null || age === '') {
    errors.push({ field: 'age', message: 'Age is required.' });
  } else {
    const ageNum = Number(age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
      errors.push({ field: 'age', message: 'Age must be a whole number.' });
    } else if (ageNum < 18) {
      errors.push({ field: 'age', message: 'You must be at least 18 to use this service.' });
    } else if (ageNum > 100) {
      errors.push({ field: 'age', message: 'Please enter a valid age (≤ 100).' });
    }
  }

  // ── INCOME ────────────────────────────────────────────────────────────────
  if (income === undefined || income === null || income === '') {
    errors.push({ field: 'income', message: 'Monthly income is required.' });
  } else {
    const incomeNum = Number(income);
    if (isNaN(incomeNum) || incomeNum < 0) {
      errors.push({ field: 'income', message: 'Income must be a positive number.' });
    } else if (incomeNum < 1000) {
      errors.push({
        field: 'income',
        message: 'Monthly income seems too low (< ₹1,000).',
        suggestion: 'Enter your total monthly take-home salary including all income sources.'
      });
    } else if (incomeNum > 10000000) {
      errors.push({
        field: 'income',
        message: 'Monthly income exceeds ₹1 Cr. Please verify the value.',
        suggestion: 'This tool is optimized for monthly salaries up to ₹1 Cr.'
      });
    }
  }

  // ── EXPENSES ──────────────────────────────────────────────────────────────
  if (expenses === undefined || expenses === null || expenses === '') {
    errors.push({ field: 'expenses', message: 'Monthly expenses are required.' });
  } else {
    const expensesNum = Number(expenses);
    const incomeNum = Number(income);
    if (isNaN(expensesNum) || expensesNum < 0) {
      errors.push({ field: 'expenses', message: 'Expenses must be a positive number.' });
    } else if (!isNaN(incomeNum) && expensesNum >= incomeNum * 1.5) {
      errors.push({
        field: 'expenses',
        message: 'Expenses are 1.5× more than income. Please verify.',
        suggestion: 'Include only regular monthly outflows: rent, groceries, utilities, subscriptions, EMIs.'
      });
    } else if (expensesNum < 1000) {
      errors.push({
        field: 'expenses',
        message: 'Monthly expenses seem too low (< ₹1,000).',
        suggestion: 'Include all outflows: rent, food, transport, bills, EMIs.'
      });
    }
  }

  // ── SAVINGS ───────────────────────────────────────────────────────────────
  if (savings === undefined || savings === null || savings === '') {
    errors.push({ field: 'savings', message: 'Total savings is required.' });
  } else {
    const savingsNum = Number(savings);
    if (isNaN(savingsNum) || savingsNum < 0) {
      errors.push({ field: 'savings', message: 'Savings must be 0 or more.' });
    }
  }

  // ── LOANS ─────────────────────────────────────────────────────────────────
  if (loans !== undefined && loans !== null && loans !== '') {
    const loansNum = Number(loans);
    if (isNaN(loansNum) || loansNum < 0) {
      errors.push({ field: 'loans', message: 'Outstanding loan amount must be 0 or more.' });
    }
  }

  // ── INVESTMENTS ───────────────────────────────────────────────────────────
  if (typeof investments === 'string' && investments.length > 500) {
    errors.push({
      field: 'investments',
      message: 'Investment description must be under 500 characters.'
    });
  }

  // ── GOALS ─────────────────────────────────────────────────────────────────
  if (typeof goals === 'string' && goals.length > 500) {
    errors.push({
      field: 'goals',
      message: 'Goals description must be under 500 characters.'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/** Sanitizes and coerces input to the correct types after validation passes. */
export function sanitizeInput(input: Record<string, any>) {
  return {
    age: Math.floor(Number(input.age)),
    income: Math.max(0, Number(input.income)),
    expenses: Math.max(0, Number(input.expenses)),
    savings: Math.max(0, Number(input.savings ?? 0)),
    loans: Math.max(0, Number(input.loans ?? 0)),
    investments: String(input.investments ?? '').trim().slice(0, 500),
    goals: String(input.goals ?? '').trim().slice(0, 500),
  };
}
