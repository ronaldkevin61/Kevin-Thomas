import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Printer, Calendar, FileText, BarChart3, Receipt, Building2 } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  churchName: string;
  currencySymbol: string;
}

type ReportType = 'DETAILED' | 'MONTHLY_SUMMARY' | 'YEARLY_SUMMARY';

const Reports: React.FC<ReportsProps> = ({ transactions, churchName, currencySymbol }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportType, setReportType] = useState<ReportType>('MONTHLY_SUMMARY');

  const years = useMemo(() => {
    const startYear = 2020;
    const endYear = 2050;
    const range = [];
    for (let i = endYear; i >= startYear; i--) {
        range.push(i);
    }
    return range;
  }, []);

  const data = useMemo(() => {
      if (reportType === 'YEARLY_SUMMARY') {
          return transactions; // We need all data for yearly comparison, filtered later
      }
      return transactions.filter(t => new Date(t.date).getFullYear() === year);
  }, [transactions, year, reportType]);
  
  // Calculations for summaries
  const monthlySummary = useMemo(() => {
      if (reportType !== 'MONTHLY_SUMMARY') return [];
      
      const summary = new Array(12).fill(0).map((_, i) => ({
          month: new Date(0, i).toLocaleString('default', { month: 'long' }),
          income: 0,
          expense: 0,
          net: 0
      }));

      data.forEach(t => {
          const monthIdx = new Date(t.date).getMonth();
          if (t.type === TransactionType.INCOME) summary[monthIdx].income += t.amount;
          else summary[monthIdx].expense += t.amount;
      });

      return summary.map(s => ({ ...s, net: s.income - s.expense }));
  }, [data, reportType]);

  const yearlySummary = useMemo(() => {
      if (reportType !== 'YEARLY_SUMMARY') return [];
      
      const summary: Record<string, { income: number, expense: number }> = {};
      
      data.forEach(t => {
          const y = new Date(t.date).getFullYear().toString();
          if (!summary[y]) summary[y] = { income: 0, expense: 0 };
          
          if (t.type === TransactionType.INCOME) summary[y].income += t.amount;
          else summary[y].expense += t.amount;
      });

      return Object.entries(summary)
        .map(([y, val]) => ({ year: y, ...val, net: val.income - val.expense }))
        .sort((a,b) => parseInt(b.year) - parseInt(a.year));
  }, [data, reportType]);

  const totalIncome = data.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Statements</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Official church financial records and summaries.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                {reportType !== 'YEARLY_SUMMARY' && (
                    <select 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))}
                        className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-white rounded-lg px-3 py-2 outline-none shadow-sm font-medium"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                )}
                
                <div className="flex bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 p-1 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setReportType('DETAILED')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${reportType === 'DETAILED' ? 'bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Detailed
                    </button>
                    <button 
                        onClick={() => setReportType('MONTHLY_SUMMARY')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${reportType === 'MONTHLY_SUMMARY' ? 'bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setReportType('YEARLY_SUMMARY')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${reportType === 'YEARLY_SUMMARY' ? 'bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Yearly
                    </button>
                </div>

                <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 shadow-lg shadow-slate-200 dark:shadow-none font-medium text-sm transition-opacity">
                    <Printer className="w-4 h-4" /> Print
                </button>
            </div>
        </div>

        {/* Report Container - Designed to look like a document */}
        <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-100 max-w-5xl mx-auto print:shadow-none print:border-none print:p-0 print:w-full dark:bg-neutral-900 dark:border-neutral-800 print:dark:bg-white print:dark:text-black">
            
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 dark:border-white pb-6 mb-8 print:border-black">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-8 h-8 text-slate-900 dark:text-white print:text-black" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white print:text-black uppercase tracking-wider">{churchName}</h1>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 print:text-gray-600 font-medium">Financial Statement & Report</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white print:text-black">
                        {reportType === 'DETAILED' && `Detailed Report`}
                        {reportType === 'MONTHLY_SUMMARY' && `Monthly Summary`}
                        {reportType === 'YEARLY_SUMMARY' && `Annual Summary`}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 print:text-gray-600 mt-1">
                        Period: {reportType === 'YEARLY_SUMMARY' ? 'All Time' : year}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 print:text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Detailed View - Modern Grid Layout */}
            {reportType === 'DETAILED' && (
                <>
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <div className="p-6 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 print:bg-white print:border-slate-300">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 print:text-black">{currencySymbol}{totalIncome.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 print:bg-white print:border-slate-300">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Expense</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 print:text-black">{currencySymbol}{totalExpense.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700 print:bg-white print:border-slate-300">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Net Balance</p>
                            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'} print:text-black`}>
                                {currencySymbol}{netBalance.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-neutral-800 print:border-slate-300">
                            <Receipt className="w-5 h-5 text-slate-500" />
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white print:text-black">Transaction History</h3>
                        </div>
                        
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-left bg-slate-50 dark:bg-neutral-800 print:bg-slate-100 border-y border-slate-200 dark:border-neutral-700 print:border-slate-300">
                                    <th className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200 print:text-black">Date</th>
                                    <th className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200 print:text-black">Category</th>
                                    <th className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200 print:text-black">Description</th>
                                    <th className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200 print:text-black">Income</th>
                                    <th className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200 print:text-black">Expense</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 print:divide-slate-200">
                                {data.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 print:hover:bg-transparent">
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 print:text-black">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 print:text-black">
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 print:bg-transparent print:p-0 print:text-black border border-slate-200 dark:border-neutral-700 print:border-none">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 print:text-black">{t.description}</td>
                                        <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400 print:text-black">
                                            {t.type === TransactionType.INCOME ? `${currencySymbol}${t.amount.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-red-600 dark:text-red-400 print:text-black">
                                            {t.type === TransactionType.EXPENSE ? `${currencySymbol}${t.amount.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Summary Tables - Clean & Professional */}
            {reportType === 'MONTHLY_SUMMARY' && (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-neutral-700 print:border-black">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-neutral-800 print:bg-slate-100 border-b border-slate-200 dark:border-neutral-700 print:border-black">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Month</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Income</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Expense</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Net Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-700 print:divide-slate-300">
                            {monthlySummary.map((m, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 print:text-black">{m.month}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 print:text-black">{currencySymbol}{m.income.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 print:text-black">{currencySymbol}{m.expense.toLocaleString('en-IN')}</td>
                                    <td className={`px-6 py-4 text-right font-bold print:text-black ${m.net >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-600'}`}>
                                        {currencySymbol}{m.net.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 dark:bg-neutral-800 font-bold print:bg-slate-100 border-t-2 border-slate-200 dark:border-neutral-600 print:border-black">
                                <td className="px-6 py-4 text-slate-900 dark:text-white print:text-black uppercase text-xs tracking-wider">Total</td>
                                <td className="px-6 py-4 text-right text-green-700 dark:text-green-400 print:text-black">{currencySymbol}{monthlySummary.reduce((a,b)=>a+b.income,0).toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right text-red-700 dark:text-red-400 print:text-black">{currencySymbol}{monthlySummary.reduce((a,b)=>a+b.expense,0).toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-right text-blue-700 dark:text-blue-400 print:text-black">{currencySymbol}{monthlySummary.reduce((a,b)=>a+b.net,0).toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {reportType === 'YEARLY_SUMMARY' && (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-neutral-700 print:border-black">
                     <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-neutral-800 print:bg-slate-100 border-b border-slate-200 dark:border-neutral-700 print:border-black">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Year</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Total Income</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Total Expense</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white print:text-black uppercase text-xs tracking-wider">Net Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-700 print:divide-slate-300">
                            {yearlySummary.map((y) => (
                                <tr key={y.year} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 print:text-black">{y.year}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 print:text-black">{currencySymbol}{y.income.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 print:text-black">{currencySymbol}{y.expense.toLocaleString('en-IN')}</td>
                                    <td className={`px-6 py-4 text-right font-bold print:text-black ${y.net >= 0 ? 'text-slate-800 dark:text-white' : 'text-red-600'}`}>
                                        {currencySymbol}{y.net.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="mt-16 flex justify-between items-end pt-8 border-t border-slate-200 dark:border-neutral-700 print:border-black">
                <div className="text-xs text-slate-400 dark:text-slate-500 print:text-black">
                    <p>This document is generated electronically.</p>
                    <p className="mt-1">Page 1 of 1</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-b border-slate-400 dark:border-slate-500 mb-2 print:border-black"></div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-black">Authorized Signature</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Reports;