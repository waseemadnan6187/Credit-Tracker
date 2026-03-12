
import React from 'react';
import { Bill, OrderBooker } from '../types';

interface Props {
  bills: Bill[];
  obs: OrderBooker[];
  currency: string;
}

const Summary: React.FC<Props> = ({ bills, obs, currency }) => {
  const summaryData = obs.map(ob => {
    const obBills = bills.filter(b => b.obCode === ob.code);
    const totalSales = obBills.reduce((s, b) => s + b.billAmount, 0);
    const totalBalance = obBills.reduce((s, b) => s + b.balance, 0);
    const totalRecovery = totalSales - totalBalance;
    const recoveryRate = totalSales ? Math.round((totalRecovery / totalSales) * 100) : 0;

    return {
      ...ob,
      totalSales,
      totalBalance,
      totalRecovery,
      recoveryRate
    };
  }).sort((a, b) => b.totalSales - a.totalSales); // Sort by highest sales first

  const grandTotals = summaryData.reduce((acc, curr) => ({
    sales: acc.sales + curr.totalSales,
    recovery: acc.recovery + curr.totalRecovery,
    balance: acc.balance + curr.totalBalance
  }), { sales: 0, recovery: 0, balance: 0 });

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Credit Summary Report - ${new Date().toLocaleDateString()}\n`;
    csvContent += "SR#,Order Booker,OB Code,Credit Amount,Total Recovery,Outstanding Balance,Recovery %\n";
    summaryData.forEach((d, idx) => {
      csvContent += `${idx + 1},"${d.name}",${d.code},${d.totalSales},${d.totalRecovery},${d.totalBalance},${d.recoveryRate}%\n`;
    });
    csvContent += `\nTOTALS,,,${grandTotals.sales},${grandTotals.recovery},${grandTotals.balance}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Credit_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Date and Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Report</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Credit Summary</h2>
          <div className="mt-2 flex items-center gap-2 text-slate-500 font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
            <span className="text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex gap-3 print:hidden">
            <button onClick={exportCSV} className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
            </button>
            <button onClick={() => window.print()} className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Report
            </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-6 text-center">SR#</th>
                <th className="px-8 py-6">Order Booker Name</th>
                <th className="px-8 py-6 text-right">Credit Amount</th>
                <th className="px-8 py-6 text-right">Recovery</th>
                <th className="px-8 py-6 text-right">Balance</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {summaryData.map((data, idx) => (
                <tr key={data.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-center text-xs font-black text-slate-300">
                    {idx + 1}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900">{data.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.code}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xl font-black text-blue-600">
                      {currency} {data.totalSales.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-lg font-bold text-emerald-600">
                      {currency} {data.totalRecovery.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xl font-black text-rose-600">
                      {currency} {data.totalBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${data.recoveryRate >= 75 ? 'bg-emerald-100 text-emerald-700' : data.recoveryRate >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {data.recoveryRate}%
                      </span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${data.recoveryRate >= 75 ? 'bg-emerald-500' : data.recoveryRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${data.recoveryRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {summaryData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                    No billing data found to generate summary.
                  </td>
                </tr>
              )}
            </tbody>
            {summaryData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-slate-900 border-t-2 border-slate-900">
                  <td colSpan={2} className="px-8 py-6 text-sm font-black uppercase tracking-widest">
                    Grand Totals
                  </td>
                  <td className="px-8 py-6 text-right text-2xl font-black">
                    {currency} {grandTotals.sales.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right text-xl font-bold text-emerald-400 print:text-emerald-700">
                    {currency} {grandTotals.recovery.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right text-2xl font-black text-rose-400 print:text-rose-700">
                    {currency} {grandTotals.balance.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-xs font-black opacity-50 uppercase tracking-tighter">
                      {grandTotals.sales ? Math.round((grandTotals.recovery / grandTotals.sales) * 100) : 0}% OVERALL
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* Footer Info (Hidden on Print) */}
      <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex items-start gap-4 print:hidden">
        <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">System Notice</h4>
          <p className="text-blue-700 text-sm mt-0.5 leading-relaxed">
            This report summarizes lifetime data. To see specific daily performance, please use the <b>Today's Activity</b> tab from the sidebar. Highlighting indicates recovery efficiency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summary;
