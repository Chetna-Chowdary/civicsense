import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Smile,
  Hash,
  Filter,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useCivic } from '../../context/CivicContext';
import { ALL_CATEGORIES } from '../../services/mlEngine';

export const TrendAnalysisPage: React.FC = () => {
  const { trends, records } = useCivic();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Select chart series based on timeframe
  const timeData =
    timeframe === 'daily'
      ? trends.daily_trends.map(d => ({ label: d.date.slice(5), count: d.count }))
      : timeframe === 'weekly'
      ? trends.weekly_trends.map(w => ({ label: `Wk ${w.week_start.slice(5)}`, count: w.count }))
      : trends.monthly_trends.map(m => ({ label: m.month, count: m.count }));

  // Cross Tabulation Data for Category vs Sentiment
  const crossData = ALL_CATEGORIES.map(cat => {
    const row = trends.category_sentiment_cross[cat] || { Positive: 0, Negative: 0, Neutral: 0 };
    return {
      category: cat,
      Negative: row.Negative || 0,
      Neutral: row.Neutral || 0,
      Positive: row.Positive || 0
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Temporal Trends & Issue Frequency Analysis</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily, weekly, and monthly grievance volumes, category shifts, and recurring keyword patterns over time.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              timeframe === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              timeframe === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              timeframe === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Main Time-Series Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Grievance Filing Volume
            </h3>
            <p className="text-xs text-slate-500">
              Aggregate count of public complaints logged over reporting timeline
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {trends.total_records} Total Grievances
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-md space-y-1">
                        <p className="font-semibold text-slate-200">{label}</p>
                        <p className="text-teal-400 font-mono">
                          Count: <span className="font-bold">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0f766e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross Tabulation: Category vs Sentiment Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Category-Wise Sentiment Breakdown (Cross-Tabulation)
          </h3>
          <p className="text-xs text-slate-500">
            Compare negative frustration against positive appreciation and neutral queries per domain
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crossData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#475569' }}
                angle={-18}
                textAnchor="end"
                interval={0}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Negative" fill="#e11d48" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" fill="#0284c7" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Positive" fill="#059669" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Frequently Reported Terms & Recurring Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Unigram Keywords */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Frequently Reported Keywords (Unigrams)
              </h3>
              <p className="text-xs text-slate-500">Highest frequency words after stopword cleaning</p>
            </div>
            <Hash className="w-4 h-4 text-teal-600" />
          </div>

          <div className="space-y-2">
            {trends.frequent_keywords.slice(0, 8).map((kw, idx) => {
              const maxCount = trends.frequent_keywords[0]?.count || 1;
              const pct = Math.round((kw.count / maxCount) * 100);
              return (
                <div key={kw.term} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 font-mono">
                      {idx + 1}. {kw.term}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {kw.count} occurrences
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Bigram Phrases */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recurring Civic Phrases (Bigrams)
              </h3>
              <p className="text-xs text-slate-500">Co-occurring 2-word grievance patterns</p>
            </div>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="space-y-2">
            {trends.frequent_phrases.slice(0, 8).map((phrase, idx) => {
              const maxCount = trends.frequent_phrases[0]?.count || 1;
              const pct = Math.round((phrase.count / maxCount) * 100);
              return (
                <div key={phrase.term} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 font-mono">
                      {idx + 1}. "{phrase.term}"
                    </span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {phrase.count} occurrences
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Specific Focus: Drainage / Sewage Trajectory & Hotspots */}
      <div className="p-6 bg-teal-950 text-white rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-800/60 pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
              Dedicated Sector Analysis
            </span>
            <h3 className="text-base font-bold text-white">Drainage & Sewage Grievance Trajectory</h3>
          </div>
          <div className="text-xs font-mono text-teal-300">
            {records.filter(r => r.category === 'Drainage / Sewage').length} Verified Incidents Logged
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Monitors sewer blockages, manhole backflows, pipeline leaks, and stormwater waterlogging. Real-time NLP filters distinguish wastewater infrastructure failures from municipal drinking water supply.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {records.filter(r => r.category === 'Drainage / Sewage').slice(0, 3).map((dr) => (
            <div key={dr.id} className="p-3 bg-teal-900/40 rounded-lg border border-teal-800/80 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-teal-300">{dr.id}</span>
                <span className="text-[11px] text-teal-200/80 font-mono">{dr.date}</span>
              </div>
              <p className="text-slate-200 line-clamp-2">"{dr.complaint_text}"</p>
              <div className="text-[11px] text-teal-400 flex justify-between pt-1 border-t border-teal-800/60">
                <span>{dr.ward_or_region}</span>
                <span className="font-semibold text-rose-300">{dr.urgency} Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
