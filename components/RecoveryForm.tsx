
import React, { useState, useEffect, useRef } from 'react';
import { Bill, Recovery, RecoveryType } from '../types';

interface RecoveryFormProps {
  bills: Bill[];
  onSubmit: (recovery: Omit<Recovery, 'id'>) => void;
  currency: string;
}

const RecoveryForm: React.FC<RecoveryFormProps> = ({ bills, onSubmit, currency }) => {
  const [billSearch, setBillSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [recoveryDate, setRecoveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<RecoveryType>(RecoveryType.OB);
  const [recoveryAmount, setRecoveryAmount] = useState('');
  const amountInputRef = useRef<HTMLInputElement>(null);

  const activeBills = bills.filter(b => b.balance > 0);

  const handleBillSelect = (bill: Bill) => {
    setSelectedBill(bill);
    setBillSearch(bill.billNumber);
    setRecoveryAmount('');
    // Auto focus amount input after a short delay
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleQuickAmount = (amount: number) => {
    if (!selectedBill) return;
    // Cap at bill balance
    const finalAmount = Math.min(amount, selectedBill.balance);
    setRecoveryAmount(finalAmount.toString());
  };

  const handleFullPayment = () => {
    if (!selectedBill) return;
    setRecoveryAmount(selectedBill.balance.toString());
  };

  const remainingBalance = selectedBill 
    ? selectedBill.balance - (Number(recoveryAmount) || 0) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !recoveryAmount) return;
    
    const amount = Number(recoveryAmount);
    if (amount <= 0) {
      alert("Please enter a valid recovery amount.");
      return;
    }
    if (amount > selectedBill.balance) {
      alert("Recovery amount cannot exceed remaining balance!");
      return;
    }

    onSubmit({
      billNumber: selectedBill.billNumber,
      billDate: selectedBill.date,
      recoveryDate: recoveryDate,
      type: type,
      billAmountAtRecovery: selectedBill.balance,
      recoveryAmount: amount,
      remainingAmount: remainingBalance
    });

    // Reset after success
    setSelectedBill(null);
    setBillSearch('');
    setRecoveryAmount('');
  };

  const matchingBills = billSearch.length > 0 && !selectedBill
    ? activeBills.filter(b => 
        b.billNumber.toLowerCase().includes(billSearch.toLowerCase()) || 
        b.shopName.toLowerCase().includes(billSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="flex flex-col lg:flex-row gap-8 bg-slate-900 rounded-[40px] p-2 md:p-4 shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Left Section: POS Controls */}
        <div className="flex-1 bg-white rounded-[32px] p-8 md:p-12 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Recovery POS</h2>
            <p className="text-slate-400 font-medium">Fast payment processing and real-time ledger updates.</p>
          </div>

          <div className="space-y-6">
            {/* Bill Lookup */}
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Search Bill # or Shop</label>
              <div className="relative">
                <input 
                  type="text" 
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="Type bill number..."
                  value={billSearch}
                  onChange={(e) => {
                    setBillSearch(e.target.value);
                    if (selectedBill) setSelectedBill(null);
                  }}
                />
                <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              {/* Autocomplete Dropdown */}
              {matchingBills.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                  {matchingBills.map(b => (
                    <button 
                      key={b.id} 
                      onClick={() => handleBillSelect(b)}
                      className="w-full px-6 py-4 text-left hover:bg-slate-50 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-black text-slate-900">{b.billNumber}</p>
                        <p className="text-xs text-slate-500 font-bold">{b.shopName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-600">{currency} {b.balance.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-300 font-bold uppercase">{b.date}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recovery Date */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Recovery Date</label>
                <input 
                  type="date" 
                  value={recoveryDate}
                  onChange={e => setRecoveryDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Type Toggle */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Recovery Type</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setType(RecoveryType.OB)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${type === RecoveryType.OB ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    OB (Order Booker)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType(RecoveryType.SM)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${type === RecoveryType.SM ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    SM (Sales Manager)
                  </button>
                </div>
              </div>
            </div>

            {/* Amount Input & Quick Selects */}
            <div className={`transition-all ${selectedBill ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
              <div className="flex justify-between items-end mb-2 ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Amount ({currency})</label>
                {selectedBill && recoveryAmount && (
                  <span className={`text-[10px] font-black uppercase tracking-widest ${remainingBalance < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                    Suggested Remaining: {currency} {remainingBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-400 opacity-50">{currency}</span>
                <input 
                  ref={amountInputRef}
                  type="number" 
                  placeholder="0"
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 text-4xl font-black text-emerald-600 placeholder:text-slate-200 focus:border-emerald-500 focus:outline-none transition-all ${currency.length > 1 ? 'px-20' : 'px-16'}`}
                  value={recoveryAmount}
                  onChange={e => setRecoveryAmount(e.target.value)}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[500, 1000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-600 transition-all active:scale-95"
                  >
                    + {currency} {amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleFullPayment}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-black text-emerald-600 transition-all active:scale-95"
                >
                  FULL PAY
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!selectedBill || !recoveryAmount}
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group"
          >
            PROCESS PAYMENT
            <span className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        {/* Right Section: Digital Receipt / Summary */}
        <div className="w-full lg:w-[400px] flex flex-col p-8 md:p-12 text-white relative">
          <div className="flex-grow space-y-12">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Transaction Summary</h3>
              <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </div>

            {!selectedBill ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30 border-2 border-dashed border-slate-800 rounded-[32px]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold text-sm">Select a bill to view<br/>breakdown</p>
              </div>
            ) : (
              <div className="space-y-8 animate-slideIn">
                <div className="space-y-1">
                  <p className="text-4xl font-black tracking-tighter truncate">{selectedBill.shopName}</p>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{selectedBill.billNumber} • {selectedBill.billType}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-800">
                  <ReceiptLine label="Bill Date" value={selectedBill.date} />
                  <ReceiptLine label="Recovery Date" value={recoveryDate} />
                  <ReceiptLine label="Type" value={type} />
                  <ReceiptLine 
                    label="Current Balance" 
                    value={`${currency} ${selectedBill.balance.toLocaleString()}`} 
                    highlight 
                  />
                  <ReceiptLine 
                    label="Recovering" 
                    value={`-${currency} ${(Number(recoveryAmount) || 0).toLocaleString()}`} 
                    color="text-emerald-400" 
                  />
                </div>

                <div className="pt-8 mt-8 border-t border-slate-800">
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Remaining Balance</p>
                  <h4 className="text-5xl font-black tracking-tighter">
                    {currency} {remainingBalance.toLocaleString()}
                  </h4>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-10 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">
            BillTrack POS v2.0 • Secure Ledgering
          </div>
        </div>
      </div>

      <style>{`
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const ReceiptLine = ({ label, value, highlight = false, color = "text-white" }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-500 font-bold text-xs uppercase tracking-tight">{label}</span>
    <span className={`${color} ${highlight ? 'font-black text-lg' : 'font-bold'}`}>{value}</span>
  </div>
);

export default RecoveryForm;
