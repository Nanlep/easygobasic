import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { StorageService } from '../services/storageService';
import { ShieldCheck, LogOut, Menu, X, Lock } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = StorageService.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    StorageService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? "text-red-700 font-semibold" : "text-slate-600 hover:text-red-700";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              {!user ? (
                <>
                  <Link to="/" className={isActive('/')}>Home</Link>
                  <Link to="/request-drug" className={isActive('/request-drug')}>Request Drug</Link>
                  <Link to="/book-consult" className={isActive('/book-consult')}>Consultations</Link>
                </>
              ) : (
                <>
                  <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
                  <div className="flex items-center gap-4 border-l pl-4 border-slate-200">
                    <div className="text-right hidden lg:block">
                      <div className="text-sm font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.role.replace('_', ' ')}</div>
                    </div>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-2">
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-500 hover:text-slate-700 p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
               {!user ? (
                <>
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-red-700 hover:bg-slate-50">Home</Link>
                  <Link to="/request-drug" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-red-700 hover:bg-slate-50">Request Drug</Link>
                  <Link to="/book-consult" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-red-700 hover:bg-slate-50">Consultations</Link>
                </>
              ) : (
                 <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-red-700 hover:bg-slate-50">Dashboard</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo className="text-white mb-4 [&_span]:text-white" />
            <p className="text-sm text-slate-400 max-w-md">
              A SOC 2 Type 2 & ISO 27001 compliant platform dedicated to connecting patients with rare medication and expert medical advice. We simplify the complex logistics of healthcare.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-emerald-400">
              <ShieldCheck size={16} />
              <span>ISO 27001 Certified Platform</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/request-drug" className="hover:text-white transition">Order Medicine</Link></li>
              <li><Link to="/book-consult" className="hover:text-white transition">Book Expert</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Staff Access</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Compliance</h3>
            <ul className="space-y-2">
              <li><Link to="/legal/terms" className="hover:text-white transition">Terms of Use</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><span className="text-slate-500 cursor-not-allowed">Cookie Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EasygoPharm Inc. All rights reserved.</p>
          <p className="mt-2">Disclaimer: EasygoPharm does not provide direct medical advice.</p>
        </div>
      </footer>
    </div>
  );
};