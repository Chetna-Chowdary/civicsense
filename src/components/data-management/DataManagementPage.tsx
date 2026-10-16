import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  FileCheck,
  Table,
  RotateCcw
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { exportRecordsToCSV } from '../../services/mlEngine';

export const DataManagementPage: React.FC = () => {
  const {
    records,
    datasetQuality,
    cleanActiveDataset,
    resetToDemoDataset,
    uploadCSVContent,
    isLoading
  } = useCivic();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewTab, setPreviewTab] = useState<'sample' | 'columns'>('sample');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        uploadCSVContent(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadCleanedCSV = () => {
    const csvData = exportRecordsToCSV(records);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `civicsense_processed_grievances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplateCSV = () => {
    const template = `id,complaint_text,category,sentiment,date,ward_or_region,department,status,urgency
GRV-TEST-001,"Large pothole on arterial road causing traffic congestion",Roads,Negative,2026-08-01,Ward 01 - North,Roads Division,Open,High
GRV-TEST-002,"Prompt restoration of drinking water supply after line break",Water Supply,Positive,2026-08-02,Ward 04 - East,Water Board,Resolved,Low
GRV-TEST-003,"What are the operational hours for citizen grievance desk?",Other Public Services,Neutral,2026-08-03,Ward 10 - Central,Civic Operations,Resolved,Low`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `civicsense_upload_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Data Management & Cleaning</h2>
          <p className="text-xs text-slate-500 mt-1">
            Data Collection & Preprocessing Phase · Validate schemas, eliminate duplicate records, sanitize null values.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleDownloadTemplateCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title="Download CSV format template"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={resetToDemoDataset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={handleDownloadCleanedCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Cleaned CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Loaded Rows</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {datasetQuality.total_rows}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            {datasetQuality.total_columns} detected schema columns
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Duplicate Records</span>
          <div className={`text-2xl font-bold font-mono tabular-nums ${datasetQuality.duplicate_count > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {datasetQuality.duplicate_count}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            {datasetQuality.duplicate_count === 0 ? 'Zero redundancy detected' : 'Action recommended: clean data'}
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Missing / Null Cells</span>
          <div className={`text-2xl font-bold font-mono tabular-nums ${datasetQuality.total_missing_cells > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {datasetQuality.total_missing_cells}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Across text, category & timestamps
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Model Readiness State</span>
          <div className="flex items-center gap-2 pt-0.5">
            {datasetQuality.clean_ready ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Validated & Clean</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Requires Sanitation</span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
            Optimal for TF-IDF training
          </div>
        </div>
      </div>

      {/* CSV Upload Dropzone & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Upload External Grievance Dataset (CSV)
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-3">
              Drag and drop your CPGRAMS or municipal CSV file here, or click to browse.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Required: complaint_text</span>
              <span aria-hidden="true">·</span>
              <span>Optional: category, sentiment, date, ward</span>
            </div>
          </div>
        </div>

        {/* Automated Preprocessing Trigger Box */}
        <div className="p-6 bg-slate-900 text-white rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <FileCheck className="w-4 h-4" />
              <span>Automated NLP Preprocessing</span>
            </div>
            <h4 className="text-base font-bold text-white">Execute Data Cleaning Pipeline</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Strips URLs, cleans punctuation, lowercases text, removes stopwords, handles duplicate grievances, and validates timestamps for modeling.
            </p>
          </div>

          <button
            onClick={cleanActiveDataset}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Execute Sanitation & Train Models</span>
          </button>
        </div>
      </div>

      {/* Dataset Inspection Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setPreviewTab('sample')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                previewTab === 'sample'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Preview (First 8 Rows)
            </button>
            <button
              onClick={() => setPreviewTab('columns')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                previewTab === 'columns'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Column Schema & Null Diagnostics
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {records.length} records
          </div>
        </div>

        {previewTab === 'sample' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Complaint Text</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Sentiment</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Ward / Area</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {records.slice(0, 8).map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-mono text-slate-600">{row.id}</td>
                    <td className="px-5 py-3 text-slate-900 font-medium max-w-sm truncate">
                      {row.complaint_text}
                    </td>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{row.category}</td>
                    <td className="px-5 py-3 whitespace-nowrap font-medium">
                      <span className={
                        row.sentiment === 'Positive' ? 'text-emerald-700' :
                        row.sentiment === 'Negative' ? 'text-rose-700' : 'text-sky-700'
                      }>
                        {row.sentiment}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">{row.date}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.ward_or_region}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Column Name</th>
                  <th className="px-6 py-3">Data Type</th>
                  <th className="px-6 py-3">Missing Values</th>
                  <th className="px-6 py-3">Completeness Ratio</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datasetQuality.columns.map(col => {
                  const missing = datasetQuality.missing_by_column[col] || 0;
                  const ratio = datasetQuality.total_rows > 0
                    ? Math.round(((datasetQuality.total_rows - missing) / datasetQuality.total_rows) * 100)
                    : 100;
                  return (
                    <tr key={col} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5 font-mono font-semibold text-slate-800">{col}</td>
                      <td className="px-6 py-3.5 text-slate-600">{datasetQuality.column_types[col] || 'string'}</td>
                      <td className="px-6 py-3.5 font-mono tabular-nums text-slate-700">{missing}</td>
                      <td className="px-6 py-3.5 font-mono tabular-nums text-slate-700">{ratio}%</td>
                      <td className="px-6 py-3.5">
                        {missing === 0 ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Contains Nulls
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
