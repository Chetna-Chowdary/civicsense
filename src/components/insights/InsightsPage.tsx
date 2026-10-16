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

export const InsightsPage: React.FC = () => {
  const { insights, records, trends } = useCivic();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto print:p-2 print:space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Strategic Intelligence & Civic Insights
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven recommendations generated from empirical grievance distributions and sentiment indicators.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap self-start md:self-auto print:hidden"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print / Export Brief</span>
        </button>
      </div>

      {/* Executive Key Metric Band */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Dataset Base</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {insights.summary_metrics.total_grievances}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Verified logged complaints
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Citizen Dissatisfaction</span>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {insights.summary_metrics.negative_sentiment_pct}%
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Complaints reflecting outage or distress
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Highest Volume Domain</span>
          <div className="text-xl font-bold text-slate-900 truncate">
            {insights.summary_metrics.top_category}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Primary municipal maintenance strain
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Severe Dissatisfaction Sector</span>
          <div className="text-xl font-bold text-amber-700 truncate">
            {insights.summary_metrics.highest_frustration_category}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 font-mono">
            {insights.summary_metrics.highest_frustration_rate}% negative sentiment
          </div>
        </div>
      </div>

      {/* Actionable Strategic Interventions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Automated Civic Interventions & Policy Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.automated_insights.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {item.type === 'alert' && <AlertOctagon className="w-4 h-4 text-rose-600" />}
                  {item.type === 'sentiment' && <TrendingDown className="w-4 h-4 text-amber-600" />}
                  {item.type === 'risk' && <Building2 className="w-4 h-4 text-indigo-600" />}
                  {item.type === 'opportunity' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  <span className="text-slate-500 uppercase tracking-wider text-[11px]">
                    Insight 0{item.id} · {item.type}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-900">Recommended Administrative Action:</span>
                <p className="text-slate-700 leading-relaxed">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Root-Cause Recurring Hot-Words */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Key Root-Cause Issues (NLP Extraction)</h3>
          <p className="text-xs text-slate-500">
            Terms with highest municipal co-occurrence extracted from citizen descriptions
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {insights.frequent_keywords.map((kw, i) => (
            <div key={kw.term} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px]">Rank 0{i + 1}</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{kw.term}</span>
              <span className="text-slate-500 font-mono block mt-0.5">{kw.count} grievance records</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
