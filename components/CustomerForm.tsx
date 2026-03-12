
import React, { useState } from 'react';
import { Customer, OrderBooker } from '../types';

interface Props {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onDeleteCustomer: (id: string) => void;
  obs: OrderBooker[];
  onEdit?: (c: Customer) => void;
}

const CustomerForm: React.FC<Props> = ({ customers, onAddCustomer, onDeleteCustomer, obs, onEdit }) => {
  const [formData, setFormData] = useState({ code: '', name: '', address: '', obCode: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customers.some(c => c.code.toUpperCase() === formData.code.toUpperCase())) {
      alert("Customer Code already exists!");
      return;
    }
    onAddCustomer(formData);
    setFormData({ code: '', name: '', address: '', obCode: '' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold mb-6">Register New Customer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Customer Code</label>
            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-base mt-1" placeholder="e.g. C001" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Shop Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-base mt-1" placeholder="Main Store" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Default OB</label>
            <select 
              value={formData.obCode} 
              onChange={e => setFormData({...formData, obCode: e.target.value})} 
              className="input-base mt-1" 
              required
            >
              <option value="">Select OB</option>
              {obs.map(ob => (
                <option key={ob.id} value={ob.code}>{ob.name} ({ob.code})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1 lg:col-span-1">
             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Address</label>
             <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-base mt-1" placeholder="123 Street..." required />
          </div>
          <button type="submit" className="md:col-span-2 lg:col-span-4 bg-blue-600 text-white py-3 rounded-xl font-bold mt-2 shadow-lg hover:bg-blue-700 transition-all">Add Customer</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Shop Name</th>
              <th className="px-6 py-4">Linked OB</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map(c => (
              <tr key={c.id} className="text-sm hover:bg-slate-50 group">
                <td className="px-6 py-4 font-bold">{c.code}</td>
                <td className="px-6 py-4">{c.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-600">{c.obCode || 'NONE'}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[200px]">{c.address}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit?.(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDeleteCustomer(c.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.input-base { width: 100%; padding: 10px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; }`}</style>
    </div>
  );
};

export default CustomerForm;
