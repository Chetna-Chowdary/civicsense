import React from 'react';
import {
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
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white tracking-tight truncate">CivicSense</h1>
              <p className="text-xs text-slate-400 truncate">Public Grievance NLP</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Analytics & Models
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
