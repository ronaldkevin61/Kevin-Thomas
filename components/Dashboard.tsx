import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, IndianRupee, Filter } from 'lucide-react';
import { getCategoryColor } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currencySymbol }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const years = useMemo(() => {
    const startYear = 2020;
    const endYear = 2050;
    const range = [];
    for (let i = endYear; i >= startYear; i--) {
        range.push(i);
    }
    return range;
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => new Date(t.date).getFullYear() === selectedYear);
  }, [transactions, selectedYear]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense
    };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
      const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
      const data = months.map(month => ({ name: month, Income: 0, Expense: 0, Net: 0 }));

      filteredTransactions.forEach(t => {
          const date = new Date(t.date);
          const monthIndex = date.getMonth();
          if (t.type === TransactionType.INCOME) data[monthIndex].Income += t.amount;
          else data[monthIndex].Expense += t.amount;
      });
      
      data.forEach(d => {
          d.Net = d.Income - d.Expense;
      });
      
      return data;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 shadow-sm">
          <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year} className="dark:bg-neutral-900">{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{currencySymbol}{stats.income.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{currencySymbol}{stats.expense.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {currencySymbol}{stats.net.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Financial Overview ({selectedYear})</h4>
          <div className="flex-1 min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" className="opacity-20 dark:opacity-50" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    // tickFormatter={(value) => `${value}`} // Removed currency symbol
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderRadius: '8px', border: '1px solid #262626', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `${currencySymbol}${value.toLocaleString('en-IN')}`} 
                />
                <Legend />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Details Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col h-auto">
          <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
             <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Monthly Details</h4>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3">Month</th>
                  <th className="px-6 py-3 text-right">Inc.</th>
                  <th className="px-6 py-3 text-right">Exp.</th>
                  <th className="px-6 py-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {monthlyData.map((m) => (
                  <tr key={m.name} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-200">{m.name}</td>
                    <td className="px-6 py-3 text-right text-green-600 dark:text-green-400">+{m.Income.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 text-right text-red-600 dark:text-red-400">-{m.Expense.toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-3 text-right font-medium ${m.Net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {m.Net.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Mini-List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-neutral-800">
             <h4 className="text-base font-semibold text-slate-800 dark:text-white">Recent Transactions</h4>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-neutral-800">
            {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            <IndianRupee className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t.description || t.category}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{new Date(t.date).toLocaleDateString() • {t.category}}</p>
                        </div>
                    </div>
                    <span className={`text-sm font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString('en-IN')}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;