
import React from 'react';
import { ThemeType, ThemeConfig } from '../types';

interface ThemePageProps {
  currentTheme: ThemeType;
  currentCurrency: string;
  onThemeChange: (theme: ThemeType) => void;
  onCurrencyChange: (currency: string) => void;
}

const themes: ThemeConfig[] = [
  { id: 'blue', name: 'Enterprise Blue', primary: 'bg-blue-600', secondary: 'bg-blue-50', accent: 'text-blue-600', sidebar: 'bg-white' },
  { id: 'indigo', name: 'Midnight Indigo', primary: 'bg-indigo-600', secondary: 'bg-indigo-50', accent: 'text-indigo-600', sidebar: 'bg-slate-900' },
  { id: 'emerald', name: 'Emerald Growth', primary: 'bg-emerald-600', secondary: 'bg-emerald-50', accent: 'text-emerald-600', sidebar: 'bg-white' },
  { id: 'crimson', name: 'Crimson Ledger', primary: 'bg-rose-600', secondary: 'bg-rose-50', accent: 'text-rose-600', sidebar: 'bg-slate-900' },
  { id: 'amber', name: 'Amber Gold', primary: 'bg-amber-500', secondary: 'bg-amber-50', accent: 'text-amber-600', sidebar: 'bg-white' },
  { id: 'slate', name: 'Modern Slate', primary: 'bg-slate-900', secondary: 'bg-slate-100', accent: 'text-slate-900', sidebar: 'bg-white' },
];

const currencies = [
  { symbol: 'Rs.', name: 'PKR / INR' },
  { symbol: '$', name: 'USD / CAD / AUD' },
  { symbol: '€', name: 'Euro' },
  { symbol: '£', name: 'GBP' },
  { symbol: '₹', name: 'INR (Modern)' },
  { symbol: 'د.إ', name: 'AED' },
  { symbol: '﷼', name: 'SAR' },
  { symbol: '¥', name: 'JPY / CNY' },
];

const ThemePage: React.FC<ThemePageProps> = ({ currentTheme, currentCurrency, onThemeChange, onCurrencyChange }) => {
  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Appearance</h2>
        <p className="text-slate-500 mt-2 text-lg font-medium leading-relaxed">
          Customize the look and feel of your enterprise ledger. Choose a workspace theme and local currency that fits your operational style.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Workspace Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`group relative text-left bg-white rounded-[48px] border-4 p-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                currentTheme === theme.id ? 'border-blue-500 shadow-xl' : 'border-transparent shadow-sm'
              }`}
            >
              <div className={`rounded-[40px] p-8 ${theme.id === 'slate' ? 'bg-slate-50' : theme.secondary} h-full`}>
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-12 h-12 ${theme.primary} rounded-2xl shadow-lg shadow-black/5 flex items-center justify-center text-white font-bold`}>
                    Aa
                  </div>
                  {currentTheme === theme.id && (
                    <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Active</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{theme.name}</h3>
                <div className="space-y-3 mt-6">
                  <div className="h-4 w-full bg-white rounded-lg shadow-sm"></div>
                  <div className="flex gap-2">
                    <div className={`h-8 w-1/2 ${theme.primary} rounded-xl shadow-md`}></div>
                    <div className="h-8 w-1/2 bg-white rounded-xl shadow-sm"></div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Currency Preference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {currencies.map((curr) => (
            <button
              key={curr.symbol}
              onClick={() => onCurrencyChange(curr.symbol)}
              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-2 group ${
                currentCurrency === curr.symbol 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-2xl font-black ${currentCurrency === curr.symbol ? 'text-blue-600' : 'text-slate-400'}`}>
                {curr.symbol}
              </span>
              <span className="text-[8px] font-black uppercase text-slate-400 text-center tracking-tighter">
                {curr.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="bg-blue-600 p-12 rounded-[56px] text-white flex flex-col md:flex-row items-center gap-10 shadow-xl shadow-blue-100">
         <div className="flex-1 space-y-4">
            <h3 className="text-3xl font-black tracking-tight flex items-center gap-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              Data Sync & Backups
            </h3>
            <p className="text-blue-100 font-medium leading-relaxed">Protect your financial records by setting up automated cloud sync or creating manual manual snapshots. All database management features have been moved to the <b>Sync Center</b> for better accessibility.</p>
         </div>
         <div className="w-full md:w-auto">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('tabChange', { detail: 'sync' }))}
              className="w-full md:w-auto px-10 py-5 bg-white text-blue-600 rounded-[24px] font-black text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              GO TO SYNC CENTER
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
         </div>
      </div>
    </div>
  );
};

export default ThemePage;
