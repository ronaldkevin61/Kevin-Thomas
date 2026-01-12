import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { FileText, Calendar, Filter, Eye, X, List, LayoutGrid, Grid } from 'lucide-react';

interface FileManagerProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const FileManager: React.FC<FileManagerProps> = ({ transactions, currencySymbol }) => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  
  // View Mode State: 'TITLE' (List), 'SMALL' (Small Icons), 'MEDIUM' (Medium Icons)
  const [viewMode, setViewMode] = useState<'TITLE' | 'SMALL' | 'MEDIUM'>('MEDIUM');

  // Filter transactions that have attachments
  const files = useMemo(() => {
    let filtered = transactions.filter(t => t.attachmentUrl);

    if (selectedYear !== 'ALL') {
      filtered = filtered.filter(t => new Date(t.date).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth !== 'ALL') {
      filtered = filtered.filter(t => new Date(t.date).getMonth().toString() === selectedMonth);
    }
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedMonth, selectedType]);

  const years = useMemo(() => {
      const startYear = 2020;
      const endYear = 2050;
      const range = [];
      for (let i = endYear; i >= startYear; i--) {
          range.push(i);
      }
      return range;
  }, []);

  const months = [
      {val: '0', label: 'January'}, {val: '1', label: 'February'}, {val: '2', label: 'March'}, 
      {val: '3', label: 'April'}, {val: '4', label: 'May'}, {val: '5', label: 'June'},
      {val: '6', label: 'July'}, {val: '7', label: 'August'}, {val: '8', label: 'September'},
      {val: '9', label: 'October'}, {val: '10', label: 'November'}, {val: '11', label: 'December'}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">File Manager</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage receipts, bills, and documents.</p>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('TITLE')}
                className={`p-2 rounded-md transition-all ${viewMode === 'TITLE' ? 'bg-white dark:bg-neutral-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="Title View"
            >
                <List className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode('SMALL')}
                className={`p-2 rounded-md transition-all ${viewMode === 'SMALL' ? 'bg-white dark:bg-neutral-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="Small Icon View"
            >
                <Grid className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode('MEDIUM')}
                className={`p-2 rounded-md transition-all ${viewMode === 'MEDIUM' ? 'bg-white dark:bg-neutral-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="Medium Icon View"
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 p-4">
        <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 mr-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filters:</span>
            </div>
            
            <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
                <option value="ALL">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
                <option value="ALL">All Months</option>
                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>

            <select 
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
                className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
                <option value="ALL">All Types</option>
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
            </select>
        </div>
      </div>

      {/* Render based on viewMode */}
      {viewMode === 'TITLE' ? (
        // List View
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-neutral-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-4 py-3 w-12"></th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                    {files.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50">
                            <td className="px-4 py-3 text-center">
                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto overflow-hidden">
                                     {file.attachmentUrl?.startsWith('data:image') ? (
                                        <img src={file.attachmentUrl} className="w-full h-full object-cover" />
                                     ) : (
                                        <FileText className="w-4 h-4 text-slate-500" />
                                     )}
                                </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{file.description || 'No Description'}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(file.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
                                    {file.category}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">{currencySymbol}{file.amount}</td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => setViewingFile(file.attachmentUrl!)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        // Grid Views (Small or Medium)
        <div className={`grid gap-4 ${
            viewMode === 'SMALL' 
                ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
            {files.map(file => (
            <div key={file.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow group">
                <div className={`${viewMode === 'SMALL' ? 'h-24' : 'h-40'} bg-slate-100 dark:bg-neutral-800 relative flex items-center justify-center overflow-hidden`}>
                    {file.attachmentUrl?.startsWith('data:image') ? (
                        <img src={file.attachmentUrl} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                        <FileText className={`${viewMode === 'SMALL' ? 'w-8 h-8' : 'w-12 h-12'} text-slate-400 dark:text-slate-600`} />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => setViewingFile(file.attachmentUrl!)} className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="p-3">
                    {viewMode === 'SMALL' ? (
                         // Compact content for Small View
                         <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate mb-0.5">{file.description || file.category}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(file.date).toLocaleDateString()}</p>
                         </div>
                    ) : (
                         // Full content for Medium View
                         <>
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate pr-2">{file.description || file.category}</p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{currencySymbol}{file.amount}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(file.date).toLocaleDateString()}
                            </div>
                            <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700">
                                {file.category}
                            </div>
                         </>
                    )}
                </div>
            </div>
            ))}
        </div>
      )}
      
      {files.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800">
              <div className="bg-slate-50 dark:bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-medium">No files found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload receipts when adding transactions.</p>
          </div>
      )}

      {/* Modal for File Preview */}
      {viewingFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setViewingFile(null)}>
              <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                   <img src={viewingFile} alt="Receipt" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                   <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md">
                       <X className="w-6 h-6" />
                   </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default FileManager;