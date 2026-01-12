
import { Member, Transaction, TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod, Budget } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Ravi Kumar', mobile: '+91 98765 43210', email: 'ravi@example.com' },
  { id: '2', name: 'Anita Singh', mobile: '+91 98123 45678', email: 'anita@example.com' },
  { id: '3', name: 'Samuel John', mobile: '+91 99887 76655', email: 'samuel@example.com' },
  { id: '4', name: 'Grace Thomas', mobile: '+91 88776 65544' },
  { id: '5', name: 'Esther Rani', mobile: '+91 77665 54433' },
  { id: '6', name: 'Paul Mathew', mobile: '+91 66554 43322', email: 'paul@example.com' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2023-10-01',
    amount: 5000,
    type: TransactionType.INCOME,
    category: IncomeCategory.TITHE,
    description: 'Monthly Tithe',
    memberId: '1',
    paymentMethod: PaymentMethod.UPI,
  },
  {
    id: 't2',
    date: '2023-10-05',
    amount: 200,
    type: TransactionType.INCOME,
    category: IncomeCategory.OFFERING,
    description: 'Sunday Offering',
    paymentMethod: PaymentMethod.CASH,
  },
  {
    id: 't3',
    date: '2023-10-10',
    amount: 12000,
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.UTILITIES,
    description: 'Electricity Bill - Sept',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
  },
  {
    id: 't4',
    date: '2023-10-15',
    amount: 2500,
    type: TransactionType.INCOME,
    category: IncomeCategory.TITHE,
    description: 'Tithe',
    memberId: '2',
    paymentMethod: PaymentMethod.CASH,
  },
  {
    id: 't5',
    date: '2023-10-20',
    amount: 5000,
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.MAINTENANCE,
    description: 'AC Repair',
    paymentMethod: PaymentMethod.CASH,
  },
  {
    id: 't6',
    date: '2023-10-22',
    amount: 500,
    type: TransactionType.INCOME,
    category: IncomeCategory.LOOSE_OFFERING,
    description: 'Evening Service Loose Offering',
    paymentMethod: PaymentMethod.CASH,
  },
  {
    id: 't7',
    date: '2023-11-01',
    amount: 6000,
    type: TransactionType.INCOME,
    category: IncomeCategory.TITHE,
    description: 'November Tithe',
    memberId: '3',
    paymentMethod: PaymentMethod.UPI,
  },
  {
    id: 't8',
    date: '2023-11-05',
    amount: 15000,
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.SALARY,
    description: 'Staff Salary',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b1',
    name: 'General Fund 2024',
    amount: 250000,
    year: 2024,
    categories: [ExpenseCategory.SALARY, ExpenseCategory.UTILITIES, ExpenseCategory.ADMIN],
  },
  {
    id: 'b2',
    name: 'Missions & Outreach',
    amount: 50000,
    year: 2024,
    categories: [ExpenseCategory.CHARITY],
  },
  {
    id: 'b3',
    name: 'Building Maintenance',
    amount: 100000,
    year: 2024,
    categories: [ExpenseCategory.MAINTENANCE],
  }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    // Income
    [IncomeCategory.TITHE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    [IncomeCategory.OFFERING]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    [IncomeCategory.LOOSE_OFFERING]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    [IncomeCategory.DONATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    [IncomeCategory.FUNDRAISING]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
    [IncomeCategory.CHARITY]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    
    // Expense
    [ExpenseCategory.SALARY]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    [ExpenseCategory.UTILITIES]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    [ExpenseCategory.MAINTENANCE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [ExpenseCategory.EVENTS]: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    [ExpenseCategory.ADMIN]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  };
  
  return colors[category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
};
