
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Logo } from '../components/Logo';
import { Lock, ShieldCheck, Loader2, Home, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await StorageService.login(username, password);
      if (user) {
        navigate('/admin');
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        {/* Home Button Navigation */}
        <div className="absolute top-4 left-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>

        <div className="text-center pt-4">
          <div className="flex justify-center mb-6">
             <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
               <Lock className="text-white" size={24} />
             </div>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">System Authorization</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Enter credentials to access the restricted medical portal.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-700 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Identifier</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                placeholder="Staff Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Credential Key</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <ShieldCheck className="mr-2" size={18} />
              )}
              {isLoading ? 'Verifying...' : 'Authorize Access'}
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span>SOC 2 Compliance Monitoring Active</span>
          </div>
        </form>
      </div>
    </div>
  );
};
