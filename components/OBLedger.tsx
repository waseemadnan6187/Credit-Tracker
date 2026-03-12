
import React, { useState, useMemo } from 'react';
import { Bill, Recovery, OrderBooker } from '../types';

interface Props {
  bills: Bill[];
  recoveries: Recovery[];
  obs: OrderBooker[];
  currency: string;
}

type ViewMode = 'bills' | 'transactions';

const OBLedger: React.FC<Props> = ({ bills, recoveries, obs, currency }) => {
  const [selectedOBCode, setSelectedOBCode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('bills');

  const selectedOB = obs.find(ob => ob.code === selectedOBCode);

  // Grouping logic for "Statement View" (Transactions)
  const transactionEntries = useMemo(() => {
    if (!selectedOBCode) return [];

    const obBills = bills.filter(b => b.obCode === selectedOBCode);
    const obRecoveries = recoveries.filter(r => {
      const linkedBill = bills.find(b => b.billNumber === r.billNumber);
      return linkedBill?.obCode === selectedOBCode;
    });

    const combined = [
      ...obBills.map(b => ({
        id: b.id,
        date: b.date,
        type: 'BILL',
        billNumber: b.billNumber,
        shopName: b.shopName,
        debit: b.billAmount,
        credit: 0,
      })),
      ...obRecoveries.map(r => ({
        id: r.id,
        date: r.recoveryDate,
        type: 'RECOVERY',
        billNumber: r.billNumber,
        shopName: bills.find(b => b.billNumber === r.billNumber)?.shopName || 'Unknown Shop',
        debit: 0,
        credit: r.recoveryAmount,
      }))
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedOBCode, bills, recoveries]);

  // Filtering logic for "Bill-wise Summary"
  const billEntries = useMemo(() => {
    if (!selectedOBCode) return [];
    return bills
      .filter(b => b.obCode === selectedOBCode)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedOBCode, bills]);

  const filteredBills = billEntries.filter(b => 
    b.shopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactionEntries.filter(e => 
    e.shopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const debit = billEntries.reduce((sum, e) => sum + e.billAmount, 0);
    const credit = billEntries.reduce((sum, e) => sum + e.recovery, 0);
    return { debit, credit, balance: debit - credit };
  }, [billEntries]);

  const exportCSV = () => {
    if (!selectedOB) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Order Booker: ${selectedOB.name} (${selectedOB.code})\n`;
    
    if (viewMode === 'bills') {
      csvContent += "SR#,Date,Customer Name,Address,Type,Bill Amount,Recovery,Balance\n";
      filteredBills.forEach((b, idx) => {
        csvContent += `${idx + 1},${b.date},"${b.shopName}","${b.shopAddress}",${b.billType},${b.billAmount},${b.recovery},${b.balance}\n`;
      });
    } else {
      csvContent += "Date,Type,Bill #,Shop,Debit,Credit\n";
      filteredTransactions.forEach(e => {
        csvContent += `${e.date},${e.type},${e.billNumber},"${e.shopName}",${e.debit},${e.credit}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OB_Ledger_${selectedOB.code}_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Order Booker Ledger</h2>
          <p className="text-slate-500 mt-1">Comprehensive tracking and performance logs.</p>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <select 
                className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-bold text-slate-700 focus:border-blue-500 focus:outline-none shadow-sm min-w-[200px]"
                value={selectedOBCode}
                onChange={e => setSelectedOBCode(e.target.value)}
            >
                <option value="">-- Choose Order Booker --</option>
                {obs.map(ob => (
                    <option key={ob.id} value={ob.code}>{ob.name} ({ob.code})</option>
                ))}
            </select>
            <input 
                type="text"
                placeholder="Search by shop or bill..."
                className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 font-medium text-slate-600 focus:border-blue-500 focus:outline-none shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {selectedOBCode && (
          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase hover:bg-slate-200 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
            <button onClick={() => window.print()} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Report
            </button>
          </div>
        )}
      </div>

      {!selectedOBCode ? (
        <div className="bg-white p-20 rounded-[40px] border border-slate-100 flex flex-col items-center text-center opacity-40 print:hidden">
            <svg className="w-16 h-16 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-2xl font-bold">Select an Order Booker to view their statement.</h3>
            <p>Lifetime billing and recovery data will be grouped here.</p>
        </div>
      ) : (
        <>
            <div className="hidden print:block mb-8 border-b-4 border-slate-900 pb-4">
               <h1 className="text-4xl font-black uppercase">{viewMode === 'bills' ? 'OB Bill-wise Summary' : 'OB Transaction Ledger'}</h1>
               <div className="mt-4 flex justify-between text-xl font-bold">
                  <div>
                    <p>OB Name: {selectedOB?.name}</p>
                    <p>OB Code: {selectedOB?.code}</p>
                  </div>
                  <div className="text-right">
                    <p>Report Date: {new Date().toLocaleDateString()}</p>
                    <p>Phone: {selectedOB?.phone}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Credit Sales</p>
                    <h4 className="text-3xl font-black text-slate-900">{currency} {stats.debit.toLocaleString()}</h4>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Recoveries</p>
                    <h4 className="text-3xl font-black text-emerald-600">{currency} {stats.credit.toLocaleString()}</h4>
                </div>
                <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl text-white print:bg-slate-100 print:text-black">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Net Balance</p>
                    <h4 className="text-3xl font-black">{currency} {stats.balance.toLocaleString()}</h4>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-4 print:bg-white print:px-0">
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                        {viewMode === 'bills' ? 'Bill-wise List' : 'Transaction Log'}
                    </h3>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl print:hidden">
                        <button 
                            onClick={() => setViewMode('bills')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'bills' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Bill Summary
                        </button>
                        <button 
                            onClick={() => setViewMode('transactions')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'transactions' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        {viewMode === 'bills' ? (
                            <>
                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest print:bg-slate-200">
                                    <tr>
                                        <th className="px-6 py-5">SR#</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5">Customer Name</th>
                                        <th className="px-6 py-5">Address</th>
                                        <th className="px-6 py-5">Type</th>
                                        <th className="px-6 py-5 text-right">Bill Amount</th>
                                        <th className="px-6 py-5 text-right">Recovery</th>
                                        <th className="px-6 py-5 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBills.map((b, idx) => (
                                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-xs font-bold text-slate-400">{idx + 1}</td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{b.date}</td>
                                            <td className="px-6 py-5 font-black text-slate-900">{b.shopName}</td>
                                            <td className="px-6 py-5 text-xs text-slate-500">{b.shopAddress}</td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">{b.billType}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-slate-900">{currency} {b.billAmount.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right font-bold text-emerald-600">{currency} {b.recovery.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right font-black text-rose-600">{currency} {b.balance.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest print:bg-slate-200">
                                    <tr>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6">Description</th>
                                        <th className="px-8 py-6">Bill #</th>
                                        <th className="px-8 py-6 text-right">Debit (Bill)</th>
                                        <th className="px-8 py-6 text-right">Credit (Recovery)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTransactions.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 text-sm font-medium text-slate-500">{entry.date}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{entry.shopName}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${entry.type === 'BILL' ? 'text-blue-500' : 'text-emerald-500'}`}>{entry.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-slate-400 group-hover:text-slate-900 transition-colors">{entry.billNumber}</td>
                                            <td className="px-8 py-6 text-right">
                                                {entry.debit > 0 ? <span className="text-lg font-black text-blue-600">{currency} {entry.debit.toLocaleString()}</span> : <span className="text-slate-200">--</span>}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {entry.credit > 0 ? <span className="text-lg font-black text-emerald-600">{currency} {entry.credit.toLocaleString()}</span> : <span className="text-slate-200">--</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                    {((viewMode === 'bills' && filteredBills.length === 0) || (viewMode === 'transactions' && filteredTransactions.length === 0)) && (
                        <div className="py-20 text-center text-slate-400 font-bold">
                            No records found for this criteria.
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default OBLedger;
