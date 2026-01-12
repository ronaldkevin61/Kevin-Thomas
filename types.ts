
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI',
  BANK_TRANSFER = 'Bank Transfer',
  CHECK = 'Check',
}

export enum IncomeCategory {
  TITHE = 'Tithe',
  OFFERING = 'Offering',
  LOOSE_OFFERING = 'Loose Offering',
  CHARITY = 'Charity',
  DONATION = 'Donation',
  FUNDRAISING = 'Fundraising',
  OTHER = 'Other',
}

export enum ExpenseCategory {
  SALARY = 'Salary',
  UTILITIES = 'Utilities',
  MAINTENANCE = 'Maintenance',
  CHARITY = 'Charity/Mission',
  EVENTS = 'Events',
  ADMIN = 'Administration',
  OTHER = 'Other',
}

export interface Member {
  id: string;
  name: string;
  mobile: string;
  email?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory | string;
  description: string;
  memberId?: string;
  paymentMethod: PaymentMethod;
  attachmentUrl?: string; // For uploaded receipts
  budgetId?: string; // Link to a specific budget/fund
}

export interface Budget {
  id: string;
  name: string;
  amount: number; // Total budget limit or Fund Goal
  year?: number; // Optional year
  categories: string[]; // Expense categories included in this budget
  attachmentUrl?: string; // For uploaded budget documents
}

export interface AppSettings {
  churchName: string;
  currency: string;
  currencySymbol: string;
  darkMode: boolean;
  administratorName: string;
  email: string;
  logoUrl?: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
