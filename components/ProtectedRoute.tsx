
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { User, UserRole } from '../types';
import { Loader2, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="bg-red-100 p-4 rounded-2xl">
          <ShieldX className="text-red-600" size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 max-w-sm">Your role <strong className="text-slate-700">({user.role})</strong> does not have permission to access this section.</p>
      </div>
    );
  }

  return <>{children}</>;
};
