
import React, { useState } from 'react';
import { Search, ListFilter, X } from 'lucide-react';

interface FilterState {
  search: string;
  status: string;
  urgency: string;
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void;
  statusOptions: string[];
  showUrgency?: boolean;
  placeholder?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onFilterChange, statusOptions, showUrgency = false, placeholder = 'Search by name, email, or drug...' }) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', status: 'ALL', urgency: 'ALL' });

  const update = (partial: Partial<FilterState>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  };

  const hasActiveFilters = filters.search || filters.status !== 'ALL' || filters.urgency !== 'ALL';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-grow max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
        />
      </div>

      <div className="flex items-center gap-2">
        <ListFilter size={14} className="text-slate-400" />
        <select
          value={filters.status}
          onChange={e => update({ status: e.target.value })}
          className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
        >
          <option value="ALL">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {showUrgency && (
        <select
          value={filters.urgency}
          onChange={e => update({ urgency: e.target.value })}
          className="text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
        >
          <option value="ALL">All Urgency</option>
          <option value="ROUTINE">Routine</option>
          <option value="URGENT">Urgent</option>
          <option value="CRITICAL">Critical</option>
        </select>
      )}

      {hasActiveFilters && (
        <button
          onClick={() => update({ search: '', status: 'ALL', urgency: 'ALL' })}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
};
