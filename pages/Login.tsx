
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Lock, ShieldCheck, Loader2, Home, ArrowLeft, RefreshCw, Mail, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Forced password reset state (for new staff on first login)
  const [isForceResetMode, setIsForceResetMode] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await StorageService.login(email, password);
      if (user) {
        // Check if user must reset password before accessing dashboard
        if ((user as any).mustResetPassword) {
          setIsForceResetMode(true);
        } else {
          navigate('/admin');
        }
      } else {
        setError('Invalid credentials. Access Denied.');
      }
    } catch (err) {
      setError('System authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await StorageService.updateUserPassword('', newPass);
      await StorageService.clearResetFlag();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await StorageService.resetPasswordByEmail(resetEmail);
      setResetSuccess('Password reset link sent to your email. Check your inbox.');
      setTimeout(() => {
        setIsForgotMode(false);
        setResetSuccess('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Forced Password Reset Screen ---
  if (isForceResetMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="text-center pt-4">
            <div className="flex justify-center mb-6">
              <div className="bg-red-700 p-3 rounded-2xl shadow-lg">
                <KeyRound className="text-white" size={24} />
              </div>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">Set Your Password</h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">Your account was just created. Please set a new secure password to continue.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleForceReset}>
            {error && <div className="text-red-700 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <input required type="password" placeholder="••••••••" className="appearance-none block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-red-500 font-medium" value={newPass} onChange={e => setNewPass(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input required type="password" placeholder="••••••••" className="appearance-none block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-red-500 font-medium" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-red-700 hover:bg-red-800 transition-all shadow-lg disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <KeyRound className="mr-2" size={18} />}
              {isLoading ? 'Updating...' : 'Set Password & Continue'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>First-login security protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal Login / Forgot Password ---
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>

        <div className="text-center pt-4">
          <div className="flex justify-center mb-6">
             <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
               {isForgotMode ? <RefreshCw className="text-white" size={24} /> : <Lock className="text-white" size={24} />}
             </div>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            {isForgotMode ? 'Reset Password' : 'System Authorization'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {isForgotMode ? 'Enter your email to receive a password reset link.' : 'Enter credentials to access restricted medical portal.'}
          </p>
        </div>
        
        {!isForgotMode ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-700 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" className="appearance-none block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-red-500 font-medium" placeholder="staff@easygopharm.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input required type="password" title="Enter password" placeholder="••••••••" className="appearance-none block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-red-500 font-medium" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-slate-500 hover:text-red-700 uppercase tracking-widest">Forgot Password?</button>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldCheck className="mr-2" size={18} />}
              {isLoading ? 'Verifying...' : 'Authorize Access'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            {error && <div className="text-red-700 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
            {resetSuccess && <div className="text-emerald-700 text-sm font-bold text-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">{resetSuccess}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" className="appearance-none block w-full px-4 py-3 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-red-500 font-medium" placeholder="staff@easygopharm.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-4 px-4 text-sm font-bold rounded-xl text-white bg-red-700 hover:bg-red-800 transition-all shadow-lg disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Mail className="mr-2" size={18} />}
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => setIsForgotMode(false)} className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900">Back to Login</button>
          </form>
        )}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span>SOC 2 Compliance Active</span>
        </div>
      </div>
    </div>
  );
};
