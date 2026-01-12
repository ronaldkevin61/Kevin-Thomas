
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Budget, Transaction, TransactionType } from '../types';
import { Plus, Trash2, X, AlertTriangle, Edit, Upload, Paperclip, Eye, Tag, Calendar, Search, LayoutGrid, List, Filter, ScanLine, Sparkles, Loader2, Save, FileText, ArrowDownRight, ArrowUpRight, Wallet, BarChart as BarChartIcon } from 'lucide-react';
import { formatCurrency, getCategoryColor } from '../constants';
import { scanReceipt } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  currencySymbol: string;
}

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

const Budgets: React.FC<BudgetsProps> = ({ 
  budgets, 
  transactions, 
  onAddBudget, 
  onUpdateBudget,
  onDeleteBudget, 
  currencySymbol 
}) => {
  // View & Filter States
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  // Modal States
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Drill down states
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null);
  const [detailCategoryFilter, setDetailCategoryFilter] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(''); // Budget Name
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [categoryInput, setCategoryInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // File/AI State
  const [isScanning, setIsScanning] = useState(false);

  // --- Filtering Logic for Main List ---
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.amount.toString().includes(searchTerm);
      const matchesYear = filterYear === 'ALL' || (b.year && b.year.toString() === filterYear);
      return matchesSearch && matchesYear;
    });
  }, [budgets, searchTerm, filterYear]);

  const years = useMemo(() => {
      const startYear = 2020;
      const endYear = 2050;
      const range = [];
      for (let i = endYear; i >= startYear; i--) {
          range.push(i);
      }
      return range;
  }, []);

  // --- Stats Logic ---
  const getBudgetStats = (budget: Budget) => {
    const relatedTransactions = transactions.filter(t => {
        // Condition 1: Explicit Link
        if (t.budgetId === budget.id) return true;
        
        // Condition 2: Implicit Link (Only for Expenses, legacy behavior)
        if (!t.budgetId && t.type === TransactionType.EXPENSE) {
             const matchesCategory = budget.categories.includes(t.category);
             const matchesYear = budget.year ? new Date(t.date).getFullYear() === budget.year : true;
             return matchesCategory && matchesYear;
        }
        
        return false;
    });

    const totalIncome = relatedTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = relatedTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const percentage = budget.amount > 0 ? Math.min((totalExpense / budget.amount) * 100, 100) : 0;
    const isOverBudget = totalExpense > budget.amount;

    return { totalIncome, totalExpense, netBalance, percentage, isOverBudget, relatedTransactions };
  };

  const getMonthlyChartData = (budget: Budget) => {
      const { relatedTransactions } = getBudgetStats(budget);
      const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
      const data = months.map(month => ({ name: month, Income: 0, Expense: 0 }));

      relatedTransactions.forEach(t => {
          const date = new Date(t.date);
          const monthIndex = date.getMonth();
          if (t.type === TransactionType.INCOME) data[monthIndex].Income += t.amount;
          else data[monthIndex].Expense += t.amount;
      });
      return data;
  };

  // --- Form Handlers ---

  const handleOpenAdd = () => {
    setName('');
    setAmount('');
    setFormattedAmount('');
    setYear(new Date().getFullYear().toString());
    setCategoryInput('');
    setSelectedCategories([]);
    setIsEditing(false);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, budget: Budget) => {
    e.stopPropagation();
    setName(budget.name);
    setAmount(budget.amount.toString());
    setFormattedAmount(budget.amount.toLocaleString('en-IN'));
    setYear(budget.year ? budget.year.toString() : '');
    setCategoryInput('');
    setSelectedCategories(budget.categories);
    setIsEditing(true);
    setEditingId(budget.id);
    setIsAdding(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '');
      if (raw === '' || /^\d+$/.test(raw)) {
          setAmount(raw);
          if (raw) {
              setFormattedAmount(parseInt(raw).toLocaleString('en-IN'));
          } else {
              setFormattedAmount('');
          }
      }
  };

  const handleAddCategoryTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && categoryInput.trim()) {
          e.preventDefault();
          if (!selectedCategories.includes(categoryInput.trim())) {
              setSelectedCategories([...selectedCategories, categoryInput.trim()]);
          }
          setCategoryInput('');
      }
  };

  const removeCategoryTag = (catToRemove: string) => {
      setSelectedCategories(prev => prev.filter(c => c !== catToRemove));
  };

  const handleQuickAmount = (val: number, e: React.MouseEvent) => {
      e.preventDefault();
      const currentVal = parseInt(amount || '0');
      const newVal = currentVal + val;
      setAmount(newVal.toString());
      setFormattedAmount(newVal.toLocaleString('en-IN'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const budgetData = {
      name,
      amount: parseFloat(amount),
      year: year ? parseInt(year) : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : ['General'],
    };

    if (isEditing && editingId) {
        onUpdateBudget({ ...budgetData, id: editingId });
    } else {
        onAddBudget(budgetData);
    }

    setIsAdding(false);
  };

  // --- Detail View Logic ---
  const getFilteredTransactions = (budget: Budget) => {
    const { relatedTransactions } = getBudgetStats(budget);
    let txs = relatedTransactions;

    if (detailCategoryFilter) {
        txs = txs.filter(t => t.category === detailCategoryFilter);
    }

    return txs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Budgets & Funds</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track expenses and manage fund balances.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
             <div className="relative flex-1 md:w-48">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search budgets..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg outline-none focus:border-blue-500"
                 />
             </div>
             
             <select 
                value={filterYear} 
                onChange={e => setFilterYear(e.target.value)}
                className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
                <option value="ALL">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('GRID')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-white dark:bg-neutral-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-neutral-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>

            <button 
              onClick={handleOpenAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-200 dark:shadow-none shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Budget
            </button>
        </div>
      </div>

      {/* Main Content: Grid or List */}
      {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map(budget => {
              const { totalIncome, totalExpense, netBalance, percentage, isOverBudget } = getBudgetStats(budget);
              return (
                <div 
                    key={budget.id} 
                    onClick={() => {
                        setDetailCategoryFilter(null);
                        setViewingBudget(budget);
                    }}
                    className="bg-[#fdfbf7] dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm relative group transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                            onClick={(e) => handleOpenEdit(e, budget)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 pr-12 truncate">{budget.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                      {budget.year && <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-neutral-700">{budget.year}</span>}
                      <span className="text-xs text-slate-400 font-medium">Goal: {currencySymbol}{budget.amount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                       <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30">
                           <div className="flex items-center gap-1.5 mb-1 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                               <ArrowUpRight className="w-3 h-3" /> Received
                           </div>
                           <p className="font-bold text-slate-800 dark:text-slate-100">{currencySymbol}{totalIncome.toLocaleString('en-IN')}</p>
                       </div>
                       <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                           <div className="flex items-center gap-1.5 mb-1 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                               <ArrowDownRight className="w-3 h-3" /> Spent
                           </div>
                           <p className="font-bold text-slate-800 dark:text-slate-100">{currencySymbol}{totalExpense.toLocaleString('en-IN')}</p>
                       </div>
                  </div>

                  {/* Net Balance & Progress */}
                  <div className="mb-4">
                      <div className="flex justify-between items-end mb-2">
                         <div>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Balance / Available</p>
                             <p className={`text-lg font-bold ${netBalance < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                 {currencySymbol}{netBalance.toLocaleString('en-IN')}
                             </p>
                         </div>
                         {isOverBudget && (
                            <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Over Limit
                            </span>
                         )}
                      </div>

                      <div className="w-full h-2 bg-stone-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-slate-700 dark:bg-indigo-500'}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-right text-slate-400 mt-1">{percentage.toFixed(0)}% of budget used</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {budget.categories.slice(0, 3).map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded text-[10px] text-slate-500 dark:text-slate-400">
                        {cat}
                      </span>
                    ))}
                    {budget.categories.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] text-slate-400">+{budget.categories.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-neutral-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3">Budget Name</th>
                            <th className="px-6 py-3">Year</th>
                            <th className="px-6 py-3 text-right">Goal/Limit</th>
                            <th className="px-6 py-3 text-right text-green-600 dark:text-green-400">Income</th>
                            <th className="px-6 py-3 text-right text-red-600 dark:text-red-400">Expense</th>
                            <th className="px-6 py-3 text-right">Balance</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {filteredBudgets.map(budget => {
                            const { totalIncome, totalExpense, netBalance } = getBudgetStats(budget);
                            return (
                                <tr key={budget.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                    <td 
                                        className="px-6 py-4 font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600"
                                        onClick={() => { setDetailCategoryFilter(null); setViewingBudget(budget); }}
                                    >
                                        {budget.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{budget.year || 'All Time'}</td>
                                    <td className="px-6 py-4 text-right font-medium">{currencySymbol}{budget.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">+{currencySymbol}{totalIncome.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">-{currencySymbol}{totalExpense.toLocaleString('en-IN')}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${netBalance < 0 ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {currencySymbol}{netBalance.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={(e) => handleOpenEdit(e, budget)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
          </div>
      )}

      {/* --- Create / Edit Budget Modal --- */}
      {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)} />
              <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-bounce-in border border-slate-200 dark:border-neutral-800 overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                            {isEditing ? 'Edit Budget' : 'New Budget'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter details below</p>
                      </div>
                      <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full text-slate-500 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Year</label>
                                <input 
                                    type="number" 
                                    min="2020" max="2050"
                                    value={year} 
                                    onChange={e => setYear(e.target.value)} 
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Budget Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Building Fund"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Budget Limit / Goal <span className="text-red-500">*</span></label>
                            <div className="relative mb-3">
                                <span className="absolute left-3 top-2.5 text-slate-500">{currencySymbol}</span>
                                <input 
                                    type="text" 
                                    required 
                                    value={formattedAmount} 
                                    onChange={handleAmountChange} 
                                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg" 
                                    placeholder="0" 
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_AMOUNTS.map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={(e) => handleQuickAmount(amt, e)}
                                        className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-neutral-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full border border-slate-200 dark:border-neutral-700 transition-colors"
                                    >
                                        +{amt.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Add Categories (Optional)</label>
                            <input 
                                type="text"
                                placeholder="Type & Enter to add tags..."
                                value={categoryInput}
                                onChange={e => setCategoryInput(e.target.value)}
                                onKeyDown={handleAddCategoryTag}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Expenses with these categories will automatically link to this budget.</p>
                        </div>

                        {/* Selected Categories Tags */}
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map(cat => (
                                    <span key={cat} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-md border border-indigo-100 dark:border-indigo-800">
                                        {cat}
                                        <button type="button" onClick={() => removeCategoryTag(cat)} className="hover:text-indigo-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="pt-2">
                            <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none transition-transform active:scale-[0.98]">
                                {isEditing ? 'Update Budget' : 'Save Budget'}
                            </button>
                        </div>
                    </form>
                  </div>
              </div>
          </div>
      )}

      {/* --- Detail View Modal (Drill Down) --- */}
      {viewingBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewingBudget(null)}>
              <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-bounce-in border border-slate-200 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                  
                  {/* Detail Header */}
                  <div className="p-6 bg-slate-50 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-start">
                       <div>
                           <div className="flex items-center gap-3">
                               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{viewingBudget.name}</h2>
                               <span className="px-2 py-1 bg-white dark:bg-neutral-700 rounded border border-slate-200 dark:border-neutral-600 text-xs font-semibold text-slate-500 dark:text-slate-300">
                                   {viewingBudget.year || 'All Time'}
                               </span>
                           </div>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Transaction History & Fund Status</p>
                       </div>
                       <button onClick={() => setViewingBudget(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-full text-slate-500">
                           <X className="w-5 h-5" />
                       </button>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="p-6 bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                           <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goal / Limit</p>
                               <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{currencySymbol}{viewingBudget.amount.toLocaleString('en-IN')}</p>
                           </div>
                           <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                               <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Total Received</p>
                               <p className="text-xl font-bold text-green-700 dark:text-green-400 mt-1">+{currencySymbol}{getBudgetStats(viewingBudget).totalIncome.toLocaleString('en-IN')}</p>
                           </div>
                           <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                               <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Total Spent</p>
                               <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">-{currencySymbol}{getBudgetStats(viewingBudget).totalExpense.toLocaleString('en-IN')}</p>
                           </div>
                           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                               <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Net Balance</p>
                               <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                                   {currencySymbol}{getBudgetStats(viewingBudget).netBalance.toLocaleString('en-IN')}
                               </p>
                           </div>
                      </div>

                      {/* Monthly Chart */}
                      <div className="h-48 w-full mt-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Activity</h4>
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getMonthlyChartData(viewingBudget)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                      itemStyle={{ color: '#fff' }}
                                      formatter={(value: number) => `${currencySymbol}${value.toLocaleString('en-IN')}`}
                                  />
                                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Categories Filters */}
                  <div className="px-6 py-3 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setDetailCategoryFilter(null)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${!detailCategoryFilter ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            All Categories
                        </button>
                        {viewingBudget.categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setDetailCategoryFilter(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${detailCategoryFilter === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                  </div>

                  {/* Transaction List */}
                  <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-neutral-900">
                      {getFilteredTransactions(viewingBudget).length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                              {getFilteredTransactions(viewingBudget).map(t => (
                                  <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                      <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                              <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                                  {t.type === TransactionType.INCOME ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                              </div>
                                              <div>
                                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t.description}</p>
                                                  <div className="flex items-center gap-2 mt-0.5">
                                                      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                                                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-neutral-800 rounded text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700">
                                                          {t.category}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <p className={`font-semibold text-sm ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                  {t.type === TransactionType.INCOME ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString('en-IN')}
                                              </p>
                                              {/* Removed receipt button here to avoid file preview complexity without valid url */}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-12 text-center text-slate-500">
                              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                              <p>No transactions found for this budget/category.</p>
                          </div>
                      )}
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex justify-end gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteId(viewingBudget.id); }}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            Delete Budget
                        </button>
                        <button 
                            onClick={(e) => {
                                handleOpenEdit(e, viewingBudget);
                                setViewingBudget(null);
                            }}
                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            Edit Budget
                        </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in border border-slate-200 dark:border-neutral-800">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Budget?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Are you sure you want to delete this budget plan?
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={() => setDeleteId(null)}
                            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                if (deleteId) onDeleteBudget(deleteId);
                                setDeleteId(null);
                                setViewingBudget(null);
                            }}
                            className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
