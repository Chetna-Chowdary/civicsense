import React from 'react';
import {
  Home,
  LayoutDashboard,
  Database,
  Tag,
  SmilePlus,
  TrendingUp,
  TableProperties,
  BrainCircuit,
  Lightbulb,
  Layers,
  X
} from 'lucide-react';
import { useCivic, NavigationTab } from '../../context/CivicContext';

const NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Landing Page', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'data-management', label: 'Data Management', icon: Database },
  { id: 'complaint-analysis', label: 'Complaint Analysis', icon: Tag },
  { id: 'sentiment-analysis', label: 'Sentiment Analysis', icon: SmilePlus },
  { id: 'trend-analysis', label: 'Trend Analysis', icon: TrendingUp },
  { id: 'complaint-explorer', label: 'Complaint Explorer', icon: TableProperties },
  { id: 'model-evaluation', label: 'Model Evaluation', icon: BrainCircuit },
  { id: 'insights', label: 'Strategic Insights', icon: Lightbulb }
];

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useCivic();

  const handleNavClick = (id: NavigationTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#182820]/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Content (Deep Forest Green with Warm Cream Text & Colourful Indicators) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-[#073D32] text-[#EAE6DC] flex flex-col border-r border-[#0D4E41] select-none transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#0D4E41] flex items-center justify-between">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            title="Go to Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-[#15966A]/20 border border-[#15966A]/40 flex items-center justify-center shrink-0 group-hover:bg-[#15966A]/30 transition-colors">
              <Layers className="w-5 h-5 text-[#15966A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center">
                <span className="text-base font-black text-[#FFFDF8] tracking-tight font-serif">Civic</span>
                <span className="text-base font-black text-[#E85A24] tracking-tight font-serif">Sense</span>
              </div>
              <p className="text-[11px] text-[#A8B99A] truncate font-medium">Public Grievance NLP</p>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#A8B99A] hover:text-[#FFFDF8] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-[#A8B99A] uppercase">
            Civic Intelligence
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-[#15966A]/30 text-[#FFFDF8] border border-[#15966A]/60 shadow-xs'
                    : 'text-[#DFF2E6]/80 hover:text-[#FFFDF8] hover:bg-[#0A4B3E]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#15966A]' : 'text-[#A8B99A]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#E85A24] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status / Model Signature */}
        <div className="p-4 border-t border-[#0D4E41] text-[11px] text-[#A8B99A]">
          <div className="font-semibold text-[#FFFDF8]">TF-IDF + Logistic Regression</div>
          <div className="opacity-80">8 Domains · Calibrated Probs</div>
        </div>
      </aside>
    </>
  );
};
