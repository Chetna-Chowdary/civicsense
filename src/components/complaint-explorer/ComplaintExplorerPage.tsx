import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { GrievanceRecord, ServiceCategory, SentimentType } from '../../types';
import { ALL_CATEGORIES, ALL_SENTIMENTS, exportRecordsToCSV } from '../../services/mlEngine';
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';

export const ComplaintExplorerPage: React.FC = () => {
  const { records } = useCivic();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [activeRecord, setActiveRecord] = useState<GrievanceRecord | null>(null);

  // Filter records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !search ||
        r.complaint_text.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.ward_or_region.toLowerCase().includes(search.toLowerCase());

      const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
      const matchSent = selectedSentiment === 'All' || r.sentiment === selectedSentiment;
      const matchStatus = selectedStatus === 'All' || r.status === selectedStatus;

      return matchSearch && matchCat && matchSent && matchStatus;
    });
  }, [records, search, selectedCategory, selectedSentiment, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRecords = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadFiltered = () => {
    const csv = exportRecordsToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civicsense_filtered_records_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Citizen Grievance Records Explorer
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Browse, filter, and inspect verified complaint logs across administrative wards.
          </p>
        </div>

        <button
          onClick={handleDownloadFiltered}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#073D32] bg-[#FFFDF8] border border-[#E7E0D3] rounded-full hover:bg-[#F5EFE6] transition-all whitespace-nowrap self-start md:self-auto shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#15966A]" />
          <span>Export Filtered ({filtered.length})</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#687568] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search complaint text, ID, or ward..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FBF7EF] border border-[#E7E0D3] rounded-xl text-[#182820] focus:outline-hidden focus:ring-2 focus:ring-[#15966A]/30 focus:border-[#15966A]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FBF7EF] border border-[#E7E0D3] rounded-xl text-[#182820] focus:outline-hidden focus:ring-2 focus:ring-[#15966A]/30 focus:border-[#15966A] font-medium"
            >
              <option value="All">All Categories (8 Domains)</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <select
              value={selectedSentiment}
              onChange={(e) => {
                setSelectedSentiment(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FBF7EF] border border-[#E7E0D3] rounded-xl text-[#182820] focus:outline-hidden focus:ring-2 focus:ring-[#15966A]/30 focus:border-[#15966A] font-medium"
            >
              <option value="All">All Sentiments</option>
              {ALL_SENTIMENTS.map((sent) => (
                <option key={sent} value={sent}>
                  {sent}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center justify-between text-xs text-[#687568] pt-2 border-t border-[#E7E0D3]">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#182820] font-mono">{filtered.length}</strong> matching records
            </span>
            {(search || selectedCategory !== 'All' || selectedSentiment !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedSentiment('All');
                  setPage(1);
                }}
                className="text-[#E85A24] hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>
          <span className="font-mono tabular-nums font-semibold">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF7EF] text-[#687568] uppercase tracking-wider text-[11px] font-bold border-b border-[#E7E0D3]">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Complaint Text</th>
                <th className="px-5 py-3.5">Domain</th>
                <th className="px-5 py-3.5">Sentiment Polarity</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Ward / Area</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0D3] font-normal">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((r) => {
                  const sTheme = SENTIMENT_THEME[r.sentiment] || SENTIMENT_THEME.Neutral;
                  const dTheme = DOMAIN_THEME[r.category] || DOMAIN_THEME['Other Public Services'];
                  return (
                    <tr key={r.id} className="hover:bg-[#FBF7EF] transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#687568] whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="px-5 py-3.5 text-[#182820] font-medium max-w-md truncate">
                        {r.complaint_text}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                          style={{ backgroundColor: dTheme.bg, color: dTheme.text, borderColor: dTheme.border }}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5"
                          style={{ backgroundColor: sTheme.bg, color: sTheme.text, borderColor: sTheme.border }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sTheme.color }} />
                          {r.sentiment}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#687568] tabular-nums whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="px-5 py-3.5 text-[#687568] whitespace-nowrap truncate max-w-xs">
                        {r.ward_or_region}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveRecord(r)}
                          className="p-1.5 text-[#073D32] hover:bg-[#DFF2E6] rounded-lg transition-colors"
                          title="Inspect grievance details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#687568]">
                    No grievance records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 bg-[#FBF7EF] border-t border-[#E7E0D3] flex items-center justify-between text-xs">
          <span className="text-[#687568]">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E7E0D3] bg-[#FFFDF8] hover:bg-[#F5EFE6] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums font-bold text-[#182820]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E7E0D3] bg-[#FFFDF8] hover:bg-[#F5EFE6] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182820]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E0D3] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#073D32] bg-[#DFF2E6] px-2.5 py-1 rounded-full">
                  {activeRecord.id}
                </span>
                <span className="text-xs text-[#687568]">{activeRecord.date}</span>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="p-1 text-[#687568] hover:text-[#182820] rounded-full hover:bg-[#F5EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#687568] uppercase">Full Complaint Text</label>
                <p className="text-sm text-[#182820] leading-relaxed mt-1 p-3.5 bg-[#FBF7EF] rounded-xl border border-[#E7E0D3]">
                  {activeRecord.complaint_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-[#687568] uppercase">Classified Domain</label>
                  <div className="font-bold text-[#073D32] mt-0.5">{activeRecord.category}</div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#687568] uppercase">Sentiment</label>
                  <div className="font-bold mt-0.5" style={{ color: SENTIMENT_THEME[activeRecord.sentiment]?.color }}>
                    {activeRecord.sentiment}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#687568] uppercase">Ward / Region</label>
                  <div className="font-medium text-[#182820] mt-0.5">{activeRecord.ward_or_region}</div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#687568] uppercase">Responsible Department</label>
                  <div className="font-medium text-[#182820] mt-0.5">{activeRecord.department}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E7E0D3]">
              <button
                onClick={() => setActiveRecord(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
