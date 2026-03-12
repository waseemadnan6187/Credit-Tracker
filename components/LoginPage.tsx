
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulated Auth Logic
    if (username === 'admin' && password === 'admin123') {
      onLogin({ id: '1', username: 'admin', role: UserRole.ADMIN, name: 'Chief Administrator' });
    } else if (username === 'user' && password === 'user123') {
      onLogin({ id: '2', username: 'user', role: UserRole.USER, name: 'Sales Associate' });
    } else {
      setError('Invalid username or password. (Hint: admin/admin123 or user/user123)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl animate-slideUp">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-6">BT</div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Welcome Back</h1>
          <p className="text-slate-400 mt-2 font-medium">Log in to your BillTrack Pro account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] mt-4"
          >
            SIGN IN
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs">
            Demo Access: <span className="text-blue-400">admin / admin123</span> or <span className="text-emerald-400">user / user123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
