
import React from 'react';
import { Bill, Recovery } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  bills: Bill[];
  recoveries: Recovery[];
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ bills, recoveries, currency }) => {
  const totalSales = bills.reduce((sum, b) => sum + b.billAmount, 0);
  const totalRecovery = recoveries.reduce((sum, r) => sum + r.recoveryAmount, 0);
  const totalOutstanding = totalSales - totalRecovery;

  const chartData = bills.slice(0, 7).reverse().map(b => ({
    name: b.billNumber,
    amount: b.billAmount,
    recovery: b.recovery,
    balance: b.balance
  }));

  const pieData = [
    { name: 'Recovered', value: totalRecovery, color: '#3b82f6' },
    { name: 'Outstanding', value: totalOutstanding, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Insights Overview</h2>
          <p className="text-slate-500 mt-1">Real-time performance tracking for all shop accounts.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Billing" 
          value={`${currency} ${totalSales.toLocaleString()}`} 
          color="blue"
          icon={<BillingIcon />}
        />
        <StatCard 
          label="Total Recovery" 
          value={`${currency} ${totalRecovery.toLocaleString()}`} 
          color="emerald" 
          icon={<RecoveryIcon />}
        />
        <StatCard 
          label="Total Outstanding" 
          value={`${currency} ${totalOutstanding.toLocaleString()}`} 
          color="rose"
          icon={<AlertIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Recent Billing Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  formatter={(value: any) => [`${currency} ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Bill Amount" />
                <Bar dataKey="recovery" fill="#10b981" radius={[4, 4, 0, 0]} name="Recovery" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-6 self-start flex items-center gap-2">
            <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
            Recovery Status
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${currency} ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                <span className="text-sm font-medium text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: 'blue' | 'emerald' | 'rose'; icon: React.ReactNode }> = ({ label, value, color, icon }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
    </div>
  );
};

const BillingIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const RecoveryIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

export default Dashboard;
