
import React, { useState, useMemo } from 'react';
import { Member, Transaction, TransactionType } from '../types';
import { Phone, Mail, Plus, Search, LayoutGrid, List, X, IndianRupee, History, User, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../constants';

interface MembersProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  transactions?: Transaction[];
}

const Members: React.FC<MembersProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember, transactions = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.mobile.includes(searchTerm)
  );

  const openAddModal = () => {
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setMobile('');
      setEmail('');
      setIsModalOpen(true);
  };

  const openEditModal = (member: Member, e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditingId(member.id);
      setName(member.name);
      setMobile(member.mobile);
      setEmail(member.email || '');
      setIsModalOpen(true);
  };

  const handleDeleteClick = (member: Member, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteId(member.id);
  };

  const confirmDelete = () => {
      if (deleteId) {
          onDeleteMember(deleteId);
          if (selectedMember && selectedMember.id === deleteId) {
              setSelectedMember(null);
          }
          setDeleteId(null);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name && mobile) {
        if (isEditing && editingId) {
            onUpdateMember({ id: editingId, name, mobile, email });
        } else {
            onAddMember({ name, mobile, email });
        }
        
        setName('');
        setMobile('');
        setEmail('');
        setIsModalOpen(false);
        setEditingId(null);
    }
  };

  const memberTransactions = useMemo(() => {
    if (!selectedMember) return [];
    return transactions
        .filter(t => t.memberId === selectedMember.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMember]);

  const memberStats = useMemo(() => {
    return memberTransactions.reduce((acc, t) => {
        if (t.type === TransactionType.INCOME) return acc + t.amount;
        return acc;
    }, 0);
  }, [memberTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Church Directory</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-200 dark:border-neutral-700">
                {members.length} Members
            </span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                    placeholder="Search name or mobile..."
                    className="w-full pl-9 pr-4 py-2 border dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex border dark:border-neutral-700 rounded-lg overflow-hidden shrink-0">
                <button onClick={() => setViewMode('GRID')} className={`p-2 ${viewMode === 'GRID' ? 'bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-neutral-900 text-slate-500 dark:text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('LIST')} className={`p-2 ${viewMode === 'LIST' ? 'bg-slate-100 dark:bg-neutral-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-neutral-900 text-slate-500 dark:text-slate-400'}`}><List className="w-4 h-4" /></button>
            </div>
            <button 
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in border border-slate-200 dark:border-neutral-800">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delete Member?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Are you sure you want to delete this member? Their past transactions will remain but will be unlinked.
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

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
              <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-0 animate-bounce-in border border-slate-200 dark:border-neutral-800 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900">
                      <div>
                          <h3 className="font-bold text-xl text-slate-800 dark:text-white">{isEditing ? 'Edit Member' : 'New Member'}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isEditing ? 'Update details' : 'Add to church directory'}</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-full text-slate-500">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                      <div className="flex justify-center mb-2">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                              <User className="w-8 h-8" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                          <input placeholder="e.g. John Doe" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Mobile Number</label>
                          <input placeholder="+91 99999 00000" required value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                          <input placeholder="Optional" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      
                      <div className="pt-4">
                        <button type="submit" className="w-full px-4 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-sm transition-transform active:scale-[0.98]">
                            {isEditing ? 'Update Member' : 'Save Member'}
                        </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMember(null)} />
              <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-bounce-in border border-slate-200 dark:border-neutral-800">
                   <div className="p-6 bg-slate-50 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-start">
                       <div className="flex gap-4 items-center">
                           <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold shrink-0">
                                {selectedMember.name.charAt(0)}
                           </div>
                           <div>
                               <div className="flex items-center gap-2">
                                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedMember.name}</h2>
                                   <button 
                                        onClick={(e) => {
                                            setSelectedMember(null);
                                            openEditModal(selectedMember, e);
                                        }} 
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded text-slate-500"
                                        title="Edit Member"
                                    >
                                       <Edit className="w-4 h-4" />
                                   </button>
                               </div>
                               <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400 mt-1">
                                   <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedMember.mobile}</div>
                                   {selectedMember.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {selectedMember.email}</div>}
                               </div>
                           </div>
                       </div>
                       <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-full text-slate-500">
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   
                   <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-neutral-800">
                       <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                           <p className="text-sm font-semibold text-green-700 dark:text-green-300">Total Contributed</p>
                           <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">{formatCurrency(memberStats)}</p>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                           <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Records Found</p>
                           <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">{memberTransactions.length}</p>
                       </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-0">
                       <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 sticky top-0 border-b dark:border-neutral-800">
                           <h4 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><History className="w-4 h-4" /> Transaction History</h4>
                       </div>
                       {memberTransactions.length > 0 ? (
                           <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                               {memberTransactions.map(t => (
                                   <div key={t.id} className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 flex justify-between items-center">
                                       <div>
                                           <p className="font-medium text-slate-800 dark:text-slate-200">{t.category}</p>
                                           <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString() • {t.description}</p>
                                       </div>
                                       <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(t.amount)}</span>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="p-8 text-center text-slate-500">No transactions recorded.</div>
                       )}
                   </div>
              </div>
          </div>
      )}

      {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <div 
                key={member.id} 
                onClick={() => setSelectedMember(member)}
                className="relative bg-[#fdfbf7] dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all cursor-pointer group"
              >
                {/* Action Buttons on Grid Card */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => openEditModal(member, e)}
                        className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-sm text-slate-500 hover:text-indigo-600 border border-slate-100 dark:border-neutral-700"
                        title="Edit"
                    >
                        <Edit className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={(e) => handleDeleteClick(member, e)}
                        className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-sm text-slate-500 hover:text-red-600 border border-slate-100 dark:border-neutral-700"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{member.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 truncate">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="truncate">{member.mobile}</span>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-neutral-800">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Mobile</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {filteredMembers.map(m => (
                            <tr 
                                key={m.id} 
                                onClick={() => setSelectedMember(m)}
                                className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{m.name}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{m.mobile}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{m.email || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={(e) => openEditModal(m, e)} 
                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteClick(m, e)} 
                                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default Members;
