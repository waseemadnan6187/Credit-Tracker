
import React, { useState, useMemo } from 'react';
import { Bill, Recovery, Customer } from '../types';

interface Props {
  bills: Bill[];
  recoveries: Recovery[];
  customers: Customer[];
  currency: string;
}

const CustomerLedger: React.FC<Props> = ({ bills, recoveries, customers, currency }) => {
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCustomer = customers.find(c => c.code === selectedCustomerCode);

  const ledgerEntries = useMemo(() => {
    if (!selectedCustomerCode) return [];

    const customerBills = bills.filter(b => b.customerCode === selectedCustomerCode);
    const customerRecoveries = recoveries.filter(r => {
      const linkedBill = bills.find(b => b.billNumber === r.billNumber);
      return linkedBill?.customerCode === selectedCustomerCode;
    });

    const combined = [
      ...customerBills.map(b => ({
        id: b.id,
        date: b.date,
        type: 'BILL',
        billNumber: b.billNumber,
        details: `Credit Bill (${b.billType})`,
        debit: b.billAmount,
        credit: 0,
      })),
      ...customerRecoveries.map(r => ({
        id: r.id,
        date: r.recoveryDate,
        type: 'RECOVERY',
        billNumber: r.billNumber,
        details: `Recovery Payment (${r.type})`,
        debit: 0,
        credit: r.recoveryAmount,
      }))
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomerCode, bills, recoveries]);

  const filteredEntries = ledgerEntries.filter(e => 
    e.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const debit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
    const credit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
    return { debit, credit, balance: debit - credit };
  }, [ledgerEntries]);

  const exportCSV = () => {
    if (!selectedCustomer) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Shop: ${selectedCustomer.name} (${selectedCustomer.code})\n`;
    csvContent += "Date,Type,Bill #,Details,Debit,Credit\n";
    filteredEntries.forEach(e => {
      csvContent += `${e.date},${e.type},${e.billNumber},"${e.details}",${e.debit},${e.credit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customer_Ledger_${selectedCustomer.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Customer Ledger</h2>
          <p className="text-slate-500 mt-1">Full statement of accounts for individual shops.</p>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <select 
                className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm min-w-[250px]"
                value={selectedCustomerCode}
                onChange={e => setSelectedCustomerCode(e.target.value)}
            >
                <option value="">-- Select Customer Shop --</option>
                {customers.map(c => (
                    <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                ))}
            </select>
            <input 
                type="text"
                placeholder="Search history..."
                className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-medium text-slate-600 focus:border-blue-500 focus:outline-none shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {selectedCustomerCode && (
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
            <button onClick={() => window.print()} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Ledger
            </button>
          </div>
        )}
      </div>

      {!selectedCustomerCode ? (
        <div className="bg-white p-20 rounded-[40px] border border-slate-100 flex flex-col items-center text-center opacity-40 print:hidden">
            <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-2xl font-bold">Select a Shop to view Statement</h3>
            <p>View all billing cycles and recovery history in one place.</p>
        </div>
      ) : (
        <>
            {selectedCustomer && (
                <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100 mb-8 print:bg-white print:text-black print:border-b-4 print:border-slate-900 print:rounded-none print:shadow-none print:px-0">
                    <div>
                        <h3 className="text-4xl font-black tracking-tight print:text-5xl">{selectedCustomer.name}</h3>
                        <p className="text-blue-200 font-bold mt-1 uppercase tracking-widest text-sm print:text-slate-600">{selectedCustomer.code} | {selectedCustomer.address}</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1 print:text-slate-400">Assigned Order Booker</p>
                        <span className="bg-white/20 px-4 py-2 rounded-xl font-bold text-lg print:bg-slate-100 print:text-slate-900">{selectedCustomer.obCode || 'UNASSIGNED'}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Credit Purchases</p>
                    <h4 className="text-3xl font-black text-slate-900">{currency} {stats.debit.toLocaleString()}</h4>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Payments Made</p>
                    <h4 className="text-3xl font-black text-emerald-600">{currency} {stats.credit.toLocaleString()}</h4>
                </div>
                <div className="bg-rose-600 p-8 rounded-[40px] shadow-xl shadow-rose-100 relative overflow-hidden text-white print:bg-slate-100 print:text-slate-900 print:shadow-none">
                    <p className="text-xs font-black text-rose-200 uppercase tracking-widest mb-2 print:text-slate-500">Current Shop Balance</p>
                    <h4 className="text-3xl font-black">{currency} {stats.balance.toLocaleString()}</h4>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 print:bg-white print:px-0">
                    <h3 className="font-black text-slate-900 text-lg">Account Statement</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest print:bg-slate-200">
                            <tr>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Bill #</th>
                                <th className="px-8 py-6">Description</th>
                                <th className="px-8 py-6 text-right">Debit ({currency})</th>
                                <th className="px-8 py-6 text-right">Credit ({currency})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEntries.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6 text-sm font-medium text-slate-500">{entry.date}</td>
                                    <td className="px-8 py-6 font-black text-slate-900">{entry.billNumber}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm">{entry.details}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${entry.type === 'BILL' ? 'text-blue-500' : 'text-emerald-500'}`}>{entry.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {entry.debit > 0 ? <span className="text-lg font-black text-blue-600">{currency} {entry.debit.toLocaleString()}</span> : <span className="text-slate-200">--</span>}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {entry.credit > 0 ? <span className="text-lg font-black text-emerald-600">{currency} {entry.credit.toLocaleString()}</span> : <span className="text-slate-200">--</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default CustomerLedger;
