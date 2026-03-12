
import React, { useState } from 'react';
import { Bill, Recovery } from '../types';

interface LedgerProps {
  bills: Bill[];
  recoveries: Recovery[];
  currency: string;
  onEditBill?: (bill: Bill) => void;
  onDeleteBill?: (id: string) => void;
  onEditRecovery?: (rec: Recovery) => void;
  onDeleteRecovery?: (id: string) => void;
}

const Ledger: React.FC<LedgerProps> = ({ 
  bills, 
  recoveries, 
  currency,
  onEditBill, 
  onDeleteBill, 
  onEditRecovery, 
  onDeleteRecovery 
}) => {
  const [view, setView] = useState<'bills' | 'recoveries'>('bills');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBills = bills.filter(b => b.shopName.toLowerCase().includes(searchTerm.toLowerCase()) || b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRecoveries = recoveries.filter(r => r.billNumber.toLowerCase().includes(searchTerm.toLowerCase()));

  // Group bills by OB Code
  const billsByOB = filteredBills.reduce((acc, bill) => {
    const ob = bill.obCode || 'UNASSIGNED';
    if (!acc[ob]) acc[ob] = [];
    acc[ob].push(bill);
    return acc;
  }, {} as Record<string, Bill[]>);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (view === 'bills') {
      csvContent += "Date,Bill #,Customer,OB Code,Amount,Balance\n";
      filteredBills.forEach(b => {
        csvContent += `${b.date},${b.billNumber},"${b.shopName}",${b.obCode},${b.billAmount},${b.balance}\n`;
      });
    } else {
      csvContent += "Recovery Date,Bill #,Bill Date,Amount,Remaining\n";
      filteredRecoveries.forEach(r => {
        csvContent += `${r.recoveryDate},${r.billNumber},${r.billDate},${r.recoveryAmount},${r.remainingAmount}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${view}_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn print:m-0">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Transaction Ledger</h2>
            <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-xl w-fit">
              <TabBtn active={view === 'bills'} onClick={() => setView('bills')} label="Bills (By OB)" />
              <TabBtn active={view === 'recoveries'} onClick={() => setView('recoveries')} label="Recovery History" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3">
            <input 
              type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={exportCSV} className="flex-grow md:flex-initial px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
              <button onClick={() => window.print()} className="flex-grow md:flex-initial px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block p-8 border-b border-slate-200">
           <h2 className="text-3xl font-black">{view === 'bills' ? 'Billing Ledger' : 'Recovery Ledger'}</h2>
           <p className="text-slate-500">Statement Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          {view === 'bills' ? (
            <div className="divide-y divide-slate-100">
              {(Object.entries(billsByOB) as [string, Bill[]][]).map(([obCode, obBills]) => (
                <div key={obCode} className="pb-4">
                  <div className="bg-slate-50 px-6 py-3 border-y border-slate-100 flex justify-between items-center print:bg-slate-200">
                    <span className="text-xs font-black text-slate-600 tracking-tighter uppercase">Order Booker: {obCode}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{obBills.length} BILLS</span>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase font-bold">
                        <th className="px-6 py-3">Bill</th>
                        <th className="px-6 py-3">Shop</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-right">Bal</th>
                        <th className="px-6 py-3 text-center print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obBills.map(bill => (
                        <tr key={bill.id} className="text-sm hover:bg-slate-50 group border-b border-slate-50">
                          <td className="px-6 py-3 font-bold">{bill.billNumber}</td>
                          <td className="px-6 py-3">{bill.shopName}</td>
                          <td className="px-6 py-3 text-right font-medium text-slate-600">{currency} {bill.billAmount.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right font-black text-rose-600">{currency} {bill.balance.toLocaleString()}</td>
                          <td className="px-6 py-3 text-center print:hidden">
                             <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditBill?.(bill)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => onDeleteBill?.(bill.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase print:bg-slate-200">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Bill #</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Remaining</th>
                  <th className="px-6 py-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecoveries.map(rec => (
                  <tr key={rec.id} className="text-sm hover:bg-slate-50 group border-b border-slate-50">
                    <td className="px-6 py-4">{rec.recoveryDate}</td>
                    <td className="px-6 py-4 font-bold">{rec.billNumber}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">+{currency} {rec.recoveryAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{currency} {rec.remainingAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center print:hidden">
                       <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEditRecovery?.(rec)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => onDeleteRecovery?.(rec.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
    {label}
  </button>
);

export default Ledger;
