import React from 'react';
import { Menu } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Executive Overview',
  'data-management': 'Grievance Data Operations',
  'complaint-analysis': 'Category Classification (8 Domains)',
  'sentiment-analysis': 'Public Sentiment Polarity',
  'trend-analysis': 'Temporal & Frequency Trends',
  'complaint-explorer': 'Grievance Explorer & Search',
  'model-evaluation': 'Model Validation & Confusion Matrix',
  insights: 'Strategic Civic Insights'
};

export const Header: React.FC = () => {
  const {
    activeTab,
    setMobileMenuOpen
  } = useCivic();

  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 md:gap-8 shrink-0">
      {/* Mobile Menu Toggle & Brand / Section Title */}
      <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-sm md:text-base font-bold text-slate-900 tracking-tight">CivicSense</span>
        <span className="text-slate-300 font-light">/</span>
        <span className="text-xs md:text-sm font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-xs md:max-w-none">
          {TAB_TITLES[activeTab] || 'Grievance System'}
        </span>
      </div>
    </header>
  );
};
