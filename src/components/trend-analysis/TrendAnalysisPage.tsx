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
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';

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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Temporal Trends & Issue Frequency Analysis
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Track daily, weekly, and monthly grievance volumes, category shifts, and recurring keyword patterns over time.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-[#F5EFE6] p-1 rounded-full border border-[#E7E0D3]">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              timeframe === 'daily'
                ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                : 'text-[#687568] hover:text-[#182820]'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              timeframe === 'weekly'
                ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                : 'text-[#687568] hover:text-[#182820]'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              timeframe === 'monthly'
                ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                : 'text-[#687568] hover:text-[#182820]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Main Time-Series Area Chart (Emerald & Forest Green) */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#182820] font-serif">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Grievance Filing Volume
            </h3>
            <p className="text-xs text-[#687568]">
              Aggregate count of public complaints logged over reporting timeline
            </p>
          </div>
          <div className="text-xs font-bold text-[#073D32] bg-[#DFF2E6] px-3 py-1 rounded-full font-mono">
            {trends.total_records} Total Grievances
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendAreaWarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15966A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#15966A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#687568' }}
                axisLine={{ stroke: '#E7E0D3' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#687568' }}
                axisLine={{ stroke: '#E7E0D3' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#182820] text-[#FFFDF8] p-3 rounded-xl text-xs shadow-xl space-y-1 border border-[#E7E0D3]">
                        <p className="font-bold text-[#FFFDF8]">{label}</p>
                        <p className="text-[#15966A] font-mono font-bold">
                          Volume: {payload[0].value} complaints
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
                stroke="#073D32"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trendAreaWarm)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross Tabulation: Category vs Sentiment Distribution */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#182820] font-serif">
            Category-Wise Sentiment Breakdown (Cross-Tabulation)
          </h3>
          <p className="text-xs text-[#687568]">
            Compare Negative (Coral), Neutral (Golden Yellow), and Positive (Emerald) per domain
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crossData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#687568' }}
                angle={-18}
                textAnchor="end"
                interval={0}
                axisLine={{ stroke: '#E7E0D3' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#687568' }}
                axisLine={{ stroke: '#E7E0D3' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#182820', borderRadius: '10px', border: '1px solid #E7E0D3', color: '#FFFDF8', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Negative" name="Negative (Coral)" fill="#F16B5B" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" name="Neutral (Golden Yellow)" fill="#F2B544" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Positive" name="Positive (Emerald Green)" fill="#15966A" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Frequently Reported Terms & Recurring Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Unigram Keywords */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider">
                Frequently Reported Keywords (Unigrams)
              </h3>
              <p className="text-xs text-[#687568]">Highest frequency words after stopword cleaning</p>
            </div>
            <Hash className="w-4 h-4 text-[#15966A]" />
          </div>

          <div className="space-y-2">
            {trends.frequent_keywords.slice(0, 8).map((kw) => {
              const maxCount = trends.frequent_keywords[0]?.count || 1;
              const pct = Math.round((kw.count / maxCount) * 100);
              return (
                <div key={kw.term} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#182820] font-mono">{kw.term}</span>
                    <span className="text-[#687568] font-mono">{kw.count} occurrences</span>
                  </div>
                  <div className="w-full h-2 bg-[#F5EFE6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#15966A] rounded-full"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Recurring Phrases */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider">
                Key Civic Phrases (N-Grams)
              </h3>
              <p className="text-xs text-[#687568]">Recurring multi-word expressions in complaints</p>
            </div>
            <Layers className="w-4 h-4 text-[#E85A24]" />
          </div>

          <div className="space-y-2">
            {trends.frequent_phrases.slice(0, 8).map((ph) => {
              const maxCount = trends.frequent_phrases[0]?.count || 1;
              const pct = Math.round((ph.count / maxCount) * 100);
              return (
                <div key={ph.term} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#182820] font-mono">{ph.term}</span>
                    <span className="text-[#687568] font-mono">{ph.count} occurrences</span>
                  </div>
                  <div className="w-full h-2 bg-[#F5EFE6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E85A24] rounded-full"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
