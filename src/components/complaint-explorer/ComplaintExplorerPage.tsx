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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Grievance Records Explorer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and inspect verified complaint logs across administrative wards.
          </p>
        </div>

        <button
          onClick={handleDownloadFiltered}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Filtered ({filtered.length})</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search complaint text, ID, or ward..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="All">All Categories</option>
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
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800 font-mono">{filtered.length}</strong> matching records
            </span>
            {(search || selectedCategory !== 'All' || selectedSentiment !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedSentiment('All');
                  setPage(1);
                }}
                className="text-teal-700 hover:text-teal-900 font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
          <span className="font-mono tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Grievance ID</th>
                <th className="px-5 py-3">Complaint Text</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Sentiment</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Ward / Area</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {pagedRecords.length > 0 ? (
                pagedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="px-5 py-3 text-slate-900 font-medium max-w-md truncate">
                      {r.complaint_text}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-700">
                      {r.category}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap font-medium">
                      <span className={
                        r.sentiment === 'Positive'
                          ? 'text-emerald-700'
                          : r.sentiment === 'Negative'
                          ? 'text-rose-700'
                          : 'text-sky-700'
                      }>
                        {r.sentiment}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap truncate max-w-xs">
                      {r.ward_or_region}
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap truncate max-w-xs">
                      {r.department}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveRecord(r)}
                        className="text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No complaints matching the selected search query or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing{' '}
            <strong className="text-slate-900 font-mono">
              {(currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900 font-mono">
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{' '}
            of <strong className="text-slate-900 font-mono">{filtered.length}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Detail Inspection Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">{activeRecord.id}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">{activeRecord.date}</span>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Citizen Complaint Text
                </span>
                <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
                  "{activeRecord.complaint_text}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Category</span>
                  <span className="text-sm font-bold text-slate-900">{activeRecord.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Assigned Sentiment</span>
                  <span className={`text-sm font-bold ${
                    activeRecord.sentiment === 'Positive' ? 'text-emerald-700' :
                    activeRecord.sentiment === 'Negative' ? 'text-rose-700' : 'text-sky-700'
                  }`}>
                    {activeRecord.sentiment}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Ward / Jurisdiction</span>
                  <span className="text-slate-800 font-medium">{activeRecord.ward_or_region}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Department</span>
                  <span className="text-slate-800 font-medium">{activeRecord.department}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
