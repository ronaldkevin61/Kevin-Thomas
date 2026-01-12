import React, { useState } from 'react';
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory, PaymentMethod, Member } from '../types';
import { PlusCircle, Save } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  members: Member[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, members }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.INCOME);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [memberId, setMemberId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAddTransaction({
      date,
      amount: parseFloat(amount),
      type: activeTab,
      category: category as IncomeCategory | ExpenseCategory,
      description,
      paymentMethod,
      memberId: activeTab === TransactionType.INCOME && memberId ? memberId : undefined,
    });

    // Reset basics
    setAmount('');
    setDescription('');
    setCategory('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div className="flex border-b border-slate-200">
        <button
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === TransactionType.INCOME 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => { setActiveTab(TransactionType.INCOME); setCategory(''); }}
        >
          Received (Income)
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            activeTab === TransactionType.EXPENSE 
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => { setActiveTab(TransactionType.EXPENSE); setCategory(''); }}
        >
          Paid (Expense)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              required
              min="0"
              step="1"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {activeTab === TransactionType.INCOME 
                ? Object.values(IncomeCategory).map(c => <option key={c} value={c}>{c}</option>)
                : Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {activeTab === TransactionType.INCOME && (
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Member (Optional - For Tithe/Offering)</label>
             <select
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
               value={memberId}
               onChange={(e) => setMemberId(e.target.value)}
             >
               <option value="">Guest / Anonymous</option>
               {members.map(m => (
                 <option key={m.id} value={m.id}>{m.name} ({m.mobile})</option>
               ))}
             </select>
           </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder={activeTab === TransactionType.INCOME ? "e.g., Sunday Service Tithe" : "e.g., Office Supplies"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors ${
            activeTab === TransactionType.INCOME ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Save className="w-5 h-5" />
          Record {activeTab === TransactionType.INCOME ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
