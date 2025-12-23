import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <FileQuestion size={64} className="text-slate-400" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Page Not Found</h1>
      <p className="text-lg text-slate-600 max-w-md mb-8">
        We couldn't find the page you're looking for. It might have been removed or the link is incorrect.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-red-700 hover:bg-red-800 transition-colors"
      >
        <Home className="mr-2" size={20} />
        Return Home
      </Link>
    </div>
  );
};