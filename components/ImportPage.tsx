
import React, { useState } from 'react';
import { Bill, BillType, Customer, OrderBooker } from '../types';

interface Props {
  onImportBills: (bills: Omit<Bill, 'id' | 'recovery' | 'balance'>[]) => void;
  onImportCustomers: (customers: Omit<Customer, 'id'>[]) => void;
  onImportOBs: (obs: Omit<OrderBooker, 'id'>[]) => void;
  customers: Customer[];
  obs: OrderBooker[];
  currency: string;
}

type ImportType = 'bills' | 'customers' | 'obs';

const ImportPage: React.FC<Props> = ({ onImportBills, onImportCustomers, onImportOBs, customers, obs, currency }) => {
  const [stage, setStage] = useState<'type_selection' | 'upload' | 'mapping' | 'preview'>('type_selection');
  const [importType, setImportType] = useState<ImportType>('bills');
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  
  // Final parsed results
  const [billResults, setBillResults] = useState<Omit<Bill, 'id' | 'recovery' | 'balance'>[]>([]);
  const [customerResults, setCustomerResults] = useState<Omit<Customer, 'id'>[]>([]);
  const [obResults, setObResults] = useState<Omit<OrderBooker, 'id'>[]>([]);

  const billFields = [
    { key: 'date', label: 'Bill Date (YYYY-MM-DD)', required: true },
    { key: 'customerCode', label: 'Customer Code', required: true },
    { key: 'obCode', label: 'OB Code', required: true },
    { key: 'billNumber', label: 'Bill Number', required: true },
    { key: 'shopName', label: 'Shop Name (Auto if Code matches)', required: false },
    { key: 'shopAddress', label: 'Shop Address', required: false },
    { key: 'billAmount', label: 'Bill Amount', required: true }
  ];

  const customerFields = [
    { key: 'code', label: 'Customer Code', required: true },
    { key: 'name', label: 'Shop Name', required: true },
    { key: 'obCode', label: 'OB Code', required: true },
    { key: 'address', label: 'Address', required: true }
  ];

  const obFields = [
    { key: 'code', label: 'OB Code', required: true },
    { key: 'name', label: 'Name', required: true },
    { key: 'phone', label: 'Phone Number', required: true }
  ];

  const currentFields = importType === 'bills' ? billFields : importType === 'customers' ? customerFields : obFields;

  const handleStartImportProcess = (type: ImportType) => {
    setImportType(type);
    setStage('upload');
  };

  const handleTextProcess = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').map(line => line.split(/[,\t]/).map(cell => cell.trim()));
    setParsedData(lines);
    setStage('mapping');
  };

  const handleStartPreview = () => {
    if (importType === 'bills') {
      const results: Omit<Bill, 'id' | 'recovery' | 'balance'>[] = parsedData.slice(1).map(row => {
        const customerCode = row[mapping.customerCode] || '';
        const matchedCustomer = customers.find(c => c.code.toLowerCase() === customerCode.toLowerCase());
        
        return {
          date: row[mapping.date] || new Date().toISOString().split('T')[0],
          customerCode,
          obCode: matchedCustomer ? matchedCustomer.obCode : (row[mapping.obCode] || ''),
          billNumber: row[mapping.billNumber] || `IMP-${Math.floor(1000 + Math.random() * 9000)}`,
          shopName: matchedCustomer ? matchedCustomer.name : (row[mapping.shopName] || 'Imported Shop'),
          shopAddress: matchedCustomer ? matchedCustomer.address : (row[mapping.shopAddress] || ''),
          billType: BillType.FOOD,
          billAmount: parseFloat(row[mapping.billAmount]) || 0
        };
      }).filter(b => b.billAmount > 0);
      setBillResults(results);
    } else if (importType === 'customers') {
      const results: Omit<Customer, 'id'>[] = parsedData.slice(1).map(row => ({
        code: (row[mapping.code] || '').toUpperCase(),
        name: row[mapping.name] || 'Unnamed Shop',
        obCode: (row[mapping.obCode] || '').toUpperCase(),
        address: row[mapping.address] || 'No Address'
      })).filter(c => c.code);
      setCustomerResults(results);
    } else {
      const results: Omit<OrderBooker, 'id'>[] = parsedData.slice(1).map(row => ({
        code: (row[mapping.code] || '').toUpperCase(),
        name: row[mapping.name] || 'Unnamed OB',
        phone: row[mapping.phone] || 'No Phone'
      })).filter(ob => ob.code);
      setObResults(results);
    }
    setStage('preview');
  };

  const finalize = () => {
    if (importType === 'bills') onImportBills(billResults);
    else if (importType === 'customers') onImportCustomers(customerResults);
    else onImportOBs(obResults);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
      {stage === 'type_selection' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <ImportModeCard 
                title="Bills" 
                desc="Import daily credit bill batches from spreadsheets." 
                icon={<MoneyIcon/>}
                onClick={() => handleStartImportProcess('bills')}
                color="blue"
            />
            <ImportModeCard 
                title="Customers" 
                desc="Upload your entire shop database or new customer lists." 
                icon={<UsersIcon/>}
                onClick={() => handleStartImportProcess('customers')}
                color="emerald"
            />
            <ImportModeCard 
                title="Order Bookers" 
                desc="Bulk register your team of Order Bookers." 
                icon={<BriefcaseIcon/>}
                onClick={() => handleStartImportProcess('obs')}
                color="slate"
            />
        </div>
      )}

      {stage === 'upload' && (
        <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 text-center space-y-8 animate-slideUp">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter capitalize">Import {importType === 'obs' ? 'Order Bookers' : importType}</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Copy data from Excel and paste it below. Include headers for easier mapping.</p>
          </div>

          <textarea 
            className="w-full h-64 p-8 bg-slate-50 rounded-[32px] border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-all font-mono text-xs leading-relaxed"
            placeholder={`Example:
Code,Name,Phone
OB-01,John Doe,123-456-7890`}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />

          <div className="flex gap-4 justify-center">
            <button 
                onClick={handleTextProcess}
                disabled={!rawText.trim()}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95 shadow-xl"
            >
                Process Data
            </button>
            <button onClick={() => setStage('type_selection')} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">Cancel</button>
          </div>
        </div>
      )}

      {stage === 'mapping' && (
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 animate-slideUp">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Field Mapping</h2>
            <p className="text-slate-500 mb-10">Match our required fields to your spreadsheet columns.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {currentFields.map(field => (
                    <div key={field.key} className="flex flex-col gap-2 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                        <div className="flex justify-between items-center px-1">
                            <span className="font-bold text-slate-800 text-sm">{field.label}</span>
                            {field.required && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Required</span>}
                        </div>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none shadow-sm"
                            onChange={e => setMapping(prev => ({...prev, [field.key]: parseInt(e.target.value)}))}
                            defaultValue=""
                        >
                            <option value="">-- Choose Column --</option>
                            {parsedData[0].map((header, idx) => (
                                <option key={idx} value={idx}>{header || `Column ${idx+1}`}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex gap-4">
                <button onClick={handleStartPreview} className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100 active:scale-95 transition-all">Review & Preview</button>
                <button onClick={() => setStage('upload')} className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold">Back to Paste</button>
            </div>
        </div>
      )}

      {stage === 'preview' && (
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 animate-slideUp">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Final Review</h2>
                    <p className="text-slate-500">Previewing <span className="font-black text-slate-900">{importType === 'bills' ? billResults.length : importType === 'customers' ? customerResults.length : obResults.length}</span> entries.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={finalize} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all">Confirm Import</button>
                    <button onClick={() => setStage('mapping')} className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold">Adjust Mapping</button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-[32px] shadow-inner bg-slate-50/30">
                <table className="w-full text-left">
                    <thead className="bg-slate-100/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        {importType === 'bills' ? (
                          <tr>
                              <th className="px-6 py-5">Date</th>
                              <th className="px-6 py-5">Bill #</th>
                              <th className="px-6 py-5">Customer Info</th>
                              <th className="px-6 py-5 text-right">Amount</th>
                          </tr>
                        ) : importType === 'customers' ? (
                          <tr>
                              <th className="px-6 py-5">Code</th>
                              <th className="px-6 py-5">Shop Name</th>
                              <th className="px-6 py-5">OB Code</th>
                              <th className="px-6 py-5">Full Address</th>
                          </tr>
                        ) : (
                          <tr>
                              <th className="px-6 py-5">Code</th>
                              <th className="px-6 py-5">Name</th>
                              <th className="px-6 py-5">Phone</th>
                          </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {importType === 'bills' ? (
                          billResults.map((b, i) => (
                            <tr key={i} className="text-sm hover:bg-white transition-colors">
                                <td className="px-6 py-5 font-medium text-slate-600">{b.date}</td>
                                <td className="px-6 py-5 font-black text-slate-900">{b.billNumber}</td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-slate-800">{b.shopName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{b.customerCode}</p>
                                </td>
                                <td className="px-6 py-5 text-right font-black text-blue-600">{currency} {b.billAmount.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : importType === 'customers' ? (
                          customerResults.map((c, i) => (
                            <tr key={i} className="text-sm hover:bg-white transition-colors">
                                <td className="px-6 py-5 font-black text-slate-900">{c.code}</td>
                                <td className="px-6 py-5 font-bold text-slate-700">{c.name}</td>
                                <td className="px-6 py-5"><span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">{c.obCode}</span></td>
                                <td className="px-6 py-5 text-slate-500">{c.address}</td>
                            </tr>
                          ))
                        ) : (
                          obResults.map((ob, i) => (
                            <tr key={i} className="text-sm hover:bg-white transition-colors">
                                <td className="px-6 py-5 font-black text-slate-900">{ob.code}</td>
                                <td className="px-6 py-5 font-bold text-slate-700">{ob.name}</td>
                                <td className="px-6 py-5 text-slate-500">{ob.phone}</td>
                            </tr>
                          ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

const ImportModeCard = ({ title, desc, icon, onClick, color }: any) => {
    const themes = {
        blue: "bg-blue-600 shadow-blue-100",
        emerald: "bg-emerald-600 shadow-emerald-100",
        slate: "bg-slate-700 shadow-slate-100"
    };
    return (
        <button 
            onClick={onClick}
            className="group relative bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-200 transition-all text-left flex flex-col items-start overflow-hidden"
        >
            <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg ${themes[color as keyof typeof themes]} text-white`}>
                {icon}
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Import {title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
            <div className="mt-8 flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                Start Import <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
        </button>
    );
};

const MoneyIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UsersIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BriefcaseIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

export default ImportPage;
