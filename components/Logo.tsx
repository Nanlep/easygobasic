import React from 'react';
import { Pill } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="bg-red-700 p-2 rounded-lg">
      <Pill className="text-white w-6 h-6 -rotate-45" />
    </div>
    <span className="font-bold text-2xl tracking-tight text-slate-900">
      EasyGo<span className="text-red-700">Pharm</span>
    </span>
  </div>
);