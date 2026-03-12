
import React from 'react';
import { Bill, Recovery, OrderBooker } from '../types';

interface Props {
  bills: Bill[];
  recoveries: Recovery[];
  obs: OrderBooker[];
  currency: string;
}

const TodayReport: React.FC<Props> = ({ bills, recoveries, obs, currency }) => {
  const today = new Date().toISOString().split('T')[0];

  // Filter today's data
  const todayBills = bills.filter(b => b.date === today);
  const todayRecoveries = recoveries.filter(r => r.recoveryDate === today);

  // Group by OB
  const obStats = obs.map(ob => {
    const obTodayBills = todayBills.filter(b => b.obCode === ob.code);
    const obTodayRecoveries = todayRecoveries.filter(r => {
      // Find the bill associated with this recovery to get the OB Code
      const linkedBill = bills.find(b => b.billNumber === r.billNumber);
      return linkedBill?.obCode === ob.code;
    });

    const totalCredit = obTodayBills.reduce((sum, b) => sum + b.billAmount, 0);
    const totalRecovery = obTodayRecoveries.reduce((sum, r) => sum + r.recoveryAmount, 0);

    return {
      ...ob,
      totalCredit,
      totalRecovery,
      billCount: obTodayBills.length,
      recCount: obTodayRecoveries.length
    };
  }).filter(stat => stat.totalCredit > 0 || stat.totalRecovery > 0); // Only show active OBs for today

  const grandTotalCredit = obStats.reduce((sum, s) => sum + s.totalCredit, 0);
  const grandTotalRecovery = obStats.reduce((sum, s) => sum + s.totalRecovery, 0);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Daily Closing Report - ${new Date().toLocaleDateString()}\n`;
    csvContent += "OB Code,Order Booker,Bills Count,Rec Count,Credit Amount,Recovery Amount,Net Flow\n";
    obStats.forEach(s => {
      const net = s.totalRecovery - s.totalCredit;
      csvContent += `${s.code},${s.name},${s.billCount},${s.recCount},${s.totalCredit},${s.totalRecovery},${net}\n`;
    });
    csvContent += `\nGRAND TOTALS,,,,${grandTotalCredit},${grandTotalRecovery},${grandTotalRecovery - grandTotalCredit}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Activity_Report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Today's Activity</h2>
          <p className="text-slate-500 mt-1">Daily credit vs recovery performance by Order Booker.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 print:hidden">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-blue-200 flex justify-between items-center">
            <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Credit (Today)</p>
                <h4 className="text-4xl font-black mt-1">{currency} {grandTotalCredit.toLocaleString()}</h4>
            </div>
            <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <div className="bg-emerald-600 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-200 flex justify-between items-center">
            <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Total Recovery (Today)</p>
                <h4 className="text-4xl font-black mt-1">{currency} {grandTotalRecovery.toLocaleString()}</h4>
            </div>
            <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <th className="px-8 py-6">Order Booker</th>
              <th className="px-8 py-6 text-center">Activity</th>
              <th className="px-8 py-6 text-right">Credit (Bills)</th>
              <th className="px-8 py-6 text-right">Recovery</th>
              <th className="px-8 py-6 text-right">Net Flow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {obStats.map(stat => {
              const net = stat.totalRecovery - stat.totalCredit;
              return (
                <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                            {stat.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900">{stat.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.code}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">{stat.billCount} BILLS</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">{stat.recCount} RECS</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-lg font-bold text-blue-600">{currency} {stat.totalCredit.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-lg font-bold text-emerald-600">{currency} {stat.totalRecovery.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {net >= 0 ? '+' : '-'}{currency} {Math.abs(net).toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
            {obStats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-lg font-bold">No transactions recorded today.</p>
                        <p className="text-sm">Start by adding a new bill or posting a recovery.</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 print:bg-white print:text-slate-900 print:border-4 print:border-slate-900 print:rounded-none">
        <div className="text-center md:text-left">
            <h4 className="text-xl font-black">Daily Performance Metric</h4>
            <p className="text-slate-400 text-sm mt-1 print:text-slate-500">Today's recovery covers {grandTotalCredit > 0 ? Math.round((grandTotalRecovery / grandTotalCredit) * 100) : 0}% of today's new billing.</p>
        </div>
        <div className="flex gap-4 print:hidden">
            <button onClick={exportCSV} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/5 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Export CSV
            </button>
            <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Daily Report
            </button>
        </div>
      </div>
    </div>
  );
};

export default TodayReport;
