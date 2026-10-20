import React from 'react';
import {
  Lightbulb,
  AlertOctagon,
  TrendingDown,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { CIVIC_THEME } from '../../constants/theme';

export const InsightsPage: React.FC = () => {
  const { insights, records, trends } = useCivic();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto print:p-2 print:space-y-4 bg-[#FBF7EF] text-[#182820]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Municipal Strategic Intelligence & Civic Insights
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Data-driven recommendations generated from empirical grievance distributions and sentiment indicators.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#073D32] bg-[#FFFDF8] border border-[#E7E0D3] rounded-full hover:bg-[#F5EFE6] transition-all whitespace-nowrap self-start md:self-auto print:hidden shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#15966A]" />
          <span>Print / Export Brief</span>
        </button>
      </div>

      {/* Executive Key Metric Band */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Dataset Base</span>
          <div className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
            {insights.summary_metrics.total_grievances}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            Verified logged complaints
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Citizen Dissatisfaction</span>
          <div className="text-3xl font-extrabold text-[#F16B5B] font-mono tabular-nums">
            {insights.summary_metrics.negative_sentiment_pct}%
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            Complaints reflecting outage or distress
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Highest Volume Domain</span>
          <div className="text-xl font-extrabold text-[#182820] truncate">
            {insights.summary_metrics.top_category}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            Primary municipal maintenance strain
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Severe Dissatisfaction Sector</span>
          <div className="text-xl font-extrabold text-[#E85A24] truncate">
            {insights.summary_metrics.highest_frustration_category}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3] font-mono font-bold">
            {insights.summary_metrics.highest_frustration_rate}% Negative Rate
          </div>
        </div>
      </div>

      {/* Automated Strategic Action Items */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#E85A24]" />
          <h3 className="text-base font-bold text-[#182820] font-serif">
            Automated Executive Action Items
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.automated_insights.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border shadow-xs space-y-3 ${
                item.type === 'alert'
                  ? 'bg-[#FBE2E0]/40 border-[#F7B7B1]'
                  : item.type === 'risk'
                  ? 'bg-[#FFF1C9]/40 border-[#FDE68A]'
                  : item.type === 'sentiment'
                  ? 'bg-[#FCE7D7]/40 border-[#FDBA74]'
                  : 'bg-[#DFF2E6]/40 border-[#A3E0C0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  item.type === 'alert' ? 'bg-[#FBE2E0] text-[#A62419]' :
                  item.type === 'risk' ? 'bg-[#FFF1C9] text-[#8F5C0A]' :
                  item.type === 'sentiment' ? 'bg-[#FCE7D7] text-[#7C2D12]' :
                  'bg-[#DFF2E6] text-[#073D32]'
                }`}>
                  {item.type}
                </span>
                <span className="text-xs font-mono text-[#687568]">Insight #{item.id}</span>
              </div>

              <h4 className="text-base font-bold text-[#182820] leading-snug">
                {item.title}
              </h4>

              <p className="text-xs text-[#182820]/80 leading-relaxed">
                {item.detail}
              </p>

              <div className="p-3.5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-xl text-xs space-y-1">
                <div className="font-bold text-[#073D32] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15966A]" />
                  Recommended Action:
                </div>
                <div className="text-[#687568] leading-relaxed pl-5">
                  {item.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
