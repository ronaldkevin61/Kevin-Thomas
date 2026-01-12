
import React, { useRef } from 'react';
import { AppSettings } from '../types';
import { Moon, Sun, Church, CreditCard, User, Mail, Upload, Image as ImageIcon } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // For checkboxes, e.target is HTMLInputElement
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'currencyCode') {
        const selected = CURRENCIES.find(c => c.code === value);
        if (selected) {
            onUpdateSettings({
                ...settings,
                currency: selected.code,
                currencySymbol: selected.symbol
            });
        }
    } else {
        onUpdateSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateSettings({
                  ...settings,
                  logoUrl: reader.result as string
              });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your church application preferences and configuration.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar / Navigation for Settings (Visual only for now) */}
            <div className="space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm flex items-center gap-3">
                    <Church className="w-4 h-4" /> General
                </div>
                {/* Placeholder items to show structure */}
                <div className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-lg font-medium text-sm flex items-center gap-3 cursor-not-allowed opacity-50">
                    <CreditCard className="w-4 h-4" /> Billing (Coming Soon)
                </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Branding Section */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Church Branding</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look and feel of your financial book.</p>
                    </div>
                    <div className="p-6 space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Church Logo</label>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-800 relative group shrink-0">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto sm:mx-0"
                                    >
                                        <Upload className="w-4 h-4" /> Upload New Logo
                                    </button>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Recommended: 200x200px (PNG/JPG)</p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Church Name</label>
                            <div className="relative">
                                <Church className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input name="churchName" value={settings.churchName} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Regional Preferences</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Set your currency and formatting.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                            <select 
                                name="currencyCode" 
                                value={settings.currency} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Symbol</label>
                            <input name="currencySymbol" value={settings.currencySymbol} readOnly className="w-full px-3 py-2 bg-slate-100 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                {/* Admin Profile */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Administrator Profile</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Contact details for reports and emails.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Administrator Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input name="administratorName" value={settings.administratorName} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input name="email" value={settings.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Theme */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Appearance</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes.</p>
                        </div>
                        <button 
                            onClick={() => onUpdateSettings({...settings, darkMode: !settings.darkMode})}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${settings.darkMode ? 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                        >
                            {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            <span className="font-medium text-sm">{settings.darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Settings;
