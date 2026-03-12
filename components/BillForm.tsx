
import React, { useState, useEffect } from 'react';
import { BillType, Bill, Customer, OrderBooker } from '../types';

interface BillFormProps {
  customers: Customer[];
  obs: OrderBooker[];
  onSubmit: (bill: Omit<Bill, 'id' | 'recovery' | 'balance'>, stayOnPage?: boolean) => void;
  currency: string;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
}

const BillForm: React.FC<BillFormProps> = ({ customers, obs, onSubmit, currency, onAddCustomer }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerCode: '',
    obCode: '',
    billNumber: '',
    shopName: '',
    shopAddress: '',
    billType: BillType.FOOD,
    billAmount: ''
  });

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ code: '', name: '', address: '', obCode: '' });

  // Auto-fill logic for shop details based on customer code
  useEffect(() => {
    const customer = customers.find(c => c.code.toLowerCase() === formData.customerCode.toLowerCase());
    if (customer) {
      setFormData(prev => ({
        ...prev,
        shopName: customer.name,
        shopAddress: customer.address,
        obCode: customer.obCode || prev.obCode // Use default OB from customer if available
      }));
    }
  }, [formData.customerCode, customers]);

  const handleReset = () => {
    if (window.confirm("Clear all fields and start a new bill?")) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerCode: '',
        obCode: '',
        billNumber: '',
        shopName: '',
        shopAddress: '',
        billType: BillType.FOOD,
        billAmount: ''
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent, stayOnPage: boolean = false) => {
    e.preventDefault();
    if (!formData.billAmount || isNaN(Number(formData.billAmount))) return;
    if (!formData.billNumber.trim()) {
      alert("Please enter a Bill Number");
      return;
    }
    
    onSubmit({ ...formData, billAmount: Number(formData.billAmount) }, stayOnPage);
    
    // Reset form for next entry
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customerCode: '',
      obCode: '',
      billNumber: '',
      shopName: '',
      shopAddress: '',
      billType: BillType.FOOD,
      billAmount: ''
    });
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.code || !newCust.name || !newCust.obCode) {
      alert("Please fill all required fields for the new customer.");
      return;
    }
    if (customers.some(c => c.code.toUpperCase() === newCust.code.toUpperCase())) {
      alert("A customer with this code already exists.");
      return;
    }

    onAddCustomer(newCust);
    setFormData(prev => ({ ...prev, customerCode: newCust.code.toUpperCase() }));
    setNewCust({ code: '', name: '', address: '', obCode: '' });
    setIsAddingCustomer(false);
  };

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 max-w-5xl mx-auto animate-slideUp">
      <div className="flex justify-between items-start mb-10 border-b border-slate-50 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">New Billing Entry</h2>
          <p className="text-slate-500 mt-2 font-medium">Organize your records by filling in transaction and customer details.</p>
        </div>
        <button 
          type="button" 
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase transition-all shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Quick New
        </button>
      </div>

      <form onSubmit={(e) => handleFormSubmit(e, false)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Column 1: Transaction Details */}
          <div className="space-y-6">
            <SectionHeader title="Transaction Details" icon={<BillIcon />} />
            
            <FormGroup label="Bill Date">
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-base" required />
            </FormGroup>

            <FormGroup label="Bill Number">
              <input 
                type="text" 
                placeholder="Enter Bill #"
                value={formData.billNumber} 
                onChange={e => setFormData({...formData, billNumber: e.target.value})} 
                className="input-base font-bold text-slate-900" 
                required
              />
            </FormGroup>

            <FormGroup label="Bill Type">
              <select value={formData.billType} onChange={e => setFormData({...formData, billType: e.target.value as BillType})} className="input-base font-bold text-slate-900">
                {Object.values(BillType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </FormGroup>

            <FormGroup label={`Bill Amount (${currency})`}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={formData.billAmount} 
                  onChange={e => setFormData({...formData, billAmount: e.target.value})} 
                  className={`input-base font-black text-2xl text-blue-600 ${currency.length > 1 ? 'pl-14' : 'pl-10'}`} 
                  required 
                />
              </div>
            </FormGroup>
          </div>

          {/* Column 2: Customer & Shop Info */}
          <div className="space-y-6">
            <SectionHeader title="Customer Information" icon={<ShopIcon />} />

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Customer Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="e.g. C001"
                    value={formData.customerCode} 
                    onChange={e => setFormData({...formData, customerCode: e.target.value})}
                    className={`input-base uppercase ${customers.some(c => c.code.toLowerCase() === formData.customerCode.toLowerCase()) ? 'border-emerald-500 ring-emerald-100 ring-4' : ''}`}
                    required
                  />
                  {customers.some(c => c.code.toLowerCase() === formData.customerCode.toLowerCase()) && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-600 text-[10px] px-2 py-1 rounded-lg font-black tracking-widest uppercase">Matched</span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddingCustomer(true)}
                  className="bg-blue-600 text-white px-4 rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  title="Add New Customer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            <FormGroup label="Order Booker (OB)">
              <select 
                value={formData.obCode} 
                onChange={e => setFormData({...formData, obCode: e.target.value})}
                className="input-base"
                required
              >
                <option value="">Select OB</option>
                {obs.map(ob => (
                  <option key={ob.id} value={ob.code}>{ob.name} ({ob.code})</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Shop Name">
              <input 
                type="text" 
                placeholder="Shop Name"
                value={formData.shopName} 
                onChange={e => setFormData({...formData, shopName: e.target.value})} 
                className="input-base" 
                required 
              />
            </FormGroup>

            <FormGroup label="Shop Address">
              <input 
                type="text" 
                placeholder="Full Shop Address"
                value={formData.shopAddress} 
                onChange={e => setFormData({...formData, shopAddress: e.target.value})} 
                className="input-base" 
                required 
              />
            </FormGroup>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-end gap-4">
          <button 
            type="button" 
            onClick={(e) => handleFormSubmit(e as any, true)}
            className="w-full md:w-auto px-10 py-5 bg-slate-100 text-slate-700 rounded-3xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            SAVE & ADD ANOTHER
          </button>
          <button 
            type="submit" 
            className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
          >
            SAVE TRANSACTION
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      {isAddingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 relative animate-slideUp">
            <button 
              onClick={() => setIsAddingCustomer(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register New Shop</h3>
              <p className="text-slate-500 text-sm font-medium">Add a new customer to the database instantly.</p>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Shop Code (Unique)</label>
                <input 
                  type="text" 
                  autoFocus
                  className="input-base uppercase" 
                  placeholder="e.g. C100" 
                  value={newCust.code} 
                  onChange={e => setNewCust({...newCust, code: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Shop / Client Name</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Official Shop Name" 
                  value={newCust.name} 
                  onChange={e => setNewCust({...newCust, name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Assign Order Booker</label>
                <select 
                  className="input-base" 
                  value={newCust.obCode} 
                  onChange={e => setNewCust({...newCust, obCode: e.target.value})} 
                  required
                >
                  <option value="">Select OB</option>
                  {obs.map(ob => (
                    <option key={ob.id} value={ob.code}>{ob.name} ({ob.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Full Address</label>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="Locality, City" 
                  value={newCust.address} 
                  onChange={e => setNewCust({...newCust, address: e.target.value})} 
                  required 
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                  REGISTER CUSTOMER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input-base { 
          width: 100%; 
          padding: 16px 20px; 
          border-radius: 20px; 
          border: 2px solid #f1f5f9; 
          background-color: #f8fafc; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          outline: none; 
          font-weight: 500;
          color: #1e293b;
        }
        .input-base:focus { 
          border-color: #3b82f6; 
          background-color: white;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.08);
          transform: translateY(-1px);
        }
        .input-base::placeholder {
          color: #cbd5e1;
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
      {icon}
    </div>
    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

const BillIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ShopIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

export default BillForm;
