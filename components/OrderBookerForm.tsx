
import React, { useState } from 'react';
import { OrderBooker } from '../types';

interface Props {
  obs: OrderBooker[];
  onAddOB: (ob: Omit<OrderBooker, 'id'>) => void;
  onDeleteOB: (id: string) => void;
  onEdit?: (ob: OrderBooker) => void;
}

const OrderBookerForm: React.FC<Props> = ({ obs, onAddOB, onDeleteOB, onEdit }) => {
  const [formData, setFormData] = useState({ code: '', name: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (obs.some(o => o.code.toUpperCase() === formData.code.toUpperCase())) {
      alert("OB Code already exists!");
      return;
    }
    onAddOB(formData);
    setFormData({ code: '', name: '', phone: '' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold mb-6">Manage Order Bookers</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">OB Code</label>
            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input-base mt-1" placeholder="OB-01" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-base mt-1" placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-base mt-1" placeholder="+123..." required />
          </div>
          <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-3 rounded-xl font-bold mt-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">Add Order Booker</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {obs.map(ob => (
              <tr key={ob.id} className="text-sm hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{ob.code}</td>
                <td className="px-6 py-4">{ob.name}</td>
                <td className="px-6 py-4 text-slate-500">{ob.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onEdit?.(ob)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDeleteOB(ob.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.input-base { width: 100%; padding: 10px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; } .input-base:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }`}</style>
    </div>
  );
};

export default OrderBookerForm;
