
import React, { useState, useEffect } from 'react';
import { Bill, Recovery, Customer, OrderBooker, User, UserRole, ThemeType } from './types';
import { initDB, getAllDataForSync, runCommand, getSetting, setSetting } from './database';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import LoginPage from './components/LoginPage';
import BillForm from './components/BillForm';
import RecoveryForm from './components/RecoveryForm';
import Ledger from './components/Ledger';
import CustomerForm from './components/CustomerForm';
import OrderBookerForm from './components/OrderBookerForm';
import Summary from './components/Summary';
import TodayReport from './components/TodayReport';
import OBLedger from './components/OBLedger';
import CustomerLedger from './components/CustomerLedger';
import ThemePage from './components/ThemePage';

type Tab = 'dashboard' | 'bills' | 'recovery' | 'ledger' | 'customers' | 'obs' | 'summary' | 'today' | 'ob-ledger' | 'customer-ledger' | 'themes';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [bills, setBills] = useState<Bill[]>([]);
  const [recoveries, setRecoveries] = useState<Recovery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [obs, setObs] = useState<OrderBooker[]>([]);
  const [theme, setTheme] = useState<ThemeType>((getSetting('app_theme') as ThemeType) || 'blue');
  const [currencySymbol, setCurrencySymbol] = useState<string>(getSetting('app_currency') || 'Rs.');

  const refreshData = async () => {
    try {
      const data = await getAllDataForSync();
      setBills(data.bills);
      setRecoveries(data.recoveries);
      setCustomers(data.customers);
      setObs(data.obs);
    } catch (e) {
      console.error("Data Load Error", e);
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        const savedUser = getSetting('active_session');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        await refreshData();
        setIsReady(true);
      } catch (err) {
        console.error("System Failure", err);
      }
    };
    setup();
    
    const handleTabChange = (e: any) => setActiveTab(e.detail);
    window.addEventListener('tabChange', handleTabChange);
    return () => window.removeEventListener('tabChange', handleTabChange);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setSetting('active_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_session');
  };

  const addBill = async (bill: any) => {
    try {
      await runCommand('bills', 'POST', bill);
      await refreshData();
      setActiveTab('ledger');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const addRecovery = async (recovery: any) => {
    try {
      await runCommand('recoveries', 'POST', recovery);
      await refreshData();
      setActiveTab('ledger');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteBill = async (id: string) => {
    if (window.confirm("Deleting this bill will also remove all its recovery history. Proceed?")) {
      await runCommand(`bills/${id}`, 'DELETE');
      await refreshData();
    }
  };

  if (!isReady) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest uppercase text-xs">Connecting to Laravel MySQL Instance...</p>
    </div>
  );

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-900 theme-${theme}`}>
      <aside className="w-80 border-r border-slate-100 p-8 flex flex-col gap-10 print:hidden sticky top-0 h-screen bg-white">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-slate-900 text-xs">BT</div>
            BillTrack <span className="text-blue-500">Live</span>
        </h1>
        <nav className="flex flex-col gap-1 overflow-y-auto pr-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth={2}/></svg>} theme={theme} />
          <NavItem active={activeTab === 'bills'} onClick={() => setActiveTab('bills')} label="New Billing" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2}/></svg>} theme={theme} />
          <NavItem active={activeTab === 'recovery'} onClick={() => setActiveTab('recovery')} label="Recovery POS" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6" strokeWidth={2}/></svg>} theme={theme} />
          {isAdmin && (
            <>
              <NavItem active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} label="General Ledger" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label="Credit Summary" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17v-2m3 2v-4m3 4v-6" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'today'} onClick={() => setActiveTab('today')} label="Today's Activity" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'ob-ledger'} onClick={() => setActiveTab('ob-ledger')} label="OB Statements" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'customer-ledger'} onClick={() => setActiveTab('customer-ledger')} label="Shop Accounts" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" strokeWidth={2}/></svg>} theme={theme} />
              <div className="h-px bg-slate-100 my-4"></div>
              <NavItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} label="Master: Shops" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'obs'} onClick={() => setActiveTab('obs')} label="Master: OBs" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 13.255A23.931 23.931 0 0112 15" strokeWidth={2}/></svg>} theme={theme} />
              <NavItem active={activeTab === 'themes'} onClick={() => setActiveTab('themes')} label="Appearance" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" strokeWidth={2}/></svg>} theme={theme} />
            </>
          )}
        </nav>
        <button onClick={handleLogout} className="mt-auto w-full py-4 rounded-2xl font-black text-rose-500 hover:bg-rose-500/10 transition-all text-xs tracking-widest uppercase">Logout</button>
      </aside>

      <main className="flex-1 p-12 max-w-7xl mx-auto overflow-y-auto">
        {activeTab === 'dashboard' && (isAdmin ? <Dashboard bills={bills} recoveries={recoveries} currency={currencySymbol} /> : <UserDashboard user={currentUser} bills={bills} recoveries={recoveries} currency={currencySymbol} />)}
        {activeTab === 'bills' && <BillForm customers={customers} obs={obs} onSubmit={addBill} currency={currencySymbol} onAddCustomer={async (c) => { await runCommand('customers', 'POST', c); refreshData(); }} />}
        {activeTab === 'recovery' && <RecoveryForm bills={bills} onSubmit={addRecovery} currency={currencySymbol} />}
        {activeTab === 'ledger' && <Ledger bills={bills} recoveries={recoveries} currency={currencySymbol} onDeleteBill={deleteBill} />}
        {activeTab === 'summary' && <Summary bills={bills} obs={obs} currency={currencySymbol} />}
        {activeTab === 'today' && <TodayReport bills={bills} recoveries={recoveries} obs={obs} currency={currencySymbol} />}
        {activeTab === 'ob-ledger' && <OBLedger bills={bills} recoveries={recoveries} obs={obs} currency={currencySymbol} />}
        {activeTab === 'customer-ledger' && <CustomerLedger bills={bills} recoveries={recoveries} customers={customers} currency={currencySymbol} />}
        {activeTab === 'customers' && <CustomerForm customers={customers} onAddCustomer={async (c) => { await runCommand('customers', 'POST', c); refreshData(); }} onDeleteCustomer={async (id) => { await runCommand(`customers/${id}`, 'DELETE'); refreshData(); }} obs={obs} />}
        {activeTab === 'obs' && <OrderBookerForm obs={obs} onAddOB={async (o) => { await runCommand('obs', 'POST', o); refreshData(); }} onDeleteOB={async (id) => { await runCommand(`obs/${id}`, 'DELETE'); refreshData(); }} />}
        {activeTab === 'themes' && <ThemePage currentTheme={theme} currentCurrency={currencySymbol} onThemeChange={(t) => { setTheme(t); setSetting('app_theme', t); }} onCurrencyChange={(c) => { setCurrencySymbol(c); setSetting('app_currency', c); }} />}
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, label, icon, theme }: any) => {
  const activeColor = { blue: 'bg-blue-600', indigo: 'bg-indigo-600', emerald: 'bg-emerald-600', crimson: 'bg-rose-600', amber: 'bg-amber-500', slate: 'bg-slate-900' }[theme as ThemeType];
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold transition-all ${active ? `${activeColor} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-50'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default App;
