import React, { useState } from 'react';
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
  Filter
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
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { useCivic } from '../../context/CivicContext';
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';

export const DashboardPage: React.FC = () => {
  const { records, trends, insights, setActiveTab } = useCivic();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const total = records.length;
  const negCount = records.filter(r => r.sentiment === 'Negative').length;
  const posCount = records.filter(r => r.sentiment === 'Positive').length;
  const neuCount = records.filter(r => r.sentiment === 'Neutral').length;

  const negPct = total > 0 ? Math.round((negCount / total) * 100) : 0;
  const posPct = total > 0 ? Math.round((posCount / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((neuCount / total) * 100) : 0;

  const drainageCount = records.filter(r => r.category === 'Drainage / Sewage').length;
  const drainagePct = total > 0 ? Math.round((drainageCount / total) * 100) : 0;

  const topCategory = trends.category_breakdown[0]?.category || 'Roads';
  const topCategoryCount = trends.category_breakdown[0]?.count || 0;

  // Donut chart data matching reference (Positive: Emerald, Neutral: Golden Yellow, Negative: Coral Red)
  const sentimentDonutData = [
    { name: 'Positive', value: posCount, color: SENTIMENT_THEME.Positive.color },
    { name: 'Neutral', value: neuCount, color: SENTIMENT_THEME.Neutral.color },
    { name: 'Negative', value: negCount, color: SENTIMENT_THEME.Negative.color }
  ];

  // Complaint trends data combined with color-coded multi-color bars and green trend line
  const trendsChartData = trends.daily_trends.map((item, idx) => {
    // Alternate bar colors matching the reference (green, orange, golden-yellow)
    const barColors = [CIVIC_THEME.emeraldGreen, CIVIC_THEME.terracottaOrange, CIVIC_THEME.goldenYellow, CIVIC_THEME.sageGreen];
    return {
      date: item.date,
      count: item.count,
      fillColor: barColors[idx % barColors.length],
      trendValue: Math.max(1, Math.round(item.count * 1.15))
    };
  });

  // Top Complaint Domains (Horizontal Bars matching reference)
  const domainRankings = trends.category_breakdown.slice(0, 5).map(item => {
    const theme = DOMAIN_THEME[item.category] || DOMAIN_THEME['Other Public Services'];
    return {
      category: item.category,
      count: item.count,
      color: theme.color,
      pct: total > 0 ? Math.round((item.count / total) * 100) : 0
    };
  });

  // Recent 6 records
  const recentRecords = records.slice(0, 6);

  // Geographic Wards extracted from records
  const wardBreakdown = Array.from(new Set(records.map(r => r.ward_or_region))).slice(0, 4);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* 
        ========================================================================
        DASHBOARD HEADER BANNER (Warm Cream / Soft Mint with Forest Green Headings)
        ========================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
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
            Live citizen grievances processed through TF-IDF feature extraction and multi-class Logistic Regression models.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('complaint-analysis')}
            className="px-5 py-2.5 text-xs font-bold bg-[#073D32] hover:bg-[#0c4e40] text-[#FFFDF8] rounded-full transition-all shadow-xs hover:shadow-md flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#15966A]" />
            <span>Test Grievance Classifier</span>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        COLOURFUL KPI CARDS (Soft-Tinted Accents from Reference)
        ========================================================================
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Grievances (Forest Green / Soft Mint Accent with Mini Bar Graphic) */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 relative overflow-hidden group hover:border-[#15966A] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#687568]">
            <span>Total Grievances</span>
            <div className="w-8 h-8 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
              <FileText className="w-4 h-4 text-[#15966A]" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
            {total}
          </div>
          {/* Mini vertical bar graphic resembling reference card */}
          <div className="flex items-end gap-1.5 h-8 pt-1">
            <div className="w-2 h-3 bg-[#15966A]/40 rounded-t-xs" />
            <div className="w-2 h-5 bg-[#15966A]/60 rounded-t-xs" />
            <div className="w-2 h-4 bg-[#15966A]/50 rounded-t-xs" />
            <div className="w-2 h-7 bg-[#15966A]/80 rounded-t-xs" />
            <div className="w-2 h-8 bg-[#073D32] rounded-t-xs" />
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3]">
            Active CPGRAMS grievances logged
          </div>
        </div>

        {/* KPI 2: Drainage & Sewage (Golden Yellow / Soft Orange Accent) */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 relative overflow-hidden group hover:border-[#E85A24] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#7C2D12]">
            <span>Drainage / Sewage</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF1C9] flex items-center justify-center text-[#E85A24]">
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
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3]">
            Distinct 8th domain priority
          </div>
        </div>

        {/* KPI 3: Negative Sentiment (Coral Red Accent) */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 relative overflow-hidden group hover:border-[#F16B5B] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#A62419]">
            <span>Negative Sentiment</span>
            <div className="w-8 h-8 rounded-lg bg-[#FBE2E0] flex items-center justify-center text-[#F16B5B]">
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
            Acute citizen distress rate
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3]">
            Urgent administrative attention
          </div>
        </div>

        {/* KPI 4: Positive Feedback (Emerald Green Accent) */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 relative overflow-hidden group hover:border-[#15966A] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#073D32]">
            <span>Positive Feedback</span>
            <div className="w-8 h-8 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#15966A]">
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
            Resolution confirmations
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3]">
            Appreciation & completed repairs
          </div>
        </div>

        {/* KPI 5: Top Domain (Sage Green Accent) */}
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3 relative overflow-hidden group hover:border-[#A8B99A] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#2F3E29]">
            <span>Top Complaint Domain</span>
            <div className="w-8 h-8 rounded-lg bg-[#E4EFE7] flex items-center justify-center text-[#5B8A6A]">
              <Layers className="w-4 h-4 text-[#5B8A6A]" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#182820] truncate">
            {topCategory}
          </div>
          <div className="text-[11px] text-[#2F3E29] bg-[#E4EFE7]/80 px-2.5 py-1 rounded-lg flex items-center justify-between">
            <span>{topCategoryCount} Cases</span>
            <span className="font-mono font-bold">
              {total > 0 ? Math.round((topCategoryCount / total) * 100) : 0}%
            </span>
          </div>
          <div className="text-[11px] text-[#687568] pt-2 border-t border-[#E7E0D3]">
            Highest public reporting load
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 2: RICH ANALYTICS CHARTS (Inspired by the Reference Laptop Display)
        1. Sentiment Donut with Smile in Center
        2. City Geographic Hotspot Card with Colored Pins
        3. Complaint Trends Multi-Color Bars & Green Line
        4. Top Complaint Domains Horizontal Bars
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sentiment Donut with Center Smile (Direct Match to Reference) */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Sentiment</h3>
              <p className="text-xs text-[#687568]">Model-classified polarity distribution</p>
            </div>
            <button
              onClick={() => setActiveTab('sentiment-analysis')}
              className="text-xs font-bold text-[#15966A] hover:text-[#073D32] flex items-center gap-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Donut Chart with Friendly Smile Center */}
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

            {/* Center Smile Graphic from Reference */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Smile className="w-9 h-9 text-[#15966A]" />
              <span className="text-[10px] font-bold text-[#073D32] uppercase tracking-wider mt-0.5">Tone</span>
            </div>
          </div>

          {/* Clean Legend with Colour Dots */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E7E0D3] text-center text-xs">
            <div className="p-2 rounded-xl bg-[#DFF2E6]/60">
              <div className="flex items-center justify-center gap-1 text-[#073D32] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#15966A]" />
                Positive
              </div>
              <div className="font-mono font-bold text-[#073D32]">{posCount} ({posPct}%)</div>
            </div>
            <div className="p-2 rounded-xl bg-[#FFF1C9]/60">
              <div className="flex items-center justify-center gap-1 text-[#8F5C0A] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F2B544]" />
                Neutral
              </div>
              <div className="font-mono font-bold text-[#8F5C0A]">{neuCount} ({neuPct}%)</div>
            </div>
            <div className="p-2 rounded-xl bg-[#FBE2E0]/60">
              <div className="flex items-center justify-center gap-1 text-[#A62419] font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F16B5B]" />
                Negative
              </div>
              <div className="font-mono font-bold text-[#A62419]">{negCount} ({negPct}%)</div>
            </div>
          </div>
        </div>

        {/* Chart 2: Geographic Ward Pins Card (Direct Match to Reference Laptop Map) */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Municipal Spatial Density</h3>
              <p className="text-xs text-[#687568]">Grievance hotspot pins by ward zone</p>
            </div>
            <span className="text-[11px] font-bold text-[#073D32] bg-[#DFF2E6] px-2.5 py-0.5 rounded-full">
              Live Geo-Pins
            </span>
          </div>

          {/* Stylized Municipal Map Graphic with Pins */}
          <div className="relative h-56 w-full rounded-xl bg-[#F5EFE6]/70 border border-[#E7E0D3] overflow-hidden flex items-center justify-center">
            {/* Map Background Grid/Network Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-35 stroke-[#687568]" viewBox="0 0 400 240">
              <path d="M20,40 Q90,90 180,60 T350,110" fill="none" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M40,200 Q150,120 260,180 T390,140" fill="none" strokeWidth="1.5" />
              <path d="M120,10 Q140,110 160,220" fill="none" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M280,20 Q260,130 300,230" fill="none" strokeWidth="1" />
              <circle cx="110" cy="80" r="45" fill="#DFF2E6" opacity="0.5" />
              <circle cx="280" cy="90" r="50" fill="#FCE7D7" opacity="0.4" />
              <circle cx="200" cy="160" r="40" fill="#FFF1C9" opacity="0.5" />
            </svg>

            {/* Geographic Pin 1: Terracotta Orange Pin (North-West) */}
            <div
              onClick={() => setSelectedLocation('Ward 3 Central')}
              className="absolute left-[24%] top-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#E85A24] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#E85A24] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Ward 3 Central
              </span>
            </div>

            {/* Geographic Pin 2: Dark Forest Green Pin (North-East) */}
            <div
              onClick={() => setSelectedLocation('Sector 7 North')}
              className="absolute left-[75%] top-[24%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#073D32] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#073D32] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Sector 7 North
              </span>
            </div>

            {/* Geographic Pin 3: Emerald Green Pin (South-Center) */}
            <div
              onClick={() => setSelectedLocation('Ring Road South')}
              className="absolute left-[52%] top-[62%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#15966A] text-white flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-[#15966A] bg-white px-1.5 py-0.5 rounded shadow-xs mt-1">
                Ring Road South
              </span>
            </div>
          </div>

          {/* Map Footer Wards summary */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E7E0D3]">
            <span className="text-[#687568]">Cluster Zones:</span>
            <div className="flex gap-1.5">
              {wardBreakdown.map((w, i) => (
                <span key={w} className="text-[10px] font-bold text-[#182820] bg-[#F5EFE6] px-2 py-0.5 rounded-full">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Top Complaint Domains (Horizontal Bars matching reference) */}
        <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">Top Complaint Domains</h3>
              <p className="text-xs text-[#687568]">Ranked by total citizen complaint volume</p>
            </div>
            <button
              onClick={() => setActiveTab('complaint-analysis')}
              className="text-xs font-bold text-[#15966A] hover:text-[#073D32] flex items-center gap-1"
            >
              <span>Classifier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Horizontal Bars matching the reference visual style */}
          <div className="space-y-4 my-auto py-2">
            {domainRankings.map((dom) => (
              <div key={dom.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#182820]">{dom.category}</span>
                  <span className="font-mono font-bold text-[#687568]">{dom.count} complaints ({dom.pct}%)</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-3 rounded-full bg-[#F5EFE6] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
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
            <span>Calibrated via TF-IDF Vectorizer</span>
            <span className="font-bold text-[#073D32]">8 Total Domains</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 3: COMPLAINT TRENDS (Green, Orange, Yellow Bars + Emerald Line)
        ========================================================================
      */}
      <div className="p-6 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#182820] font-serif">Complaint Trends & Trajectory</h3>
            <p className="text-xs text-[#687568]">
              Daily logged public grievances combined with departmental response velocity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#687568]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#15966A]" /> Green Vol
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#E85A24]" /> Orange Vol
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs bg-[#F2B544]" /> Yellow Vol
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#073D32]" /> Trajectory Line
              </span>
            </div>
            <button
              onClick={() => setActiveTab('trend-analysis')}
              className="text-xs font-bold text-[#073D32] hover:underline flex items-center gap-1"
            >
              <span>Explore Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    return (
                      <div className="bg-[#182820] text-[#FFFDF8] p-3 rounded-xl text-xs shadow-xl space-y-1 border border-[#E7E0D3]">
                        <p className="font-bold text-[#FFFDF8]">{label}</p>
                        <p className="text-[#15966A] font-mono">
                          Complaints Logged: <span className="font-bold">{payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Colorful Bars */}
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {trendsChartData.map((entry, index) => (
                  <Cell key={`trend-bar-${index}`} fill={entry.fillColor} />
                ))}
              </Bar>
              {/* Emerald Trend Line */}
              <Line
                type="monotone"
                dataKey="count"
                stroke="#073D32"
                strokeWidth={3}
                dot={{ r: 4, fill: '#15966A', strokeWidth: 2, stroke: '#FFFDF8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 
        ========================================================================
        ROW 4: RECENT GRIEVANCE ACTIVITY TABLE (Warm Ivory Design)
        ========================================================================
      */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E0D3] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#182820] font-serif">Recent Citizen Submissions</h3>
            <p className="text-xs text-[#687568]">Incoming complaints categorized by Logistic Regression</p>
          </div>
          <button
            onClick={() => setActiveTab('complaint-explorer')}
            className="text-xs font-bold text-[#073D32] hover:text-[#15966A] flex items-center gap-1"
          >
            <span>Open Explorer</span>
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
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Ward Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0D3]">
              {recentRecords.map(item => {
                const sTheme = SENTIMENT_THEME[item.sentiment] || SENTIMENT_THEME.Neutral;
                const dTheme = DOMAIN_THEME[item.category] || DOMAIN_THEME['Other Public Services'];
                return (
                  <tr key={item.id} className="hover:bg-[#FBF7EF] transition-colors">
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
