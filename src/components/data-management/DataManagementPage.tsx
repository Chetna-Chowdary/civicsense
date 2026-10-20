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
import { CIVIC_THEME } from '../../constants/theme';

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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Grievance Data Management & Cleaning
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Data Collection & Preprocessing Phase · Validate schemas, eliminate duplicate records, sanitize null values.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleDownloadTemplateCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#182820] bg-[#FFFDF8] border border-[#E7E0D3] rounded-full hover:bg-[#F5EFE6] transition-all shadow-2xs"
            title="Download CSV format template"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#687568]" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={resetToDemoDataset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#182820] bg-[#FFFDF8] border border-[#E7E0D3] rounded-full hover:bg-[#F5EFE6] transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#687568]" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={handleDownloadCleanedCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#073D32] bg-[#DFF2E6] border border-[#A3E0C0] rounded-full hover:bg-[#cceed9] transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#15966A]" />
            <span>Export Cleaned CSV</span>
          </button>
        </div>
      </div>

      {/* Dataset Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Total Loaded Rows</span>
          <div className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
            {datasetQuality.total_rows}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            {datasetQuality.total_columns} detected schema columns
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Duplicate Records</span>
          <div className={`text-3xl font-extrabold font-mono tabular-nums ${datasetQuality.duplicate_count > 0 ? 'text-[#E85A24]' : 'text-[#15966A]'}`}>
            {datasetQuality.duplicate_count}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            {datasetQuality.duplicate_count === 0 ? 'Zero redundancy detected' : 'Action recommended: clean data'}
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Missing / Null Cells</span>
          <div className={`text-3xl font-extrabold font-mono tabular-nums ${datasetQuality.total_missing_cells > 0 ? 'text-[#F16B5B]' : 'text-[#15966A]'}`}>
            {datasetQuality.total_missing_cells}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
            Across text, category & timestamps
          </div>
        </div>

        <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-[#687568] font-bold">Model Readiness State</span>
          <div className="flex items-center gap-2 pt-0.5">
            {datasetQuality.clean_ready ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#15966A]" />
                <span className="text-sm font-bold text-[#073D32]">Validated & Clean</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-[#E85A24]" />
                <span className="text-sm font-bold text-[#E85A24]">Requires Sanitation</span>
              </>
            )}
          </div>
          <div className="text-xs text-[#687568] pt-1 border-t border-[#E7E0D3]">
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
            className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#15966A] bg-[#DFF2E6]/50'
                : 'border-[#E7E0D3] hover:border-[#15966A] bg-[#FFFDF8]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#DFF2E6] text-[#073D32] flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-[#15966A]" />
            </div>
            <h3 className="text-sm font-bold text-[#182820] mb-1">
              Upload External Grievance Dataset (CSV)
            </h3>
            <p className="text-xs text-[#687568] max-w-sm mb-3">
              Drag and drop your CPGRAMS or municipal CSV file here, or click to browse.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#687568]">
              <span>Required: complaint_text</span>
              <span>·</span>
              <span>Optional: category, sentiment, date, ward</span>
            </div>
          </div>
        </div>

        {/* Automated Preprocessing Trigger Box (Forest Green Gradient) */}
        <div className="p-6 bg-gradient-to-br from-[#073D32] to-[#0c4e40] text-[#FFFDF8] rounded-2xl flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#15966A]">
              <FileCheck className="w-4 h-4" />
              <span>Automated NLP Preprocessing</span>
            </div>
            <h4 className="text-base font-bold text-[#FFFDF8] font-serif">Execute Data Cleaning Pipeline</h4>
            <p className="text-xs text-[#DFF2E6]/90 leading-relaxed">
              Strips URLs, cleans punctuation, lowercases text, removes stopwords, handles duplicate grievances, and validates timestamps for modeling.
            </p>
          </div>

          <button
            onClick={cleanActiveDataset}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-[#073D32] bg-[#FFFDF8] hover:bg-white rounded-full transition-all shadow-xs disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#15966A] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Execute Sanitation & Train Models</span>
          </button>
        </div>
      </div>

      {/* Dataset Inspection Tabs */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E0D3] flex items-center justify-between">
          <div className="flex items-center gap-2 bg-[#F5EFE6] p-1 rounded-full">
            <button
              onClick={() => setPreviewTab('sample')}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                previewTab === 'sample'
                  ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                  : 'text-[#687568] hover:text-[#182820]'
              }`}
            >
              Data Preview (First 8 Rows)
            </button>
            <button
              onClick={() => setPreviewTab('columns')}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${
                previewTab === 'columns'
                  ? 'bg-[#FFFDF8] text-[#073D32] shadow-xs'
                  : 'text-[#687568] hover:text-[#182820]'
              }`}
            >
              Column Schema & Null Diagnostics
            </button>
          </div>

          <div className="text-xs text-[#687568] font-mono font-bold">
            Showing verified clean records
          </div>
        </div>

        {previewTab === 'sample' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF7EF] text-[#687568] uppercase tracking-wider text-[11px] font-bold border-b border-[#E7E0D3]">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Complaint Text</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Sentiment</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Ward / Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3]">
                {records.slice(0, 8).map((r) => (
                  <tr key={r.id} className="hover:bg-[#FBF7EF] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#687568] whitespace-nowrap">{r.id}</td>
                    <td className="px-5 py-3.5 text-[#182820] font-medium max-w-md truncate">{r.complaint_text}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#182820] font-semibold">{r.category}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-[#15966A]">{r.sentiment}</td>
                    <td className="px-5 py-3.5 font-mono text-[#687568] whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3.5 text-[#687568] whitespace-nowrap truncate">{r.ward_or_region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasetQuality.columns.map((col) => (
                <div key={col} className="p-4 rounded-xl border border-[#E7E0D3] bg-[#FBF7EF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-[#073D32]">{col}</span>
                    <span className="text-[10px] uppercase font-bold text-[#687568] bg-[#EAE2D5] px-2 py-0.5 rounded">
                      {datasetQuality.column_types[col] || 'string'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[#687568] pt-2 border-t border-[#E7E0D3]">
                    <span>Missing Values:</span>
                    <span className="font-mono font-bold text-[#182820]">
                      {datasetQuality.missing_by_column[col] ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
