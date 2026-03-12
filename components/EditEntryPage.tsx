
import React, { useState, useEffect } from 'react';
import { Bill, Recovery, Customer, OrderBooker, BillType, PaymentType } from '../types';

interface Props {
  item: { type: 'bill' | 'recovery' | 'customer' | 'ob', data: any };
  customers: Customer[];
  obs: OrderBooker[];
  bills: Bill[];
  currency: string;
  onUpdateBill: (b: Bill) => void;
  onUpdateRecovery: (r: Recovery) => void;
  onUpdateCustomer: (c: Customer) => void;
  onUpdateOB: (ob: OrderBooker) => void;
  onCancel: () => void;
}

const EditEntryPage: React.FC<Props> = ({ 
  item, 
  customers, 
  obs, 
  bills,
  currency,
  onUpdateBill, 
  onUpdateRecovery, 
  onUpdateCustomer, 
  onUpdateOB,
  onCancel 
}) => {
  const [formData, setFormData] = useState<any>(item.data);

  useEffect(() => {
    setFormData(item.data);
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.type === 'bill') onUpdateBill(formData);
    if (item.type === 'recovery') onUpdateRecovery(formData);
    if (item.type === 'customer') onUpdateCustomer(formData);
    if (item.type === 'ob') onUpdateOB(formData);
  };

  const renderForm = () => {
    switch (item.type) {
      case 'bill':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Bill Number">
               <input type="text" value={formData.billNumber} onChange={e => setFormData({...formData, billNumber: e.target.value})} className="input-base" />
            </FormGroup>
            <FormGroup label="Shop Name">
               <input type="text" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="input-base" />
            </FormGroup>
            <FormGroup label={`Bill Amount (${currency})`}>
               <input type="number" value={formData.billAmount} onChange={e => setFormData({...formData, billAmount: Number(e.target.value), balance: Number(e.target.value) - formData.recovery})} className="input-base" />
            </FormGroup>
            <FormGroup label="Bill Date">
               <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-base" />
            </FormGroup>
          </div>
        );
      case 'recovery':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Bill Number (Locked)">
               <input type="text" value={formData.billNumber} readOnly className="input-base bg-slate-100 cursor-not-allowed" />
            </FormGroup>
            <FormGroup label="Recovery Date">
               <input type="date" value={formData.recoveryDate} onChange={e => setFormData({...formData, recoveryDate: e.target.value})} className="input-base" />
            </FormGroup>
            <FormGroup label={`Amount (${currency})`}>
               <input type="number" value={formData.recoveryAmount} onChange={e => setFormData({...formData, recoveryAmount: Number(e.target.value)})} className="input-base" />
            </FormGroup>
            <FormGroup label="Payment Mode">
               <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as PaymentType})} className="input-base">
                 {Object.values(PaymentType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </FormGroup>
          </div>
        );
      case 'customer':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Customer Code">
               <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-base uppercase" />
            </FormGroup>
            <FormGroup label="Shop Name">
               <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-base" />
            </FormGroup>
            <FormGroup label="Default OB Code">
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
            <FormGroup label="Address">
               <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-base" />
            </FormGroup>
          </div>
        );
      case 'ob':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormGroup label="OB Code">
               <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-base uppercase" />
            </FormGroup>
            <FormGroup label="Name">
               <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-base" />
            </FormGroup>
            <FormGroup label="Phone">
               <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-base" />
            </FormGroup>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 max-w-4xl mx-auto animate-slideUp">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter capitalize">Edit {item.type}</h2>
          <p className="text-slate-500">Updating record ID: <span className="font-mono text-xs">{item.data.id.slice(0, 8)}</span></p>
        </div>
        <button onClick={onCancel} className="p-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderForm()}
        
        <div className="flex gap-4 pt-6">
          <button type="submit" className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            Save Changes
          </button>
          <button type="button" onClick={onCancel} className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
            Discard
          </button>
        </div>
      </form>
      
      <style>{`.input-base { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; } .input-base:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }`}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

export default EditEntryPage;
