import React, { useState, useMemo } from 'react';
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
  Sparkles,
  MapPin,
  CheckCircle2,
  Filter,
  Clock,
  Copy,
  Users,
  Building,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import { useCivic } from '../../context/CivicContext';
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';
import { ALL_CATEGORIES, ALL_SENTIMENTS } from '../../services/mlEngine';
import { ServiceCategory, SentimentType } from '../../types';

export const DashboardPage: React.FC = () => {
  const { records, trends, setActiveTab, navigateToExplorer } = useCivic();

  // Dashboard-level active filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<string>('All');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('All');

  // Filtered dataset for local calculations
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchCat = selectedCategoryFilter === 'All' || r.category === selectedCategoryFilter;
      const matchSent = selectedSentimentFilter === 'All' || r.sentiment === selectedSentimentFilter;
      const matchWard = selectedWardFilter === 'All' || r.ward_or_region === selectedWardFilter;
      return matchCat && matchSent && matchWard;
    });
  }, [records, selectedCategoryFilter, selectedSentimentFilter, selectedWardFilter]);

  const total = filteredRecords.length;
  const negCount = filteredRecords.filter(r => r.sentiment === 'Negative').length;
  const posCount = filteredRecords.filter(r => r.sentiment === 'Positive').length;
  const neuCount = filteredRecords.filter(r => r.sentiment === 'Neutral').length;

  const negPct = total > 0 ? Math.round((negCount / total) * 100) : 0;
  const posPct = total > 0 ? Math.round((posCount / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((neuCount / total) * 100) : 0;

  const drainageCount = filteredRecords.filter(r => r.category === 'Drainage / Sewage').length;
  const drainagePct = total > 0 ? Math.round((drainageCount / total) * 100) : 0;

  // Donut chart data
  const sentimentDonutData = [
    { name: 'Positive', value: posCount, color: SENTIMENT_THEME.Positive.color },
    { name: 'Neutral', value: neuCount, color: SENTIMENT_THEME.Neutral.color },
    { name: 'Negative', value: negCount, color: SENTIMENT_THEME.Negative.color }
  ];

  // Daily Trends data with anomaly alerts
  const dailyData = trends.daily_trends.map(d => ({
    date: d.date,
    count: d.count,
    is_anomaly: d.is_anomaly,
    expected: d.expected || 2
  }));

  // Category vs Sentiment Stacked Bar Chart data
  const stackedData = (trends.category_sentiment_stacked || []).map(item => ({
    category: item.category,
    Positive: item.Positive,
    Neutral: item.Neutral,
    Negative: item.Negative,
    total: item.total
  }));

  // Department Comparisons
  const deptData = (trends.department_breakdown || []).slice(0, 6);

  // Resolution Analytics
  const resolution = trends.resolution_analytics || {
    open_cases: Math.round(total * 0.4),
    in_progress_cases: Math.round(total * 0.3),
    resolved_cases: Math.round(total * 0.3),
    total_cases: total,
    resolution_rate_pct: 35.0,
    backlog_count: Math.round(total * 0.7),
    median_resolution_days: 3.5
  };

  // Priority queue
  const priorityData = trends.priority_scoring || {
    distribution: { Critical: 12, High: 25, Medium: 40, Low: 23 },
    high_priority_queue: []
  };

  // Duplicate candidates
  const duplicates = trends.duplicate_candidates || [];

  // Top domains ranked
  const domainRankings = trends.category_breakdown.slice(0, 6).map(item => {
    const theme = DOMAIN_THEME[item.category] || DOMAIN_THEME['Other Public Services'];
    return {
      category: item.category,
      count: item.count,
      color: theme.color,
      pct: total > 0 ? Math.round((item.count / total) * 100) : 0
    };
  });

  // Wards list for filter
  const allWards = useMemo(() => {
    return Array.from(new Set(records.map(r => r.ward_or_region))).filter(Boolean).sort();
  }, [records]);

  const resetFilters = () => {
    setSelectedCategoryFilter('All');
    setSelectedSentimentFilter('All');
    setSelectedWardFilter('All');
  };

  const hasActiveFilters = selectedCategoryFilter !== 'All' || selectedSentimentFilter !== 'All' || selectedWardFilter !== 'All';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* 
        ========================================================================
        HEADER BANNER & INTERACTIVE FILTER BAR
        ========================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[#DFF2E6]/40 via-[#FCE7D7]/30 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#073D32]">
            <span className="w-2 h-2 rounded-full bg-[#15966A] animate-pulse" />
            <span>Civic Intelligence & Public Sentiment System</span>
            <span className="text-[#A8B99A]">·</span>
            <span className="text-[#E85A24]">8 Public Service Domains</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#182820] font-serif">
            Executive Grievance & Sentiment Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[#687568] max-w-2xl leading-relaxed">
            Multi-domain civic diagnostics: TF-IDF feature extraction, Logistic Regression sentiment polarity, resolution SLAs, and operational priority ranking.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('complaint-analysis')}
            className="px-5 py-2.5 text-xs font-bold bg-[#073D32] hover:bg-[#0c4e40] text-[#FFFDF8] rounded-full transition-all shadow-xs hover:shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#15966A]" />
            <span>Classify New Grievance</span>
          </button>
          <button
            onClick={() => navigateToExplorer()}
            className="px-4 py-2.5 text-xs font-bold bg-[#FFFDF8] hover:bg-[#F5EFE6] text-[#073D32] border border-[#E7E0D3] rounded-full transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#E85A24]" />
            <span>Explore All ({records.length})</span>
          </button>
        </div>
      </div>

      {/* Interactive Global Dashboard Filter Toolbar */}
      <div className="p-4 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#073D32]">
            <Filter className="w-3.5 h-3.5 text-[#15966A]" />
            <span>Filter View:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBF7EF] border border-[#E7E0D3] rounded-lg text-xs font-semibold text-[#182820] focus:outline-none focus:ring-1 focus:ring-[#15966A]"
          >
            <option value="All">All Categories (8)</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select
            value={selectedSentimentFilter}
            onChange={(e) => setSelectedSentimentFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBF7EF] border border-[#E7E0D3] rounded-lg text-xs font-semibold text-[#182820] focus:outline-none focus:ring-1 focus:ring-[#15966A]"
          >
            <option value="All">All Sentiments</option>
            {ALL_SENTIMENTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWardFilter}
            onChange={(e) => setSelectedWardFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBF7EF] border border-[#E7E0D3] rounded-lg text-xs font-semibold text-[#182820] focus:outline-none focus:ring-1 focus:ring-[#15966A]"
          >
            <option value="All">All Wards / Regions</option>
            {allWards.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FCE7D7] text-[#E85A24] font-bold rounded-lg hover:bg-[#ebd5c3] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-[#687568]">
          Showing <span className="font-mono font-bold text-[#182820]">{total}</span> of {records.length} records
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 1: KPI CARDS (Rich Colourful Cards matching Reference Identity)
        ========================================================================
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Grievances */}
        <div
          onClick={() => navigateToExplorer({ category: selectedCategoryFilter !== 'All' ? selectedCategoryFilter : undefined })}
          className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 cursor-pointer group hover:border-[#15966A] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#687568]">
            <span>Active Grievances</span>
            <div className="w-8 h-8 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#073D32] group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4 text-[#15966A]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
            {total}
          </div>
          <div className="flex items-end gap-1.5 h-7 pt-1">
            <div className="w-2 h-3 bg-[#15966A]/40 rounded-t-xs" />
            <div className="w-2 h-5 bg-[#15966A]/60 rounded-t-xs" />
            <div className="w-2 h-4 bg-[#15966A]/50 rounded-t-xs" />
            <div className="w-2 h-6 bg-[#15966A]/80 rounded-t-xs" />
            <div className="w-2 h-7 bg-[#073D32] rounded-t-xs" />
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
            <span>Click to explore records</span>
            <ArrowRight className="w-3 h-3 text-[#15966A] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 2: Drainage & Sewage */}
        <div
          onClick={() => navigateToExplorer({ category: 'Drainage / Sewage' })}
          className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 cursor-pointer group hover:border-[#E85A24] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#7C2D12]">
            <span>Drainage / Sewage</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF1C9] flex items-center justify-center text-[#E85A24] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 text-[#E85A24]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#E85A24] font-mono tabular-nums">
              {drainageCount}
            </span>
            <span className="text-xs font-bold text-[#7C2D12] font-mono">
              ({drainagePct}%)
            </span>
          </div>
          <div className="text-[11px] text-[#7C2D12] bg-[#FFF1C9]/80 px-2.5 py-1 rounded-lg">
            Sewer overflows & choke alerts
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
            <span>Special 8th Domain</span>
            <ArrowRight className="w-3 h-3 text-[#E85A24] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 3: Negative Sentiment */}
        <div
          onClick={() => navigateToExplorer({ sentiment: 'Negative' })}
          className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 cursor-pointer group hover:border-[#F16B5B] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#A62419]">
            <span>Negative Sentiment</span>
            <div className="w-8 h-8 rounded-lg bg-[#FBE2E0] flex items-center justify-center text-[#F16B5B] group-hover:scale-110 transition-transform">
              <Frown className="w-4 h-4 text-[#F16B5B]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F16B5B] font-mono tabular-nums">
              {negCount}
            </span>
            <span className="text-xs font-bold text-[#A62419] font-mono">
              ({negPct}%)
            </span>
          </div>
          <div className="text-[11px] text-[#A62419] bg-[#FBE2E0]/80 px-2.5 py-1 rounded-lg">
            Acute citizen dissatisfaction
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
            <span>Filter negative cases</span>
            <ArrowRight className="w-3 h-3 text-[#F16B5B] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 4: Positive Feedback */}
        <div
          onClick={() => navigateToExplorer({ sentiment: 'Positive' })}
          className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 cursor-pointer group hover:border-[#15966A] transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#073D32]">
            <span>Positive Feedback</span>
            <div className="w-8 h-8 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#15966A] group-hover:scale-110 transition-transform">
              <Smile className="w-4 h-4 text-[#15966A]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#15966A] font-mono tabular-nums">
              {posCount}
            </span>
            <span className="text-xs font-bold text-[#073D32] font-mono">
              ({posPct}%)
            </span>
          </div>
          <div className="text-[11px] text-[#073D32] bg-[#DFF2E6]/80 px-2.5 py-1 rounded-lg">
            Repairs completed on time
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
            <span>Filter positive cases</span>
            <ArrowRight className="w-3 h-3 text-[#15966A] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 5: Resolution Rate */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 group hover:border-[#073D32] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#073D32]">
            <span>Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
              <CheckCircle2 className="w-4 h-4 text-[#15966A]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
              {resolution.resolution_rate_pct}%
            </span>
            <span className="text-xs text-[#687568]">
              ({resolution.resolved_cases}/{resolution.total_cases})
            </span>
          </div>
          <div className="w-full bg-[#E7E0D3] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#15966A] h-full rounded-full transition-all"
              style={{ width: `${resolution.resolution_rate_pct}%` }}
            />
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3] flex items-center justify-between">
            <span>Backlog: {resolution.backlog_count}</span>
            <span>~{resolution.median_resolution_days}d SLA</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 2: REFERENCE LAPTOP CHARTS (Sentiment Donut, Spatial Map, Top Domains)
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sentiment Donut with Center Smile */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Sentiment Distribution</h3>
              <p className="text-xs text-[#687568]">Click any slice to filter complaints</p>
            </div>
            <button
              onClick={() => setActiveTab('sentiment-analysis')}
              className="text-xs font-bold text-[#15966A] hover:text-[#073D32] flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  className="cursor-pointer"
                  onClick={(entry) => navigateToExplorer({ sentiment: entry.name })}
                >
                  {sentimentDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} complaints`, name]}
                  contentStyle={{
                    backgroundColor: '#182820',
                    borderRadius: '10px',
                    border: '1px solid #E7E0D3',
                    color: '#FFFDF8',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Smile className="w-9 h-9 text-[#15966A]" />
              <span className="text-[10px] font-bold text-[#073D32] uppercase tracking-wider mt-0.5">Tone</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E7E0D3] text-center text-xs">
            <button
              onClick={() => navigateToExplorer({ sentiment: 'Positive' })}
              className="p-2 rounded-xl bg-[#DFF2E6]/60 hover:bg-[#DFF2E6] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-1 text-[#073D32] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#15966A]" />
                Positive
              </div>
              <div className="font-mono font-bold text-[#073D32]">{posCount} ({posPct}%)</div>
            </button>
            <button
              onClick={() => navigateToExplorer({ sentiment: 'Neutral' })}
              className="p-2 rounded-xl bg-[#FFF1C9]/60 hover:bg-[#FFF1C9] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-1 text-[#8F5C0A] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F2B544]" />
                Neutral
              </div>
              <div className="font-mono font-bold text-[#8F5C0A]">{neuCount} ({neuPct}%)</div>
            </button>
            <button
              onClick={() => navigateToExplorer({ sentiment: 'Negative' })}
              className="p-2 rounded-xl bg-[#FBE2E0]/60 hover:bg-[#FBE2E0] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-1 text-[#A62419] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F16B5B]" />
                Negative
              </div>
              <div className="font-mono font-bold text-[#A62419]">{negCount} ({negPct}%)</div>
            </button>
          </div>
        </div>

        {/* Chart 2: Municipal Geographic Density Map with Pins */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Municipal Spatial Density</h3>
              <p className="text-xs text-[#687568]">Interactive ward grievance pins</p>
            </div>
            <span className="text-[11px] font-bold text-[#073D32] bg-[#DFF2E6] px-2.5 py-0.5 rounded-full">
              Live Map
            </span>
          </div>

          <div className="relative h-56 w-full rounded-xl bg-[#F5EFE6]/70 border border-[#E7E0D3] overflow-hidden flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full opacity-35 stroke-[#687568]" viewBox="0 0 400 240">
              <path d="M20,40 Q90,90 180,60 T350,110" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M40,200 Q150,120 260,180 T390,140" fill="none" strokeWidth="1.5" />
              <path d="M120,10 Q140,110 160,220" fill="none" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M280,20 Q260,130 300,230" fill="none" strokeWidth="1" />
              <circle cx="110" cy="80" r="45" fill="#DFF2E6" opacity="0.5" />
              <circle cx="280" cy="90" r="50" fill="#FCE7D7" opacity="0.4" />
              <circle cx="200" cy="160" r="40" fill="#FFF1C9" opacity="0.5" />
            </svg>

            {/* Pin 1: Ward 3 Central */}
            <div
              onClick={() => navigateToExplorer({ search: 'Ward 3' })}
              className="absolute left-[24%] top-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#E85A24] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#E85A24] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Ward 3 Central
              </span>
            </div>

            {/* Pin 2: Sector 7 North */}
            <div
              onClick={() => navigateToExplorer({ search: 'Ward 7' })}
              className="absolute left-[75%] top-[24%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#073D32] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#073D32] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Ward 7 North
              </span>
            </div>

            {/* Pin 3: Ring Road South */}
            <div
              onClick={() => navigateToExplorer({ search: 'Ward 1' })}
              className="absolute left-[52%] top-[62%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#15966A] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#15966A] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Ward 1 South
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E7E0D3]">
            <span className="text-[#687568]">Active Wards:</span>
            <div className="flex flex-wrap gap-1">
              {allWards.slice(0, 4).map(w => (
                <button
                  key={w}
                  onClick={() => navigateToExplorer({ search: w })}
                  className="text-[10px] font-bold text-[#182820] bg-[#F5EFE6] hover:bg-[#e6ddce] px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Top Complaint Domains Ranked */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Top Complaint Domains</h3>
              <p className="text-xs text-[#687568]">Click bar to filter complaints</p>
            </div>
            <button
              onClick={() => setActiveTab('complaint-analysis')}
              className="text-xs font-bold text-[#15966A] hover:text-[#073D32] flex items-center gap-1 cursor-pointer"
            >
              <span>Classifier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 my-auto py-1">
            {domainRankings.map((dom) => (
              <div
                key={dom.category}
                onClick={() => navigateToExplorer({ category: dom.category })}
                className="space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#182820] group-hover:text-[#073D32] transition-colors">
                    {dom.category}
                  </span>
                  <span className="font-mono font-bold text-[#687568]">{dom.count} cases</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#F5EFE6] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
                    style={{
                      width: `${Math.min(100, Math.max(12, (dom.count / (domainRankings[0]?.count || 1)) * 100))}%`,
                      backgroundColor: dom.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E7E0D3] text-[11px] text-[#687568] flex items-center justify-between">
            <span>TF-IDF + Logistic Regression</span>
            <span className="font-bold text-[#073D32]">8 Dedicated Domains</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 3: COMPLAINT TRENDS WITH TRANSPARENT ANOMALY SPIKE DETECTION
        ========================================================================
      */}
      <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#182820] font-serif">Daily Complaint Trends & Anomaly Trajectory</h3>
              <span className="text-[11px] font-bold text-[#E85A24] bg-[#FFF1C9] px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#E85A24]" />
                Statistical Spike Detection
              </span>
            </div>
            <p className="text-xs text-[#687568]">
              Daily logged public grievances with red flag alerts when volume exceeds 1.96 standard deviations from historical baseline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('trend-analysis')}
              className="text-xs font-bold text-[#073D32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Weekly/Monthly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#687568' }}
                tickFormatter={(val) => val.slice(5)}
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
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#182820] text-[#FFFDF8] p-3 rounded-xl text-xs shadow-xl space-y-1 border border-[#E7E0D3]">
                        <p className="font-bold text-[#FFFDF8]">{label}</p>
                        <p className="text-[#15966A] font-mono">
                          Complaints Logged: <span className="font-bold">{item.count}</span>
                        </p>
                        <p className="text-[#A8B99A] font-mono">
                          Expected Baseline: {item.expected}
                        </p>
                        {item.is_anomaly && (
                          <p className="text-[#F16B5B] font-bold flex items-center gap-1 pt-1">
                            ⚠️ Anomaly Spike Detected
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell
                    key={`daily-bar-${index}`}
                    fill={entry.is_anomaly ? '#E85A24' : index % 2 === 0 ? '#15966A' : '#F2B544'}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#073D32"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="Baseline"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 4: EXTENDED ANALYTICS
        1. Category vs Sentiment Stacked Bar Chart
        2. Department & Ward Breakdown
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category vs Sentiment Stacked Bar Chart */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Category vs. Sentiment Breakdown</h3>
              <p className="text-xs text-[#687568]">Stacked sentiment polarity by public service domain</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-[#073D32]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15966A]" /> Pos
              </span>
              <span className="flex items-center gap-1 text-[#8F5C0A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2B544]" /> Neu
              </span>
              <span className="flex items-center gap-1 text-[#A62419]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F16B5B]" /> Neg
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#687568' }}
                  tickFormatter={(val) => val.slice(0, 5)}
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
                          <p className="text-[#15966A]">Positive: {payload[0]?.value}</p>
                          <p className="text-[#F2B544]">Neutral: {payload[1]?.value}</p>
                          <p className="text-[#F16B5B]">Negative: {payload[2]?.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="Positive"
                  stackId="a"
                  fill="#15966A"
                  className="cursor-pointer"
                  onClick={(data: any) => navigateToExplorer({ category: data?.category, sentiment: 'Positive' })}
                />
                <Bar
                  dataKey="Neutral"
                  stackId="a"
                  fill="#F2B544"
                  className="cursor-pointer"
                  onClick={(data: any) => navigateToExplorer({ category: data?.category, sentiment: 'Neutral' })}
                />
                <Bar
                  dataKey="Negative"
                  stackId="a"
                  fill="#F16B5B"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(data: any) => navigateToExplorer({ category: data?.category, sentiment: 'Negative' })}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Volume and Frustration Ranking */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Department Performance & Strain</h3>
              <p className="text-xs text-[#687568]">Volume and negative sentiment proportion by department</p>
            </div>
            <span className="text-xs font-bold text-[#073D32] bg-[#DFF2E6] px-2.5 py-0.5 rounded-full">
              Ranked
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {deptData.map(dept => (
              <div
                key={dept.department}
                onClick={() => navigateToExplorer({ search: dept.department })}
                className="p-3 rounded-xl bg-[#FBF7EF] border border-[#E7E0D3] hover:border-[#073D32] transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#182820]">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#687568]">{dept.count} cases</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      dept.negative_rate > 50 ? 'bg-[#FBE2E0] text-[#A62419]' : 'bg-[#DFF2E6] text-[#073D32]'
                    }`}>
                      {dept.negative_rate}% Negative
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E7E0D3] overflow-hidden flex">
                  <div className="bg-[#15966A] h-full" style={{ width: `${dept.count > 0 ? (dept.positive_count / dept.count) * 100 : 0}%` }} />
                  <div className="bg-[#F16B5B] h-full" style={{ width: `${dept.negative_rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 5: OPERATIONAL EXCELLENCE & NLP INTELLIGENCE
        1. Grievance Priority Queue (0-100 Score)
        2. Duplicate / Repeat Complaint Detection
        3. Frequent Civic Terminology (Unigrams & Bigrams)
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Grievance Priority Queue */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">High-Priority Dispatch Queue</h3>
              <p className="text-xs text-[#687568]">Rule-based priority scoring (0-100)</p>
            </div>
            <span className="text-[11px] font-bold text-white bg-[#E85A24] px-2 py-0.5 rounded-full">
              {priorityData.high_priority_queue.length} Critical
            </span>
          </div>

          <div className="space-y-2.5">
            {priorityData.high_priority_queue.slice(0, 4).map(item => (
              <div
                key={item.id}
                onClick={() => navigateToExplorer({ search: item.id })}
                className="p-3 rounded-xl bg-[#FBF7EF] border border-[#E7E0D3] hover:border-[#E85A24] transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#073D32]">{item.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE7D7] text-[#E85A24]">
                    Score: {item.score} / 100
                  </span>
                </div>
                <p className="text-xs text-[#182820] font-medium line-clamp-1">
                  {item.text}
                </p>
                <span className="text-[10px] font-bold text-[#687568]">
                  Domain: {item.category}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E7E0D3] text-xs text-[#687568] flex items-center justify-between">
            <span>Critical Tier: {priorityData.distribution.Critical}</span>
            <span>High: {priorityData.distribution.High}</span>
            <span>Med: {priorityData.distribution.Medium}</span>
          </div>
        </div>

        {/* Duplicate / Similar Complaint Detection Alert */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Duplicate Detection</h3>
              <p className="text-xs text-[#687568]">TF-IDF cosine similarity (&gt;70%)</p>
            </div>
            <span className="text-[11px] font-bold text-[#073D32] bg-[#DFF2E6] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Copy className="w-3 h-3 text-[#15966A]" />
              {duplicates.length} Pairs
            </span>
          </div>

          {duplicates.length > 0 ? (
            <div className="space-y-3">
              {duplicates.slice(0, 3).map((dup, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FFFDF8] border border-[#E7E0D3] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#073D32]">{dup.category}</span>
                    <span className="text-[10px] font-mono font-bold text-[#E85A24] bg-[#FFF1C9] px-2 py-0.5 rounded-full">
                      {Math.round(dup.similarity_score * 100)}% match
                    </span>
                  </div>
                  <div className="text-[#687568] text-[11px] space-y-0.5">
                    <p className="truncate"><strong>{dup.primary_id}:</strong> {dup.primary_text}</p>
                    <p className="truncate"><strong>{dup.similar_id}:</strong> {dup.similar_text}</p>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-[#687568] italic">
                *Records flagged for municipal merge or grouped response without deleting original submissions.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#687568] space-y-1">
              <CheckCircle2 className="w-6 h-6 text-[#15966A] mx-auto" />
              <p>No high-similarity duplicate complaints detected in active filter.</p>
            </div>
          )}
        </div>

        {/* Text Analysis: Frequent Terms & Phrases */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Frequent Civic Terms</h3>
              <p className="text-xs text-[#687568]">Cleaned unigrams & bigrams</p>
            </div>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs font-bold text-[#15966A] hover:text-[#073D32] flex items-center gap-1 cursor-pointer"
            >
              <span>Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-bold text-[#687568] uppercase tracking-wider mb-2">
                Top Keywords (Unigrams)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trends.frequent_keywords.slice(0, 8).map(kw => (
                  <button
                    key={kw.term}
                    onClick={() => navigateToExplorer({ search: kw.term })}
                    className="px-2.5 py-1 rounded-full text-xs bg-[#FBF7EF] border border-[#E7E0D3] text-[#182820] hover:border-[#15966A] transition-colors cursor-pointer font-medium"
                  >
                    {kw.term} <span className="text-[10px] text-[#687568] font-mono">({kw.count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E0D3]">
              <div className="text-[11px] font-bold text-[#687568] uppercase tracking-wider mb-2">
                Top Recurring Phrases (Bigrams)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trends.frequent_phrases.slice(0, 6).map(bp => (
                  <button
                    key={bp.term}
                    onClick={() => navigateToExplorer({ search: bp.term })}
                    className="px-2.5 py-1 rounded-full text-xs bg-[#DFF2E6]/60 border border-[#A3E0C0] text-[#073D32] hover:bg-[#DFF2E6] transition-colors cursor-pointer font-medium"
                  >
                    {bp.term} <span className="text-[10px] text-[#073D32]/70 font-mono">({bp.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 6: RECENT GRIEVANCE ACTIVITY TABLE
        ========================================================================
      */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E0D3] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#182820] font-serif">Recent Citizen Submissions</h3>
            <p className="text-xs text-[#687568]">Categorized by TF-IDF + Logistic Regression NLP pipeline</p>
          </div>
          <button
            onClick={() => navigateToExplorer()}
            className="text-xs font-bold text-[#073D32] hover:text-[#15966A] flex items-center gap-1 cursor-pointer"
          >
            <span>Open All in Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF7EF] text-[#687568] uppercase tracking-wider text-[11px] font-bold border-b border-[#E7E0D3]">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Complaint Text</th>
                <th className="px-6 py-3.5">Domain</th>
                <th className="px-6 py-3.5">Sentiment Polarity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Ward Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0D3]">
              {filteredRecords.slice(0, 6).map(item => {
                const sTheme = SENTIMENT_THEME[item.sentiment] || SENTIMENT_THEME.Neutral;
                const dTheme = DOMAIN_THEME[item.category] || DOMAIN_THEME['Other Public Services'];
                return (
                  <tr
                    key={item.id}
                    onClick={() => navigateToExplorer({ search: item.id })}
                    className="hover:bg-[#FBF7EF] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-mono text-[#687568] font-bold whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-6 py-3.5 text-[#182820] font-medium max-w-md truncate">
                      {item.complaint_text}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                        style={{ backgroundColor: dTheme.bg, color: dTheme.text, borderColor: dTheme.border }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1"
                        style={{ backgroundColor: sTheme.bg, color: sTheme.text, borderColor: sTheme.border }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sTheme.color }} />
                        {item.sentiment}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Resolved' ? 'bg-[#DFF2E6] text-[#073D32]' : item.status === 'In Progress' ? 'bg-[#FFF1C9] text-[#8F5C0A]' : 'bg-[#FBE2E0] text-[#A62419]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[#687568] tabular-nums whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-6 py-3.5 text-[#687568] whitespace-nowrap truncate max-w-xs">
                      {item.ward_or_region}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
