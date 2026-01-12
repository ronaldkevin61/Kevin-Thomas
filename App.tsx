
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon, 
  Menu, 
  Church,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  FileBarChart,
  LogOut,
  FolderOpen,
  PieChart
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionSection from './components/TransactionSection';
import Members from './components/Members';
import AiFinancialAdvisor from './components/AiFinancialAdvisor';
import Settings from './components/Settings';
import Reports from './components/Reports';
import FileManager from './components/FileManager';
import Budgets from './components/Budgets';
import Login from './components/Login';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './constants';
import { Member, Transaction, TransactionType, AppSettings, User, Budget } from './types';

enum View {
  DASHBOARD = 'DASHBOARD',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  MEMBERS = 'MEMBERS',
  REPORTS = 'REPORTS',
  AI_ADVISOR = 'AI_ADVISOR',
  FILE_MANAGER = 'FILE_MANAGER',
  BUDGETS = 'BUDGETS',
  SETTINGS = 'SETTINGS',
}

const App = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // App State
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  
  const [settings, setSettings] = useState<AppSettings>({
    churchName: 'Ecclesia Church',
    currency: 'INR',
    currencySymbol: '₹',
    darkMode: false,
    administratorName: 'Rev. Pastor',
    email: 'admin@church.org'
  });

  const handleLogin = (username: string) => {
    setUser({ username, isAuthenticated: true });
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [transaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddMember = (newMember: Omit<Member, 'id'>) => {
    const member: Member = {
      ...newMember,
      id: Math.random().toString(36).substr(2, 9),
    };
    setMembers(prev => [...prev, member]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budget: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBudgets(prev => [...prev, budget]);
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  if (!user?.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen flex ${settings.darkMode ? 'dark' : ''} bg-white dark:bg-black transition-colors duration-200`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } print:hidden`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none overflow-hidden shrink-0">
             <Church className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">Church</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Financial Book</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 mt-4">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <div className="pt-2 pb-1 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transactions</div>
          <NavItem view={View.INCOME} icon={TrendingUp} label="Income & Offering" />
          <NavItem view={View.EXPENSE} icon={TrendingDown} label="Expense & Payment" />
          
          <div className="pt-4 pb-1 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Management</div>
          <NavItem view={View.BUDGETS} icon={PieChart} label="Budgets" />
          <NavItem view={View.MEMBERS} icon={Users} label="Members" />
          <NavItem view={View.FILE_MANAGER} icon={FolderOpen} label="File Manager" />
          <NavItem view={View.REPORTS} icon={FileBarChart} label="Reports" />
          
          <div className="pt-4 pb-1 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tools</div>
          <NavItem view={View.AI_ADVISOR} icon={BrainCircuit} label="AI Advisor" />
          <NavItem view={View.SETTINGS} icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-neutral-800">
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 h-16 flex items-center justify-between px-4 lg:px-8 print:hidden shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg overflow-hidden lg:hidden">
                    <Church className="w-6 h-6 text-blue-600" />
                 </div>
                 <h2 className="text-xl font-semibold text-slate-800 dark:text-white truncate">
                  {settings.churchName}
                 </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{settings.administratorName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.username}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-neutral-700 border-2 border-white dark:border-neutral-600 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold uppercase overflow-hidden">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    user.username.charAt(0)
                )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            {currentView === View.DASHBOARD && <Dashboard transactions={transactions} currencySymbol={settings.currencySymbol} />}
            {currentView === View.INCOME && (
              <TransactionSection 
                type={TransactionType.INCOME} 
                transactions={transactions} 
                members={members} 
                budgets={budgets}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onAddMember={handleAddMember}
                currencySymbol={settings.currencySymbol}
              />
            )}
            {currentView === View.EXPENSE && (
              <TransactionSection 
                type={TransactionType.EXPENSE} 
                transactions={transactions} 
                members={members} 
                budgets={budgets}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                currencySymbol={settings.currencySymbol}
              />
            )}
            {currentView === View.BUDGETS && (
              <Budgets
                budgets={budgets}
                transactions={transactions}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
                currencySymbol={settings.currencySymbol}
              />
            )}
            {currentView === View.MEMBERS && (
              <Members 
                members={members} 
                onAddMember={handleAddMember} 
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                transactions={transactions} 
              />
            )}
            {currentView === View.FILE_MANAGER && <FileManager transactions={transactions} currencySymbol={settings.currencySymbol} />}
            {currentView === View.AI_ADVISOR && <AiFinancialAdvisor transactions={transactions} members={members} />}
            {currentView === View.SETTINGS && <Settings settings={settings} onUpdateSettings={setSettings} />}
            {currentView === View.REPORTS && <Reports transactions={transactions} churchName={settings.churchName} currencySymbol={settings.currencySymbol} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
