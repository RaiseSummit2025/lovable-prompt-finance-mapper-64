export interface TrialBalanceEntry {
  date: string;
  accountNumber: string;
  accountDescription: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountMapping {
  accountNumber: string;
  accountDescription: string;
  highLevelCategory: string;
  subCategory: string;
  detailedCategory: string;
}

export interface FinancialStatement {
  type: 'income' | 'balance' | 'cashflow';
  data: FinancialStatementLine[];
  period: string;
}

export interface FinancialStatementLine {
  category: string;
  subCategory?: string;
  amount: number;
  previousAmount?: number;
  variance?: number;
  variancePercent?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalDebits: number;
    totalCredits: number;
    totalBalance: number;
    recordCount: number;
  };
}

export interface FinancialCategories {
  assets: string[];
  liabilities: string[];
  equity: string[];
  revenues: string[];
  expenses: string[];
}

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  workingCapital: number;
  currentRatio: number;
  debtToEquity: number;
}