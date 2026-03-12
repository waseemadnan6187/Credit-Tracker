
import React from 'react';
import { Bill, Recovery, User } from '../types';

interface UserDashboardProps {
  user: User;
  bills: Bill[];
  recoveries: Recovery[];
  currency: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, bills, recoveries, currency }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date === today);
  const todayRecoveries = recoveries.filter(r => r.recoveryDate === today);

  const totalTodayBilling = todayBills.reduce((sum, b) => sum + b.billAmount, 0);
  const totalTodayRecovery = todayRecoveries.reduce((sum, r) => sum + r.recoveryAmount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Hello, {user.name}!</h2>
          <p className="text-slate-500 mt-2 font-medium">Ready to process today's billing and payments?</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged In As</p>
              <span className="text-blue-600 font-bold">{user.role} Account</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Today's New Billing</h3>
          </div>
          <h4 className="text-5xl font-black">{currency} {totalTodayBilling.toLocaleString()}</h4>
          <p className="mt-4 text-blue-100 font-medium">Processed {todayBills.length} invoices today</p>
        </div>

        <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Today's Recoveries</h3>
          </div>
          <h4 className="text-5xl font-black">{currency} {totalTodayRecovery.toLocaleString()}</h4>
          <p className="mt-4 text-emerald-100 font-medium">Collected {todayRecoveries.length} payments today</p>
        </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-3xl font-black tracking-tight">Quick Actions</h3>
          <p className="text-slate-400 max-w-md">Use the sidebar or the buttons below to quickly manage your shop transactions for the current session.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button className="flex-1 px-8 py-5 bg-blue-600 rounded-3xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95">NEW BILL</button>
          <button className="flex-1 px-8 py-5 bg-white text-slate-900 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all active:scale-95">RECOVERY POS</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
