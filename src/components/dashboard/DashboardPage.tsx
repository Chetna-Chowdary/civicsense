import React from 'react';
import {
  FileText,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { useCivic } from '../../context/CivicContext';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#059669', // Emerald
  Negative: '#e11d48', // Rose
  Neutral: '#0284c7'   // Sky Blue
};

const CATEGORY_COLORS = [
  '#0f766e', // Teal
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ea580c', // Orange
  '#0d9488', // Drainage / Sewage (Teal Accent)
  '#64748b'  // Slate
];

export const DashboardPage: React.FC = () => {
  const { records, trends, insights, setActiveTab } = useCivic();

  const total = records.length;
  const negCount = records.filter(r => r.sentiment === 'Negative').length;
  const posCount = records.filter(r => r.sentiment === 'Positive').length;
  const neuCount = records.filter(r => r.sentiment === 'Neutral').length;

  const negPct = total > 0 ? Math.round((negCount / total) * 100) : 0;
  const posPct = total > 0 ? Math.round((posCount / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((neuCount / total) * 100) : 0;

  const topCategory = trends.category_breakdown[0]?.category || 'Roads';
  const topCategoryCount = trends.category_breakdown[0]?.count || 0;

  // Prepare Pie Data
  const sentimentPieData = [
    { name: 'Negative', value: negCount, color: SENTIMENT_COLORS.Negative },
    { name: 'Neutral', value: neuCount, color: SENTIMENT_COLORS.Neutral },
    { name: 'Positive', value: posCount, color: SENTIMENT_COLORS.Positive }
  ];

  // Recent 6 records
  const recentRecords = records.slice(0, 6);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            <span>Government Grievance & Public Sentiment Analysis</span>
            <span aria-hidden="true">·</span>
            <span>Public Service Monitoring</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">CivicSense Executive Intelligence Dashboard</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Live analytics derived from citizen grievances across public infrastructure. All metrics, sentiment classifications, and trends reflect the current active dataset.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('complaint-analysis')}
            className="px-4 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
          >
            Test Grievance Classifier
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Grievances */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Grievances</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {total}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span>Span: {trends.date_range.start || '2026-08'} to {trends.date_range.end || '2026-09'}</span>
          </div>
        </div>

        {/* KPI 2: Drainage & Sewage (Specific Focus Domain) */}
        <div className="p-5 bg-white border border-teal-200 bg-teal-50/20 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-800 font-semibold">
            <span>Drainage / Sewage</span>
            <AlertTriangle className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-900 font-mono tabular-nums">
              {records.filter(r => r.category === 'Drainage / Sewage').length}
            </span>
            <span className="text-xs font-semibold text-teal-700 font-mono">
              ({total > 0 ? Math.round((records.filter(r => r.category === 'Drainage / Sewage').length / total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-teal-100">
            Overflows, choked drains & sewer lines
          </div>
        </div>

        {/* KPI 3: Negative Sentiment */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Negative Sentiment</span>
            <Frown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 font-mono tabular-nums">{negCount}</span>
            <span className="text-xs font-semibold text-rose-700 font-mono">({negPct}%)</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Acute citizen distress or service outages
          </div>
        </div>

        {/* KPI 4: Positive Feedback */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Positive Feedback</span>
            <Smile className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 font-mono tabular-nums">{posCount}</span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">({posPct}%)</span>
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Resolution confirmations & appreciation
          </div>
        </div>

        {/* KPI 5: Dominant Domain */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Top Complaint Domain</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {topCategory}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Load: {topCategoryCount} complaints</span>
            <span className="font-mono tabular-nums font-semibold text-teal-700">
              {total > 0 ? Math.round((topCategoryCount / total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temporal Grievance Volume Area Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Temporal Grievance Trajectory</h3>
              <p className="text-xs text-slate-500">Daily logged public complaints across reporting period</p>
            </div>
            <button
              onClick={() => setActiveTab('trend-analysis')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrievance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => val.slice(5)}
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
                            Complaints: <span className="font-bold">{payload[0].value}</span>
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
                  fill="url(#areaGrievance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Donut Chart */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sentiment Distribution</h3>
            <p className="text-xs text-slate-500">Public tone calculated by NLP model</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} complaints`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <div className="text-slate-500">Negative</div>
              <div className="font-mono font-bold text-rose-600">{negCount} ({negPct}%)</div>
            </div>
            <div>
              <div className="text-slate-500">Neutral</div>
              <div className="font-mono font-bold text-sky-600">{neuCount} ({neuPct}%)</div>
            </div>
            <div>
              <div className="text-slate-500">Positive</div>
              <div className="font-mono font-bold text-emerald-600">{posCount} ({posPct}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Insights Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category-Wise Complaint Volume</h3>
              <p className="text-xs text-slate-500">Distribution across 8 public service domains</p>
            </div>
            <button
              onClick={() => setActiveTab('complaint-analysis')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>Explore Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.category_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-md space-y-1">
                          <p className="font-semibold text-slate-200">{label}</p>
                          <p className="text-teal-400 font-mono">
                            Volume: <span className="font-bold">{payload[0].value} complaints</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {trends.category_breakdown.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Civic Alert Card */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Critical Municipal Priority</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {insights.automated_insights[0]?.title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {insights.automated_insights[0]?.detail}
            </p>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900">Recommended Intervention:</div>
            <div className="text-slate-600 leading-relaxed">{insights.automated_insights[0]?.action}</div>
          </div>

          <button
            onClick={() => setActiveTab('insights')}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors text-center"
          >
            Review All Strategic Insights →
          </button>
        </div>
      </div>

      {/* Recent Grievance Activity Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Grievance Logs</h3>
            <p className="text-xs text-slate-500">Latest citizen submissions in current dataset</p>
          </div>
          <button
            onClick={() => setActiveTab('complaint-explorer')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>Open Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Grievance ID</th>
                <th className="px-6 py-3">Complaint Text</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Sentiment</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-slate-600 font-medium whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="px-6 py-3.5 text-slate-800 font-medium max-w-md truncate">
                    {item.complaint_text}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-700">
                    {item.category}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap font-medium">
                    <span className={
                      item.sentiment === 'Positive'
                        ? 'text-emerald-700'
                        : item.sentiment === 'Negative'
                        ? 'text-rose-700'
                        : 'text-sky-700'
                    }>
                      {item.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap truncate max-w-xs">
                    {item.ward_or_region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Label / Integrity Disclaimer */}
      <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800">Demonstration Dataset:</strong> This dashboard is pre-loaded with 100 structured citizen grievances adhering to the CPGRAMS format. To analyze external civic data, upload your CSV in the <strong>Data Management</strong> section.
        </div>
      </div>
    </div>
  );
};
