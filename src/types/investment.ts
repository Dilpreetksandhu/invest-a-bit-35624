export interface Transaction {
  desc: string;
  amount: number;
  date: string;
  roundUp: number;
  category: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  transactions: Transaction[];
  monthlyContribution: string;
  annualReturn: string;
  years: string;
  goalAmount?: number;
  goalYears?: number;
}

export interface ProjectionData {
  values: number[];
  labels: string[];
  conservative?: number[];
  aggressive?: number[];
}

export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Bills & Utilities",
  "Transport",
  "Entertainment",
  "Health",
  "Other"
] as const;

export type Category = typeof CATEGORIES[number];
