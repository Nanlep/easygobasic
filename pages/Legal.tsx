import React from 'react';
import { useLocation } from 'react-router-dom';
import { TERMS_TEXT, PRIVACY_TEXT } from '../constants';

export const Legal: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');
  
  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Use'}
        </h1>
        <div className="prose prose-slate max-w-none">
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed">
            {isPrivacy ? PRIVACY_TEXT : TERMS_TEXT}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200 text-sm text-slate-500">
          Last Updated: {new Date().toLocaleDateString()} | Compliance ID: ISO-27001-EGP-2024
        </div>
      </div>
    </div>
  );
};