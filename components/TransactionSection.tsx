import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod, Member } from '../types';
import { Plus, Search, Filter, Upload, Sparkles, Loader2, FileText, Paperclip, X, Eye, Calendar, Tag, UserPlus, Coins, Users, Layers, Check, ChevronDown, ScanLine, Trash2, AlertTriangle } from 'lucide-react';
import { scanReceipt } from '../services/geminiService';
import { getCategoryColor } from '../constants';

interface TransactionSectionProps {
  type: TransactionType;
  transactions: Transaction[];
  members: Member[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddMember?: (member: Omit<Member, 'id'>) => void;
  currencySymbol: string;
}

const getWeekOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    const day = date.getDate();
    return Math.ceil((day + dayOfWeek) / 7);
};

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const TransactionSection: React.FC<TransactionSectionProps> = ({ 
  type, 
  transactions, 
  members, 
  onAddTransaction,
  onDeleteTransaction,
  onAddMember,
  currencySymbol
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Tab State for Income
  const [incomeTab, setIncomeTab] = useState<'ALL' | 'TITHE_OFFERING' | 'LOOSE_OFFERING'>('ALL');

  // Filter States
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  // Enhanced Search: Search Member, Amount, Date, Description
  const [searchTerm, setSearchTerm] = useState('');
  
  // Popup States
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);
  
  // Filters for Category Popup
  const [catPopupYear, setCatPopupYear] = useState<string>('ALL');
  const [catPopupMonth, setCatPopupMonth] = useState<string>('ALL');

  // File Upload State
  const [tempFile, setTempFile] = useState<{file: File, base64: string} | null>(null);
  const [showScanOption, setShowScanOption] = useState(false);

  // Form States
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [memberId, setMemberId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentBase64, setAttachmentBase64] = useState('');
  
  // Searchable Member Dropdown State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // Quick Add Member Form
  const [quickMemName, setQuickMemName] = useState('');
  const [quickMemMobile, setQuickMemMobile] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener for member dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter members for dropdown
  const filteredMembersForDropdown = useMemo(() => {
    if (!memberSearchQuery) return members;
    return members.filter(m => 
        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
        m.mobile.includes(memberSearchQuery)
    );
  }, [members, memberSearchQuery]);

  // Filtering Logic for Main List
  const filteredList = useMemo(() => {
    let filtered = transactions.filter(t => t.type === type);
    
    // Tab Filtering for Income
    if (type === TransactionType.INCOME) {
        if (incomeTab === 'LOOSE_OFFERING') {
            filtered = filtered.filter(t => t.category === IncomeCategory.LOOSE_OFFERING);
        } else if (incomeTab === 'TITHE_OFFERING') {
            filtered = filtered.filter(t => t.category !== IncomeCategory.LOOSE_OFFERING);
        }
    }

    if (selectedYear !== 'ALL') {
        filtered = filtered.filter(t => new Date(t.date).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth !== 'ALL') {
        filtered = filtered.filter(t => new Date(t.date).getMonth().toString() === selectedMonth);
    }
    if (selectedWeek !== 'ALL') {
        filtered = filtered.filter(t => getWeekOfMonth(new Date(t.date)).toString() === selectedWeek);
    }

    // Comprehensive Search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(t => {
            const member = members.find(m => m.id === t.memberId);
            const memberName = member?.name.toLowerCase() || '';
            const desc = t.description.toLowerCase();
            const amt = t.amount.toString();
            const dateStr = t.date;
            
            return memberName.includes(term) || desc.includes(term) || amt.includes(term) || dateStr.includes(term);
        });
    }

    return filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, type, selectedYear, selectedMonth, selectedWeek, searchTerm, members, incomeTab]);

  // Year Range Logic (Up to 2050)
  const years = useMemo(() => {
      const startYear = 2020;
      const endYear = 2050;
      const yearArray = [];
      for (let y = endYear; y >= startYear; y--) {
          yearArray.push(y);
      }
      return yearArray;
  }, []);

  const months = [
      {val: '0', label: 'January'}, {val: '1', label: 'February'}, {val: '2', label: 'March'}, 
      {val: '3', label: 'April'}, {val: '4', label: 'May'}, {val: '5', label: 'June'},
      {val: '6', label: 'July'}, {val: '7', label: 'August'}, {val: '8', label: 'September'},
      {val: '9', label: 'October'}, {val: '10', label: 'November'}, {val: '11', label: 'December'}
  ];
  
  const weeks = [1, 2, 3, 4, 5];

  const handleOpenAddModal = (presetCategory?: string) => {
      setCategory(presetCategory || '');
      // If adding loose offering, force clear member ID
      if (presetCategory === IncomeCategory.LOOSE_OFFERING) {
          setMemberId('');
          setMemberSearchQuery('');
      } else {
          setMemberId('');
          setMemberSearchQuery('');
      }
      setIsAdding(true);
  };

  const handleSelectMember = (member: Member) => {
      setMemberId(member.id);
      setMemberSearchQuery(member.name);
      setShowMemberDropdown(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          setTempFile({
              file,
              base64: reader.result as string
          });
          setShowScanOption(true);
      };
      e.target.value = ''; // reset
  };

  const handleScanChoice = async (shouldScan: boolean) => {
      if (!tempFile) return;
      
      setAttachmentName(tempFile.file.name);
      setAttachmentBase64(tempFile.base64); 
      setShowScanOption(false);

      if (shouldScan) {
          setIsScanning(true);
          try {
              const base64Data = tempFile.base64.split(',')[1];
              const result = await scanReceipt(base64Data);
              if (result) {
                  if (result.amount) setAmount(result.amount.toString());
                  if (result.date) setDate(result.date);
                  if (result.description) setDescription(result.description);
              } else {
                  alert("Could not detect details automatically.");
              }
          } catch (err) {
              alert("Error scanning document.");
          } finally {
              setIsScanning(false);
          }
      }
      setTempFile(null);
  };

  const handleQuickAmount = (val: number, e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      const currentVal = parseFloat(amount || '0');
      setAmount((currentVal + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !category) return;

    onAddTransaction({
      date,
      amount: parseFloat(amount),
      type,
      category,
      description,
      paymentMethod,
      memberId: type === TransactionType.INCOME && memberId ? memberId : undefined,
      attachmentUrl: attachmentBase64 ? attachmentBase64 : undefined 
    });

    // Reset
    setAmount('');
    setDescription('');
    setCategory('');
    setAttachmentName('');
    setAttachmentBase64('');
    setMemberId('');
    setMemberSearchQuery('');
    setIsAdding(false);
  };
  
  const handleQuickAddMember = (e: React.FormEvent) => {
      e.preventDefault();
      if(quickMemName && quickMemMobile && onAddMember) {
          onAddMember({ name: quickMemName, mobile: quickMemMobile });
          setQuickMemName('');
          setQuickMemMobile('');
          setIsAddingMember(false);
      }
  };
  
  const confirmDelete = () => {
      if (deleteId) {
          onDeleteTransaction(deleteId);
          setDeleteId(null);
      }
  };

  const categoryTransactions = useMemo(() => {
      if (!viewingCategory) return [];
      let list = transactions.filter(t => t.category === viewingCategory && t.type === type);
      
      if (catPopupYear !== 'ALL') {
          list = list.filter(t => new Date(t.date).getFullYear().toString() === catPopupYear);
      }
      if (catPopupMonth !== 'ALL') {
          list = list.filter(t => new Date(t.date).getMonth().toString() === catPopupMonth);
      }

      return list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, viewingCategory, type, catPopupYear, catPopupMonth]);

  // Determine if we should hide member field (Loose Offering)
  const isLooseOfferingCategory = category === IncomeCategory.LOOSE_OFFERING;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {type === TransactionType.INCOME ? 'Income & Offerings' : 'Expenses & Payments'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage your church {type.toLowerCase()}.
            </p>
        </div>
        
        {/* Separate Buttons for Income */}
        <div className="flex gap-3">
            {type === TransactionType.INCOME ? (
                <>
                    <button 
                      onClick={() => handleOpenAddModal(IncomeCategory.LOOSE_OFFERING)}
                      className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors bg-teal-600 hover:bg-teal-700 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> New Loose Offering
                    </button>
                    <button 
                      onClick={() => handleOpenAddModal()}
                      className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors bg-green-600 hover:bg-green-700 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> New Tithe/Offering
                    </button>
                </>
            ) : (
                <button 
                  onClick={() => handleOpenAddModal()}
                  className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-colors bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Expense
                </button>
            )}
        </div>
      </div>

      {/* Tabs for Income */}
      {type === TransactionType.INCOME && (
          <div className="flex p-1 bg-slate-100 dark:bg-neutral-800 rounded-lg w-fit">
              <button 
                onClick={() => setIncomeTab('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${incomeTab === 'ALL' ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                  <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> All</div>
              </button>
              <button 
                onClick={() => setIncomeTab('TITHE_OFFERING')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${incomeTab === 'TITHE_OFFERING' ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                   <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Tithes & Member</div>
              </button>
              <button 
                onClick={() => setIncomeTab('LOOSE_OFFERING')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${incomeTab === 'LOOSE_OFFERING' ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                   <div className="flex items-center gap-2"><Coins className="w-4 h-4" /> Loose Offering</div>
              </button>
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in border border-slate-200 dark:border-neutral-800">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Transaction?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Are you sure you want to delete this transaction? This action cannot be undone.
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
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* New Entry Modal */}
      {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAdding(false)} />
              <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-bounce-in border border-slate-200 dark:border-neutral-800 overflow-hidden">
                  <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                            {type === TransactionType.INCOME 
                                ? (category === IncomeCategory.LOOSE_OFFERING ? 'New Loose Offering' : 'New Tithe / Offering') 
                                : 'New Expense'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter details below</p>
                      </div>
                      <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full text-slate-500 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    {isScanning && (
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center gap-3 animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Gemini is analyzing the image...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Date</label>
                                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                                <select 
                                    required 
                                    value={category} 
                                    onChange={e => setCategory(e.target.value)} 
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg outline-none transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {type === TransactionType.INCOME 
                                        ? Object.values(IncomeCategory).map(c => <option key={c} value={c}>{c}</option>)
                                        : Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Amount <span className="text-red-500">*</span></label>
                            <div className="relative mb-3">
                                <span className="absolute left-3 top-2.5 text-slate-500">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    required 
                                    min="1"
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)} 
                                    className={`w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border ${amount === '' ? 'border-slate-300 dark:border-neutral-600' : 'border-slate-200 dark:border-neutral-700'} text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg`} 
                                    placeholder="0.00" 
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
                                        +{amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {type === TransactionType.INCOME && !isLooseOfferingCategory && (
                            <div className="bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 relative">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Member (Optional)</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1" ref={memberDropdownRef}>
                                        <div 
                                            className="flex items-center w-full px-3 py-2.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg cursor-text"
                                            onClick={() => setShowMemberDropdown(true)}
                                        >
                                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                                            <input 
                                                type="text" 
                                                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                                                placeholder="Search member by name..."
                                                value={memberSearchQuery}
                                                onChange={(e) => {
                                                    setMemberSearchQuery(e.target.value);
                                                    setShowMemberDropdown(true);
                                                    if (e.target.value === '') setMemberId('');
                                                }}
                                                onFocus={() => setShowMemberDropdown(true)}
                                            />
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
                                        </div>

                                        {showMemberDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                                <div 
                                                    className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-neutral-700/50 cursor-pointer text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-neutral-700"
                                                    onClick={() => {
                                                        setMemberId('');
                                                        setMemberSearchQuery('');
                                                        setShowMemberDropdown(false);
                                                    }}
                                                >
                                                    Guest / Anonymous
                                                </div>
                                                {filteredMembersForDropdown.length > 0 ? (
                                                    filteredMembersForDropdown.map(m => (
                                                        <div 
                                                            key={m.id}
                                                            className="px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer flex items-center justify-between"
                                                            onClick={() => handleSelectMember(m)}
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{m.mobile}</p>
                                                            </div>
                                                            {memberId === m.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-3 text-sm text-slate-400 text-center">No members found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingMember(true)}
                                        className="px-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                        title="Add New Member"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                             <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Payment Method</label>
                             <div className="grid grid-cols-2 gap-3">
                                {Object.values(PaymentMethod).map(m => (
                                    <div key={m} onClick={() => setPaymentMethod(m)} className={`cursor-pointer px-3 py-2 rounded-lg border text-sm font-medium text-center transition-all ${paymentMethod === m ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                                        {m}
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Notes</label>
                            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg outline-none transition-all" placeholder="Description..." />
                        </div>

                        {/* File Upload Area Compact */}
                        <div className="border border-dashed border-slate-300 dark:border-neutral-700 rounded-xl p-3 bg-slate-50 dark:bg-neutral-800/50 text-center">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Attach Receipt</span>
                            </div>
                            {attachmentName && (
                                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                                    <Paperclip className="w-3 h-3" /> {attachmentName}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${type === TransactionType.INCOME ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none' : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'}`}>
                                Save Transaction
                            </button>
                        </div>
                    </form>
                  </div>
              </div>
          </div>
      )}

      {/* Quick Add Member Modal */}
      {isAddingMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-bounce-in border border-slate-200 dark:border-neutral-800">
                    <h3 className="font-bold text-lg mb-1 text-slate-800 dark:text-white">Quick Add Member</h3>
                    <p className="text-xs text-slate-500 mb-4">Add a new member to the directory.</p>
                    <div className="space-y-3">
                        <input placeholder="Full Name" value={quickMemName} onChange={e => setQuickMemName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input placeholder="Mobile Number" value={quickMemMobile} onChange={e => setQuickMemMobile(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-800 border dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-3 pt-3">
                            <button onClick={() => setIsAddingMember(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleQuickAddMember} className="flex-1 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors">Add Member</button>
                        </div>
                    </div>
               </div>
          </div>
      )}

      {/* Modal for Attach vs Scan */}
      {showScanOption && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 max-w-sm w-full animate-bounce-in border border-slate-200 dark:border-neutral-800">
                  <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <ScanLine className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Analyze Image?</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Do you want to use Gemini to analyze and extract details from this image?</p>
                      <div className="grid grid-cols-2 gap-3 w-full mt-2">
                          <button onClick={() => handleScanChoice(false)} className="px-4 py-2 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-neutral-800">
                              Attach Only
                          </button>
                          <button onClick={() => handleScanChoice(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                              <Sparkles className="w-4 h-4" /> Analyze
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Modal for File Preview */}
      {viewingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setViewingFile(null)}>
              <div className="relative max-w-3xl w-full max-h-[90vh] overflow-auto rounded-lg">
                   <img src={viewingFile} alt="Receipt" className="w-full h-auto rounded-lg" />
                   <button className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md">
                       <X className="w-6 h-6" />
                   </button>
              </div>
          </div>
      )}

      {/* Modal for Category View with Filters */}
      {viewingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewingCategory(null)}>
              <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-slate-200 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-800/50">
                      <div className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-indigo-500" />
                          <h3 className="font-bold text-slate-800 dark:text-white">{viewingCategory} Records</h3>
                      </div>
                      <button onClick={() => setViewingCategory(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-full">
                          <X className="w-5 h-5 text-slate-500" />
                      </button>
                  </div>
                  
                  {/* Category Popup Filters */}
                  <div className="p-3 border-b border-slate-100 dark:border-neutral-800 flex gap-3 overflow-x-auto">
                      <select 
                        value={catPopupYear} 
                        onChange={e => setCatPopupYear(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded px-2 py-1 text-sm outline-none text-slate-700 dark:text-slate-300"
                      >
                          <option value="ALL">All Years</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select 
                        value={catPopupMonth} 
                        onChange={e => setCatPopupMonth(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded px-2 py-1 text-sm outline-none text-slate-700 dark:text-slate-300"
                      >
                          <option value="ALL">All Months</option>
                          {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                      </select>
                  </div>

                  <div className="overflow-y-auto p-0 flex-1">
                      {categoryTransactions.length > 0 ? (
                          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                              {categoryTransactions.map(t => (
                                  <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                      <div className="flex justify-between">
                                          <div>
                                              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{t.description}</p>
                                              <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <span className={`font-semibold text-sm ${type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                  {currencySymbol}{t.amount.toLocaleString('en-IN')}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-8 text-center text-slate-500">No transactions found for selected period.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Main List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800">
        <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
             <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                 <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-slate-400" />
                     <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filters:</span>
                 </div>
                 <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none">
                     <option value="ALL">All Years</option>
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
                 <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none">
                     <option value="ALL">All Months</option>
                     {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                 </select>
                 <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none">
                     <option value="ALL">All Weeks</option>
                     {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
                 </select>
             </div>
             
             {/* Comprehensive Search */}
             <div className="relative w-full lg:w-80">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search Member, Amount, Date..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg outline-none focus:border-blue-500 transition-colors"
                 />
             </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-neutral-800">
                    <tr>
                        <th className="px-6 py-3 whitespace-nowrap">Date</th>
                        {type === TransactionType.INCOME && <th className="px-6 py-3 whitespace-nowrap">Member</th>}
                        <th className="px-6 py-3 whitespace-nowrap">Category</th>
                        <th className="px-6 py-3 min-w-[150px]">Description</th>
                        <th className="px-6 py-3 text-right whitespace-nowrap">Amount</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Receipt</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {filteredList.map(t => {
                        const memberName = members.find(m => m.id === t.memberId)?.name || '-';
                        return (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                {type === TransactionType.INCOME && <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{memberName}</td>}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button 
                                        onClick={() => setViewingCategory(t.category)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity ${getCategoryColor(t.category)}`}
                                    >
                                        {t.category}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.description}</td>
                                <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {currencySymbol}{t.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {t.attachmentUrl ? (
                                        <button onClick={() => setViewingFile(t.attachmentUrl!)} className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded text-blue-500">
                                            <Eye className="w-4 h-4 mx-auto" />
                                        </button>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => setDeleteId(t.id)}
                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 rounded transition-colors"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredList.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No records found matching your filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionSection;