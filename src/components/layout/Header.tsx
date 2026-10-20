import React from 'react';
import { Menu, Home, Sparkles } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

const TAB_TITLES: Record<string, string> = {
  home: 'CivicSense Landing Experience',
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
    setActiveTab,
    setMobileMenuOpen
  } = useCivic();

  return (
    <header className="h-16 px-4 md:px-6 bg-[#FFFDF8] border-b border-[#E7E0D3] flex items-center justify-between gap-4 md:gap-8 shrink-0 select-none">
      {/* Mobile Menu Toggle & Brand / Section Title */}
      <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-1.5 text-[#182820] hover:text-[#073D32] rounded-lg hover:bg-[#F5EFE6] transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className="text-sm md:text-base font-extrabold text-[#073D32] hover:text-[#E85A24] tracking-tight transition-colors font-serif"
          title="Return to Landing Page"
        >
          CivicSense
        </button>
        <span className="text-[#C4BCAB] font-light">/</span>
        <span className="text-xs md:text-sm font-bold text-[#182820] truncate max-w-[180px] sm:max-w-xs md:max-w-none">
          {TAB_TITLES[activeTab] || 'Grievance System'}
        </span>
      </div>

      {/* Action Zone: Return to Landing Page */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#073D32] bg-[#DFF2E6] hover:bg-[#cceed9] rounded-full border border-[#A3E0C0] transition-all shadow-2xs"
          title="Switch to Landing Page full presentation"
        >
          <Home className="w-3.5 h-3.5 text-[#073D32]" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>
      </div>
    </header>
  );
};
