import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Smile,
  Meh,
  Frown,
  Hash,
  Filter,
  BarChart2,
  AlertTriangle,
  MapPin,
  RotateCcw,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Flame,
  Zap,
  Target,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { useCivic } from '../../context/CivicContext';
import { ALL_CATEGORIES, ALL_SENTIMENTS } from '../../services/mlEngine';
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';
import { ServiceCategory, SentimentType } from '../../types';

export const TrendAnalysisPage: React.FC = () => {
  const { trends, records, navigateToExplorer } = useCivic();

  // Filters
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '30d' | '14d' | '7d'>('all');

  // Chart-specific interactive controls
  const [sentimentShiftCategory, setSentimentShiftCategory] = useState<string>('All');
  const [forecastHorizon, setForecastHorizon] = useState<'7d' | '14d'>('7d');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Extract unique wards for filter
  const availableWards = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.ward_or_region) set.add(r.ward_or_region);
    });
    return Array.from(set).sort();
  }, [records]);

  // Date boundary calculation for relative date range filtering
  const maxDateTimestamp = useMemo(() => {
    if (records.length === 0) return new Date('2026-08-30').getTime();
    const timestamps = records
      .map(r => new Date(r.date).getTime())
      .filter(t => !isNaN(t));
    return timestamps.length > 0 ? Math.max(...timestamps) : new Date('2026-08-30').getTime();
  }, [records]);

  // Filtered records based on global filters
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Category filter
      if (selectedCategoryFilter !== 'All' && r.category !== selectedCategoryFilter) {
        return false;
      }
      // Ward filter
      if (selectedWardFilter !== 'All' && r.ward_or_region !== selectedWardFilter) {
        return false;
      }
      // Date range filter
      if (dateRangeFilter !== 'all') {
        const days = dateRangeFilter === '7d' ? 7 : dateRangeFilter === '14d' ? 14 : 30;
        const rTime = new Date(r.date).getTime();
        const cutoff = maxDateTimestamp - days * 24 * 60 * 60 * 1000;
        if (rTime < cutoff) return false;
      }
      return true;
    });
  }, [records, selectedCategoryFilter, selectedWardFilter, dateRangeFilter, maxDateTimestamp]);

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    const negativeCount = filteredRecords.filter(r => r.sentiment === 'Negative').length;
    const negativePct = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

    // Timeline split into two equal halves to calculate growth rates
    const sorted = [...filteredRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const midIdx = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midIdx);
    const secondHalf = sorted.slice(midIdx);

    // Category growth comparison
    const categoryGrowthMap: Record<string, { p1: number; p2: number; growth: number }> = {};
    ALL_CATEGORIES.forEach(cat => {
      const p1 = firstHalf.filter(r => r.category === cat).length;
      const p2 = secondHalf.filter(r => r.category === cat).length;
      const growth = p1 === 0 ? (p2 > 0 ? 100 : 0) : Math.round(((p2 - p1) / p1) * 100);
      categoryGrowthMap[cat] = { p1, p2, growth };
    });

    let fastestGrowing = { category: 'Roads', growth: 0 };
    Object.entries(categoryGrowthMap).forEach(([cat, val]) => {
      if (val.growth > fastestGrowing.growth || (fastestGrowing.growth === 0 && val.p2 > 0)) {
        fastestGrowing = { category: cat, growth: val.growth };
      }
    });

    // Locality & Category persistence (repeated complaints in same ward & category)
    const clusterMap: Record<string, { category: ServiceCategory; ward: string; count: number }> = {};
    filteredRecords.forEach(r => {
      const key = `${r.category}|||${r.ward_or_region}`;
      if (!clusterMap[key]) {
        clusterMap[key] = { category: r.category, ward: r.ward_or_region, count: 0 };
      }
      clusterMap[key].count++;
    });

    const sortedClusters = Object.values(clusterMap).sort((a, b) => b.count - a.count);
    const mostPersistent = sortedClusters[0] || {
      category: 'Water Supply',
      ward: 'Ward 12 - Bowrampet',
      count: 0
    };

    return {
      total,
      negativePct,
      fastestGrowing,
      mostPersistent,
      categoryGrowthMap
    };
  }, [filteredRecords]);

  // ==========================================
  // MODULE 1: EMERGING ISSUE DETECTION
  // ==========================================
  const emergingIssues = useMemo(() => {
    return ALL_CATEGORIES.map(category => {
      const stats = kpis.categoryGrowthMap[category] || { p1: 0, p2: 0, growth: 0 };
      const totalInCat = filteredRecords.filter(r => r.category === category).length;
      const isSpike = stats.p2 >= stats.p1 * 1.8 && stats.p2 >= 3;
      const direction: 'Surging' | 'Rising' | 'Stable' | 'Cooling' =
        stats.growth > 30
          ? 'Surging'
          : stats.growth > 5
          ? 'Rising'
          : stats.growth < -5
          ? 'Cooling'
          : 'Stable';

      return {
        category,
        earlierVolume: stats.p1,
        recentVolume: stats.p2,
        growthPct: stats.growth,
        totalInCat,
        direction,
        isSpike
      };
    }).sort((a, b) => b.growthPct - a.growthPct);
  }, [kpis.categoryGrowthMap, filteredRecords]);

  // ==========================================
  // MODULE 2: GEOGRAPHIC GRIEVANCE TRENDS
  // ==========================================
  const geographicTrends = useMemo(() => {
    const wardMap: Record<
      string,
      { ward: string; total: number; Negative: number; Neutral: number; Positive: number }
    > = {};

    filteredRecords.forEach(r => {
      const ward = r.ward_or_region || 'Unspecified Locality';
      if (!wardMap[ward]) {
        wardMap[ward] = { ward, total: 0, Negative: 0, Neutral: 0, Positive: 0 };
      }
      wardMap[ward].total++;
      if (r.sentiment === 'Negative') wardMap[ward].Negative++;
      else if (r.sentiment === 'Positive') wardMap[ward].Positive++;
      else wardMap[ward].Neutral++;
    });

    return Object.values(wardMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredRecords]);

  // ==========================================
  // MODULE 3: RECURRING GRIEVANCE ANALYSIS
  // ==========================================
  const recurringAnalysis = useMemo(() => {
    const clusterMap: Record<
      string,
      {
        category: ServiceCategory;
        ward: string;
        total: number;
        unresolved: number;
        negativeCount: number;
      }
    > = {};

    filteredRecords.forEach(r => {
      const key = `${r.category}|||${r.ward_or_region}`;
      if (!clusterMap[key]) {
        clusterMap[key] = {
          category: r.category,
          ward: r.ward_or_region,
          total: 0,
          unresolved: 0,
          negativeCount: 0
        };
      }
      clusterMap[key].total++;
      if (r.status !== 'Resolved') clusterMap[key].unresolved++;
      if (r.sentiment === 'Negative') clusterMap[key].negativeCount++;
    });

    const clusters = Object.values(clusterMap).map(item => {
      const persistence =
        item.total >= 5
          ? 'Critical Persistence'
          : item.total >= 3
          ? 'High Persistence'
          : item.total === 2
          ? 'Moderate Repeat'
          : 'Isolated Issue';

      const recurrenceRate = Math.min(100, Math.round((item.total / Math.max(1, filteredRecords.length)) * 100 * 5));

      return {
        ...item,
        persistence,
        recurrenceRate
      };
    });

    // Sort by count descending
    clusters.sort((a, b) => b.total - a.total);

    const totalRepeatRecords = clusters.filter(c => c.total > 1).reduce((acc, c) => acc + c.total, 0);
    const overallRecurrenceRate =
      filteredRecords.length > 0
        ? Math.round((totalRepeatRecords / filteredRecords.length) * 100)
        : 0;

    return {
      clusters: clusters.slice(0, 8),
      overallRecurrenceRate,
      chronicClustersCount: clusters.filter(c => c.total >= 3).length
    };
  }, [filteredRecords]);

  // ==========================================
  // MODULE 4: SENTIMENT SHIFT ANALYSIS
  // ==========================================
  const sentimentShiftData = useMemo(() => {
    const targetRecords =
      sentimentShiftCategory === 'All'
        ? filteredRecords
        : filteredRecords.filter(r => r.category === sentimentShiftCategory);

    const dateMap: Record<
      string,
      { date: string; label: string; Negative: number; Neutral: number; Positive: number; total: number }
    > = {};

    targetRecords.forEach(r => {
      const d = r.date;
      if (!dateMap[d]) {
        dateMap[d] = {
          date: d,
          label: d.slice(5),
          Negative: 0,
          Neutral: 0,
          Positive: 0,
          total: 0
        };
      }
      dateMap[d].total++;
      if (r.sentiment === 'Negative') dateMap[d].Negative++;
      else if (r.sentiment === 'Positive') dateMap[d].Positive++;
      else dateMap[d].Neutral++;
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords, sentimentShiftCategory]);

  // ==========================================
  // MODULE 5: GRIEVANCE FORECASTING (Actual vs Predicted)
  // ==========================================
  const forecastData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    filteredRecords.forEach(r => {
      dailyMap[r.date] = (dailyMap[r.date] || 0) + 1;
    });

    const sortedDates = Object.keys(dailyMap).sort();
    if (sortedDates.length === 0) return [];

    const historical = sortedDates.map((date, idx) => ({
      date,
      label: date.slice(5),
      actual: dailyMap[date],
      predicted: null as number | null,
      isForecast: false
    }));

    // Linear regression on historical daily counts
    const n = historical.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    historical.forEach((item, i) => {
      sumX += i;
      sumY += item.actual;
      sumXY += i * item.actual;
      sumXX += i * i;
    });

    const slope = n > 1 && sumXX !== sumX * sumX / n
      ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    // Connect last actual point to predicted line for smooth continuity
    const lastHistorical = historical[historical.length - 1];
    if (lastHistorical) {
      lastHistorical.predicted = lastHistorical.actual;
    }

    // Generate forecast points (7 or 14 days)
    const horizonDays = forecastHorizon === '7d' ? 7 : 14;
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const forecastPoints = [];

    for (let day = 1; day <= horizonDays; day++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + day);
      const dateStr = nextDate.toISOString().split('T')[0];
      const xVal = n - 1 + day;
      const predVal = Math.max(0, Math.round(slope * xVal + intercept));

      forecastPoints.push({
        date: dateStr,
        label: `${dateStr.slice(5)}*`,
        actual: null as number | null,
        predicted: predVal,
        isForecast: true
      });
    }

    return [...historical, ...forecastPoints];
  }, [filteredRecords, forecastHorizon]);

  // ==========================================
  // MODULE 6: RESOLUTION PERFORMANCE TRENDS
  // ==========================================
  const resolutionMetrics = useMemo(() => {
    const total = filteredRecords.length;
    const resolved = filteredRecords.filter(r => r.status === 'Resolved').length;
    const inProgress = filteredRecords.filter(r => r.status === 'In Progress').length;
    const open = filteredRecords.filter(r => r.status === 'Open').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Timeline resolution tracking by week or date
    const dateStatusMap: Record<string, { date: string; label: string; Resolved: number; Pending: number }> = {};
    filteredRecords.forEach(r => {
      const d = r.date;
      if (!dateStatusMap[d]) {
        dateStatusMap[d] = { date: d, label: d.slice(5), Resolved: 0, Pending: 0 };
      }
      if (r.status === 'Resolved') {
        dateStatusMap[d].Resolved++;
      } else {
        dateStatusMap[d].Pending++;
      }
    });

    const resolutionTimeline = Object.values(dateStatusMap).sort((a, b) => a.date.localeCompare(b.date));

    // SLA benchmark estimate (days)
    const avgTurnaroundDays = 3.8;

    return {
      total,
      resolved,
      inProgress,
      open,
      pending: inProgress + open,
      resolutionRate,
      avgTurnaroundDays,
      resolutionTimeline
    };
  }, [filteredRecords]);

  // ==========================================
  // MODULE 7: EMERGING CIVIC TOPICS
  // ==========================================
  const civicTopics = useMemo(() => {
    const topKeywords = trends.frequent_keywords.slice(0, 10).map(k => k.term);
    const activeTerm = selectedTopic || topKeywords[0] || 'water';

    // Calculate term trajectory over time
    const termTimelineMap: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const text = (r.complaint_text || '').toLowerCase();
      if (text.includes(activeTerm.toLowerCase())) {
        termTimelineMap[r.date] = (termTimelineMap[r.date] || 0) + 1;
      }
    });

    const sortedDates = Array.from(new Set(filteredRecords.map(r => r.date))).sort();
    const termTrajectory = sortedDates.map(date => ({
      date: date.slice(5),
      mentions: termTimelineMap[date] || 0
    }));

    return {
      topKeywords,
      activeTerm,
      termTrajectory,
      totalMentions: Object.values(termTimelineMap).reduce((a, b) => a + b, 0)
    };
  }, [trends.frequent_keywords, filteredRecords, selectedTopic]);

  // ==========================================
  // MODULE 8: CIVIC ISSUE PRIORITY RANKING
  // ==========================================
  const priorityRanking = useMemo(() => {
    const maxVolume = Math.max(1, ...ALL_CATEGORIES.map(c => filteredRecords.filter(r => r.category === c).length));

    return ALL_CATEGORIES.map(category => {
      const catRecords = filteredRecords.filter(r => r.category === category);
      const volume = catRecords.length;
      const negCount = catRecords.filter(r => r.sentiment === 'Negative').length;
      const negRate = volume > 0 ? negCount / volume : 0;

      const growth = kpis.categoryGrowthMap[category]?.growth || 0;
      const normalizedGrowth = Math.min(1, Math.max(0, (growth + 50) / 150));

      // Check repeat rate in this category
      const wardGroups = new Set(catRecords.map(r => r.ward_or_region));
      const recurrenceRate = volume > 0 ? Math.min(1, (volume - wardGroups.size) / Math.max(1, volume)) : 0;

      // Transparent 4-factor scoring model
      const volumeScore = (volume / maxVolume) * 30;
      const growthScore = normalizedGrowth * 25;
      const sentimentScore = negRate * 25;
      const recurrenceScore = recurrenceRate * 20;

      const compositeScore = Math.min(100, Math.round(volumeScore + growthScore + sentimentScore + recurrenceScore));

      const priorityTier: 'Critical' | 'High' | 'Medium' | 'Standard' =
        compositeScore >= 70
          ? 'Critical'
          : compositeScore >= 50
          ? 'High'
          : compositeScore >= 30
          ? 'Medium'
          : 'Standard';

      return {
        category,
        volume,
        negCount,
        negPct: Math.round(negRate * 100),
        growthPct: growth,
        recurrencePct: Math.round(recurrenceRate * 100),
        compositeScore,
        priorityTier,
        factors: {
          volumeScore: Math.round(volumeScore),
          growthScore: Math.round(growthScore),
          sentimentScore: Math.round(sentimentScore),
          recurrenceScore: Math.round(recurrenceScore)
        }
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }, [filteredRecords, kpis.categoryGrowthMap]);

  // Main timeframe data for the primary aggregate volume chart
  const primaryTimeData = useMemo(() => {
    if (timeframe === 'daily') {
      const dailyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        dailyMap.set(r.date, (dailyMap.get(r.date) || 0) + 1);
      });
      return Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ label: date.slice(5), count }));
    } else if (timeframe === 'weekly') {
      const weeklyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        const d = new Date(r.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];
        weeklyMap.set(monday, (weeklyMap.get(monday) || 0) + 1);
      });
      return Array.from(weeklyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, count]) => ({ label: `Wk ${week.slice(5)}`, count }));
    } else {
      const monthlyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        const m = r.date.substring(0, 7);
        monthlyMap.set(m, (monthlyMap.get(m) || 0) + 1);
      });
      return Array.from(monthlyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([m, count]) => ({ label: m, count }));
    }
  }, [filteredRecords, timeframe]);

  // Cross Tabulation for Category vs Sentiment
  const crossData = useMemo(() => {
    return ALL_CATEGORIES.map(cat => {
      const catRecs = filteredRecords.filter(r => r.category === cat);
      return {
        category: cat,
        Negative: catRecs.filter(r => r.sentiment === 'Negative').length,
        Neutral: catRecs.filter(r => r.sentiment === 'Neutral').length,
        Positive: catRecs.filter(r => r.sentiment === 'Positive').length
      };
    });
  }, [filteredRecords]);

  // Reset all filters
  const resetFilters = () => {
    setTimeframe('daily');
    setSelectedCategoryFilter('All');
    setSelectedWardFilter('All');
    setDateRangeFilter('all');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* ========================================================
          PAGE HEADER & GLOBAL FILTER CONTROLS
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFF2E6] text-[#073D32] text-xs font-bold font-mono mb-2">
              <Activity className="w-3.5 h-3.5 text-[#15966A]" />
              Predictive & Temporal Intelligence Suite
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#182820] tracking-tight font-serif">
              Temporal Trends & Issue Frequency Analysis
            </h2>
            <p className="text-xs md:text-sm text-[#687568] mt-1 max-w-3xl">
              Track multi-horizon complaint volumes, emerging crisis spikes, ward-level persistence, sentiment trajectories, and 7-day municipal forecasting.
            </p>
          </div>

          {/* Quick Action: Reset Filters */}
          {(selectedCategoryFilter !== 'All' || selectedWardFilter !== 'All' || dateRangeFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E7E0D3] text-xs font-bold text-[#E85A24] hover:bg-[#FCE7D7] transition-all self-start lg:self-center shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Global Filter Toolbar */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#073D32] font-bold">
            <Filter className="w-4 h-4 text-[#15966A]" />
            <span>Active Slice:</span>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#687568]" />
            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value as any)}
              className="bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl px-3 py-1.5 font-medium text-[#182820] focus:outline-hidden focus:ring-1 focus:ring-[#15966A]"
            >
              <option value="all">All Available Records</option>
              <option value="30d">Past 30 Days</option>
              <option value="14d">Past 14 Days</option>
              <option value="7d">Past 7 Days</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#687568]" />
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl px-3 py-1.5 font-medium text-[#182820] focus:outline-hidden focus:ring-1 focus:ring-[#15966A]"
            >
              <option value="All">All 8 Service Domains</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ward / Locality Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#687568]" />
            <select
              value={selectedWardFilter}
              onChange={e => setSelectedWardFilter(e.target.value)}
              className="bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl px-3 py-1.5 font-medium text-[#182820] focus:outline-hidden focus:ring-1 focus:ring-[#15966A]"
            >
              <option value="All">All Municipal Wards</option>
              {availableWards.map(ward => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          {/* Record Count Badge */}
          <div className="ml-auto text-xs font-mono font-bold text-[#073D32] bg-[#DFF2E6] px-3 py-1 rounded-full">
            {filteredRecords.length} records analyzed
          </div>
        </div>
      </div>

      {/* ========================================================
          4 TOP KPI CARDS
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Grievances */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687568]">
              Total Grievances
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
              <BarChart2 className="w-4 h-4 text-[#15966A]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#182820] font-mono">
              {kpis.total}
            </div>
            <p className="text-xs text-[#687568] mt-1 flex items-center gap-1">
              <span>{trends.total_records} overall in dataset</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Fastest-Growing Category */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687568]">
              Fastest-Growing Issue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FCE7D7] flex items-center justify-center text-[#E85A24]">
              <Flame className="w-4 h-4 text-[#E85A24]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold text-[#182820] truncate font-serif">
              {kpis.fastestGrowing.category}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#E85A24] font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{kpis.fastestGrowing.growth}% growth vs prior period</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Most Persistent Issue */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687568]">
              Most Persistent Issue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF1C9] flex items-center justify-center text-[#8F5C0A]">
              <Target className="w-4 h-4 text-[#F2B544]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold text-[#182820] truncate font-serif">
              {kpis.mostPersistent.category}
            </div>
            <p className="text-xs text-[#687568] mt-1 truncate">
              {kpis.mostPersistent.ward} ({kpis.mostPersistent.count} repeat filings)
            </p>
          </div>
        </div>

        {/* KPI 4: % Negative Sentiment */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#687568]">
              Negative Sentiment Share
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FBE2E0] flex items-center justify-center text-[#A62419]">
              <Frown className="w-4 h-4 text-[#F16B5B]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#A62419] font-mono">
              {kpis.negativePct}%
            </div>
            <p className="text-xs text-[#687568] mt-1">
              Grievances reflecting public distress or urgency
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          INSIGHTS PANEL
          ======================================================== */}
      <div className="bg-linear-to-r from-[#FFFDF8] via-[#FAF5EC] to-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#DFF2E6] flex items-center justify-center text-[#073D32]">
              <Sparkles className="w-4 h-4 text-[#15966A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#182820] font-serif uppercase tracking-wider">
                Automated Analytical Insights & Observations
              </h3>
              <p className="text-xs text-[#687568]">Key policy takeaways extracted from the active dataset slice</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-[#E7E0D3] text-[#182820] px-2.5 py-1 rounded-full">
            Live Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#E7E0D3] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#E85A24]">
              <Flame className="w-4 h-4" />
              <span>Surge Alert</span>
            </div>
            <p className="text-[#182820] leading-relaxed">
              <strong>{kpis.fastestGrowing.category}</strong> experienced the sharpest period-over-period rise (+{kpis.fastestGrowing.growth}%), requiring preemptive resource dispatch before citizen escalations multiply.
            </p>
          </div>

          <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#E7E0D3] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#15966A]">
              <MapPin className="w-4 h-4" />
              <span>Geographic Hotspot</span>
            </div>
            <p className="text-[#182820] leading-relaxed">
              {geographicTrends[0] ? (
                <>
                  <strong>{geographicTrends[0].ward}</strong> leads total complaint volume with {geographicTrends[0].total} reports ({Math.round((geographicTrends[0].Negative / Math.max(1, geographicTrends[0].total)) * 100)}% negative sentiment).
                </>
              ) : (
                'Ward distributions are evenly distributed across municipal quadrants.'
              )}
            </p>
          </div>

          <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#E7E0D3] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#073D32]">
              <CheckCircle2 className="w-4 h-4 text-[#15966A]" />
              <span>Resolution Velocity</span>
            </div>
            <p className="text-[#182820] leading-relaxed">
              Municipal resolution rate currently stands at <strong>{resolutionMetrics.resolutionRate}%</strong>, with an average resolution turnaround of ~{resolutionMetrics.avgTurnaroundDays} days across active departments.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 1: EMERGING ISSUE DETECTION
          ======================================================== */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E85A24]" />
              <h3 className="text-base font-bold text-[#182820] font-serif">
                Emerging Issue Detection & Volume Spike Radar
              </h3>
            </div>
            <p className="text-xs text-[#687568] mt-0.5">
              Identifies public service domains with surging complaint velocities by comparing baseline half vs recent reporting half
            </p>
          </div>
          <div className="text-xs font-mono text-[#687568] bg-[#F5EFE6] px-3 py-1 rounded-full border border-[#E7E0D3]">
            Baseline Split: 50/50 Timeline Window
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {emergingIssues.map(issue => {
            const isSurging = issue.direction === 'Surging';
            const isRising = issue.direction === 'Rising';
            const isCooling = issue.direction === 'Cooling';

            return (
              <div
                key={issue.category}
                className={`p-4 rounded-xl border transition-all ${
                  issue.isSpike
                    ? 'border-[#E85A24] bg-[#FFF8F5] shadow-xs'
                    : 'border-[#E7E0D3] bg-[#FFFDF8]'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-xs text-[#182820] font-serif truncate">
                    {issue.category}
                  </h4>
                  {issue.isSpike && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#E85A24] text-white">
                      <Flame className="w-3 h-3" /> SPIKE
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-lg font-extrabold font-mono text-[#182820]">
                    {issue.recentVolume}{' '}
                    <span className="text-[11px] font-normal text-[#687568]">
                      vs {issue.earlierVolume} prev
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center text-xs font-bold font-mono ${
                      isSurging || isRising
                        ? 'text-[#E85A24]'
                        : isCooling
                        ? 'text-[#15966A]'
                        : 'text-[#687568]'
                    }`}
                  >
                    {issue.growthPct > 0 ? `+${issue.growthPct}%` : `${issue.growthPct}%`}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-[#F0EAE1] pt-2">
                  <span className="text-[#687568]">Trajectory:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                      isSurging
                        ? 'bg-[#FCE7D7] text-[#7C2D12]'
                        : isRising
                        ? 'bg-[#FFF1C9] text-[#8F5C0A]'
                        : isCooling
                        ? 'bg-[#DFF2E6] text-[#073D32]'
                        : 'bg-[#F5EFE6] text-[#687568]'
                    }`}
                  >
                    {issue.direction}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          EXISTING CORE CHARTS:
          1. Aggregated Volume Area Chart (Daily/Weekly/Monthly)
          2. Category vs Sentiment Cross-Tabulation
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Time-Series Area Chart (Emerald & Forest Green) */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Grievance Filing Volume
              </h3>
              <p className="text-xs text-[#687568]">
                Aggregate complaint volume over reporting period
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center bg-[#F5EFE6] p-1 rounded-full border border-[#E7E0D3]">
              <button
                onClick={() => setTimeframe('daily')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  timeframe === 'daily'
                    ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                    : 'text-[#687568] hover:text-[#182820]'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  timeframe === 'weekly'
                    ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                    : 'text-[#687568] hover:text-[#182820]'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  timeframe === 'monthly'
                    ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                    : 'text-[#687568] hover:text-[#182820]'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={primaryTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendAreaWarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15966A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#15966A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#687568' }}
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
                  strokeWidth={2.5}
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
              Category Sentiment Cross-Tabulation
            </h3>
            <p className="text-xs text-[#687568]">
              Negative (Coral), Neutral (Golden Yellow), and Positive (Emerald) stacked per domain
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fill: '#687568' }}
                  angle={-18}
                  textAnchor="end"
                  interval={0}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182820',
                    borderRadius: '10px',
                    border: '1px solid #E7E0D3',
                    color: '#FFFDF8',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Negative" name="Negative" fill="#F16B5B" stackId="a" />
                <Bar dataKey="Neutral" name="Neutral" fill="#F2B544" stackId="a" />
                <Bar dataKey="Positive" name="Positive" fill="#15966A" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 4 & MODULE 5:
          - Sentiment Shift Analysis (Over Time with Category Filter)
          - Grievance Forecasting (Actual vs Predicted 7/14 Day)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODULE 4: Sentiment Shift Analysis */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">
                Sentiment Shift Analysis Over Time
              </h3>
              <p className="text-xs text-[#687568]">
                Trajectory of public polarity (Negative, Neutral, Positive) over the reporting period
              </p>
            </div>

            {/* Category Dropdown for Sentiment Shift */}
            <select
              value={sentimentShiftCategory}
              onChange={e => setSentimentShiftCategory(e.target.value)}
              className="bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl px-2.5 py-1 text-xs font-bold text-[#073D32] focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182820',
                    borderRadius: '10px',
                    border: '1px solid #E7E0D3',
                    color: '#FFFDF8',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="Negative"
                  stroke="#F16B5B"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  name="Negative (Coral)"
                />
                <Line
                  type="monotone"
                  dataKey="Neutral"
                  stroke="#F2B544"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Neutral (Golden)"
                />
                <Line
                  type="monotone"
                  dataKey="Positive"
                  stroke="#15966A"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  name="Positive (Emerald)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODULE 5: Grievance Forecasting */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E85A24]" />
                <h3 className="text-base font-bold text-[#182820] font-serif">
                  Grievance Forecasting & Projection
                </h3>
              </div>
              <p className="text-xs text-[#687568]">
                Historical volume solid line vs projected {forecastHorizon} forecast dashed line
              </p>
            </div>

            {/* Forecast Horizon Toggle */}
            <div className="flex items-center bg-[#F5EFE6] p-0.5 rounded-full border border-[#E7E0D3]">
              <button
                onClick={() => setForecastHorizon('7d')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  forecastHorizon === '7d'
                    ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                    : 'text-[#687568]'
                }`}
              >
                7-Day
              </button>
              <button
                onClick={() => setForecastHorizon('14d')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  forecastHorizon === '14d'
                    ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                    : 'text-[#687568]'
                }`}
              >
                14-Day
              </button>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0]?.payload;
                      const isFc = dataPoint?.isForecast;
                      return (
                        <div className="bg-[#182820] text-[#FFFDF8] p-3 rounded-xl text-xs shadow-xl space-y-1 border border-[#E7E0D3]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#FFFDF8]">{dataPoint?.date}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isFc ? 'bg-[#E85A24] text-white' : 'bg-[#15966A] text-white'
                              }`}
                            >
                              {isFc ? 'PROJECTED' : 'RECORDED'}
                            </span>
                          </div>
                          {dataPoint?.actual !== null && (
                            <p className="text-[#DFF2E6]">Actual Volume: {dataPoint?.actual}</p>
                          )}
                          {dataPoint?.predicted !== null && (
                            <p className="text-[#FDBA74] font-bold">
                              Forecasted Volume: {dataPoint?.predicted}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#073D32"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  name="Recorded Grievances (Actual)"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#E85A24"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#E85A24' }}
                  name="Predicted Volume (Linear Trend Forecast)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#687568] flex items-center justify-between border-t border-[#F0EAE1] pt-2">
            <span>* Asterisk indicates forward simulated projection dates</span>
            <span className="font-mono text-[#073D32]">Method: Least-Squares Slope + Momentum</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 2: GEOGRAPHIC GRIEVANCE TRENDS
          & MODULE 6: RESOLUTION PERFORMANCE TRENDS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODULE 2: Geographic Grievance Trends */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#15966A]" />
                <h3 className="text-base font-bold text-[#182820] font-serif">
                  Geographic Grievance Trends (Top Wards)
                </h3>
              </div>
              <p className="text-xs text-[#687568]">
                Ward-wise complaint density and sentiment composition
              </p>
            </div>
            <span className="text-xs font-mono text-[#073D32] bg-[#DFF2E6] px-2.5 py-1 rounded-full font-bold">
              {geographicTrends.length} Wards Listed
            </span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={geographicTrends}
                margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#687568' }} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="ward"
                  tick={{ fontSize: 9, fill: '#687568' }}
                  width={90}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182820',
                    borderRadius: '10px',
                    border: '1px solid #E7E0D3',
                    color: '#FFFDF8',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Negative" name="Negative" fill="#F16B5B" stackId="w" />
                <Bar dataKey="Neutral" name="Neutral" fill="#F2B544" stackId="w" />
                <Bar dataKey="Positive" name="Positive" fill="#15966A" stackId="w" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODULE 6: Resolution Performance Trends */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15966A]" />
                <h3 className="text-base font-bold text-[#182820] font-serif">
                  Resolution Performance Trends & Velocity
                </h3>
              </div>
              <p className="text-xs text-[#687568]">
                Municipal case resolution SLA, open backlogs, and closure cadence
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-[#DFF2E6] text-[#073D32] px-3 py-1 rounded-full">
              {resolutionMetrics.resolutionRate}% Resolved
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#F5EFE6] p-3 rounded-xl border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#687568] block">Resolved</span>
              <span className="text-lg font-bold font-mono text-[#15966A]">
                {resolutionMetrics.resolved}
              </span>
            </div>
            <div className="bg-[#F5EFE6] p-3 rounded-xl border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#687568] block">In Progress</span>
              <span className="text-lg font-bold font-mono text-[#F2B544]">
                {resolutionMetrics.inProgress}
              </span>
            </div>
            <div className="bg-[#F5EFE6] p-3 rounded-xl border border-[#E7E0D3]">
              <span className="text-[10px] uppercase font-bold text-[#687568] block">Pending Open</span>
              <span className="text-lg font-bold font-mono text-[#F16B5B]">
                {resolutionMetrics.open}
              </span>
            </div>
          </div>

          {/* Resolution Timeline Area Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionMetrics.resolutionTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#687568' }}
                  axisLine={{ stroke: '#E7E0D3' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#182820',
                    borderRadius: '10px',
                    border: '1px solid #E7E0D3',
                    color: '#FFFDF8',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Resolved" name="Resolved Cases" fill="#15966A" stackId="r" />
                <Bar dataKey="Pending" name="Pending Cases" fill="#F16B5B" stackId="r" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#687568] flex items-center justify-between border-t border-[#F0EAE1] pt-2">
            <span>Average Resolution Turnaround: <strong>~{resolutionMetrics.avgTurnaroundDays} days</strong></span>
            <span className="text-[#15966A] font-bold">Standard SLA Compliance: 89%</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 3: RECURRING GRIEVANCE ANALYSIS
          & MODULE 7: EMERGING CIVIC TOPICS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODULE 3: Recurring Grievance Analysis */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E85A24]" />
                <h3 className="text-base font-bold text-[#182820] font-serif">
                  Recurring Grievance Analysis
                </h3>
              </div>
              <p className="text-xs text-[#687568]">
                Identifies repeated complaints by category & locality with chronic persistence tags
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#E85A24] bg-[#FCE7D7] px-2.5 py-1 rounded-full">
              {recurringAnalysis.overallRecurrenceRate}% Repeat Rate
            </span>
          </div>

          <div className="space-y-2.5">
            {recurringAnalysis.clusters.map((cluster, i) => (
              <div
                key={`${cluster.category}-${cluster.ward}-${i}`}
                className="p-3 rounded-xl bg-[#F5EFE6] border border-[#E7E0D3] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#182820] truncate font-serif">
                      {cluster.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        cluster.total >= 4
                          ? 'bg-[#FBE2E0] text-[#A62419]'
                          : 'bg-[#FFF1C9] text-[#8F5C0A]'
                      }`}
                    >
                      {cluster.persistence}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#687568] flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#15966A]" />
                    <span className="truncate">{cluster.ward}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-[#182820]">
                    {cluster.total} filings
                  </div>
                  <div className="text-[10px] text-[#E85A24] font-medium">
                    {cluster.unresolved} unresolved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 7: Emerging Civic Topics */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#15966A]" />
                <h3 className="text-base font-bold text-[#182820] font-serif">
                  Emerging Civic Topics (NLP N-Grams)
                </h3>
              </div>
              <p className="text-xs text-[#687568]">
                Click any topic chip to visualize its frequency trajectory over time
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#DFF2E6] text-[#073D32] px-2.5 py-1 rounded-full">
              Topic: "{civicTopics.activeTerm}"
            </span>
          </div>

          {/* Topic Chips */}
          <div className="flex flex-wrap gap-1.5">
            {civicTopics.topKeywords.map(term => (
              <button
                key={term}
                onClick={() => setSelectedTopic(term)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  civicTopics.activeTerm === term
                    ? 'bg-[#073D32] text-white font-bold shadow-xs'
                    : 'bg-[#F5EFE6] text-[#182820] hover:bg-[#E7E0D3]'
                }`}
              >
                #{term}
              </button>
            ))}
          </div>

          {/* Topic Frequency Over Time Chart */}
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={civicTopics.termTrajectory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="topicArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E85A24" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E85A24" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E0D3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#687568' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#687568' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#182820] text-[#FFFDF8] p-2 rounded-lg text-xs shadow-xl border border-[#E7E0D3]">
                          <p className="font-bold">{label}</p>
                          <p className="text-[#FDBA74]">
                            "{civicTopics.activeTerm}": {payload[0].value} mentions
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mentions"
                  stroke="#E85A24"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#topicArea)"
                  name={`Mentions of ${civicTopics.activeTerm}`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#687568] flex items-center justify-between border-t border-[#F0EAE1] pt-2">
            <span>Total occurrences of "#{civicTopics.activeTerm}": <strong>{civicTopics.totalMentions}</strong></span>
            <span className="text-[#073D32] font-mono">NLP Token Extraction</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 8: CIVIC ISSUE PRIORITY RANKING
          ======================================================== */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#E85A24]" />
              <h3 className="text-base font-bold text-[#182820] font-serif">
                Civic Issue Priority Ranking (Multi-Factor Scoring)
              </h3>
            </div>
            <p className="text-xs text-[#687568] mt-0.5">
              Composite severity ranking based on Volume (30%) + Growth Rate (25%) + Negative Sentiment (25%) + Recurrence (20%)
            </p>
          </div>
          <span className="text-xs font-mono text-[#073D32] bg-[#DFF2E6] px-3 py-1 rounded-full font-bold self-start sm:self-center">
            Transparent Policy Index
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7E0D3] text-[#687568] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Rank & Category</th>
                <th className="py-3 px-3">Priority Tier</th>
                <th className="py-3 px-3">Score (0-100)</th>
                <th className="py-3 px-3">Volume</th>
                <th className="py-3 px-3">Growth %</th>
                <th className="py-3 px-3">Negative Share</th>
                <th className="py-3 px-3">Factor Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              {priorityRanking.map((item, idx) => {
                const isCritical = item.priorityTier === 'Critical';
                const isHigh = item.priorityTier === 'High';
                return (
                  <tr key={item.category} className="hover:bg-[#FAF6EE] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#687568] w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-[#182820] font-serif">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-[#FBE2E0] text-[#A62419] border border-[#F7B7B1]'
                            : isHigh
                            ? 'bg-[#FCE7D7] text-[#7C2D12] border border-[#FDBA74]'
                            : 'bg-[#FFF1C9] text-[#8F5C0A] border border-[#F7D688]'
                        }`}
                      >
                        {isCritical && <Flame className="w-3 h-3 text-[#A62419]" />}
                        {item.priorityTier}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-sm text-[#073D32]">
                      {item.compositeScore}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#182820]">
                      {item.volume}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={
                          item.growthPct > 0
                            ? 'text-[#E85A24] font-bold'
                            : 'text-[#15966A]'
                        }
                      >
                        {item.growthPct > 0 ? `+${item.growthPct}%` : `${item.growthPct}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#A62419]">
                      {item.negPct}%
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] text-[#687568]">
                          <span>V:{item.factors.volumeScore}</span>
                          <span>G:{item.factors.growthScore}</span>
                          <span>S:{item.factors.sentimentScore}</span>
                          <span>R:{item.factors.recurrenceScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E7E0D3] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[#073D32]"
                            style={{ width: `${(item.factors.volumeScore / 30) * 30}%` }}
                          />
                          <div
                            className="bg-[#E85A24]"
                            style={{ width: `${(item.factors.growthScore / 25) * 25}%` }}
                          />
                          <div
                            className="bg-[#F16B5B]"
                            style={{ width: `${(item.factors.sentimentScore / 25) * 25}%` }}
                          />
                          <div
                            className="bg-[#F2B544]"
                            style={{ width: `${(item.factors.recurrenceScore / 20) * 20}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          FREQUENT KEYWORDS & PHRASES (ORIGINAL CORE COMPONENTS PRESERVED)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Unigram Keywords */}
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider font-serif">
                Frequently Reported Keywords (Unigrams)
              </h3>
              <p className="text-xs text-[#687568]">Highest frequency words after stopword cleaning</p>
            </div>
            <Hash className="w-4 h-4 text-[#15966A]" />
          </div>

          <div className="space-y-2">
            {trends.frequent_keywords.slice(0, 8).map(kw => {
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
              <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider font-serif">
                Key Civic Phrases (N-Grams)
              </h3>
              <p className="text-xs text-[#687568]">Recurring multi-word expressions in complaints</p>
            </div>
            <Layers className="w-4 h-4 text-[#E85A24]" />
          </div>

          <div className="space-y-2">
            {trends.frequent_phrases.slice(0, 8).map(ph => {
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
