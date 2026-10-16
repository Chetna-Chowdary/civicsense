import React, { useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  Table,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ModelMetrics } from '../../types';

export const ModelEvaluationPage: React.FC = () => {
  const { metrics, selectedModel, setSelectedModel, records, cleanActiveDataset, isLoading } = useCivic();
  const [activeMatrixTab, setActiveMatrixTab] = useState<'category' | 'sentiment'>('category');

  const [selectedCell, setSelectedCell] = useState<{ actual: string; pred: string; count: number; isDiagonal: boolean } | null>(null);

  const catMetrics = metrics?.category_classification;
  const sentMetrics = metrics?.sentiment_analysis;
  const currentMetrics = activeMatrixTab === 'category' ? catMetrics : sentMetrics;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Empirical Model Evaluation & Validation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data Science Review-2 Validation · Evaluated strictly on 25% held-out test splits without fabricated figures.
          </p>
        </div>

        {/* Fixed Model Label */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Model:</span>
          <span className="font-semibold text-slate-900 font-mono">TF-IDF + Logistic Regression</span>
        </div>
      </div>

      {/* Dataset Partitioning Protocol Card */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Dataset Partitioning Protocol</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {records.length} Total Verified Instances
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500">Training Corpus (75%)</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {currentMetrics ? currentMetrics.train_samples : Math.round(records.length * 0.75)} samples
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Used to fit TF-IDF vocabulary & model parameters</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500">Held-Out Test Set (25%)</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {currentMetrics ? currentMetrics.test_samples : Math.round(records.length * 0.25)} samples
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Stratified by class to preserve real label distribution</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-slate-500">Feature Representation</div>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">TF-IDF (1-2 N-Grams)</div>
            <div className="text-[11px] text-slate-500 mt-1">Sublinear term frequency scaling & stopword removal</div>
          </div>
        </div>
      </div>

      {/* Model Task Tab Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMatrixTab('category')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeMatrixTab === 'category'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Complaint Categorization (8 Classes)
          </button>
          <button
            onClick={() => setActiveMatrixTab('sentiment')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeMatrixTab === 'sentiment'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Sentiment Polarity (3 Classes)
          </button>
        </div>

        <button
          onClick={cleanActiveDataset}
          disabled={isLoading}
          className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Models</span>
        </button>
      </div>

      {currentMetrics ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Overall Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Test Set Accuracy</span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {(currentMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Exact matches on held-out split
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Weighted Precision</span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {(currentMetrics.precision_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Weighted by class support
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Weighted Recall</span>
              <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {(currentMetrics.recall_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                True positive retrieval rate
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Weighted F1-Score</span>
              <div className="text-3xl font-bold text-teal-700 font-mono tabular-nums">
                {(currentMetrics.f1_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Macro F1: {(currentMetrics.f1_macro * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confusion Matrix Heatmap */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confusion Matrix Heatmap (Actual vs Predicted)
              </h3>
              <p className="text-xs text-slate-500">
                Rows represent true ground-truth classes; columns represent predicted classes on held-out evaluation test instances.
              </p>
            </div>

            <div className="overflow-x-auto pt-2">
              <div className="inline-block min-w-full align-middle">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-100 text-slate-700 text-left font-bold text-[11px]">
                        Actual \ Predicted
                      </th>
                      {currentMetrics.classes.map((cls) => (
                        <th
                          key={cls}
                          className="p-2 border border-slate-200 bg-slate-100 text-slate-700 font-bold text-center text-[11px] max-w-[100px] truncate"
                          title={cls}
                        >
                          {cls}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentMetrics.classes.map((trueCls, i) => (
                      <tr key={trueCls}>
                        <td className="p-2.5 border border-slate-200 font-semibold bg-slate-50 text-slate-800 whitespace-nowrap">
                          {trueCls}
                        </td>
                        {currentMetrics.classes.map((predCls, j) => {
                          const count = currentMetrics.confusion_matrix[i]?.[j] ?? 0;
                          const isDiagonal = i === j;
                          return (
                            <td
                              key={predCls}
                              onClick={() => setSelectedCell({ actual: trueCls, pred: predCls, count, isDiagonal })}
                              className={`p-2.5 border border-slate-200 text-center font-mono tabular-nums transition-all cursor-pointer hover:ring-2 hover:ring-teal-500/50 ${
                                isDiagonal && count > 0
                                  ? 'bg-teal-500/20 text-teal-950 font-bold'
                                  : count > 0
                                  ? 'bg-rose-50 text-rose-800 font-medium'
                                  : 'text-slate-400 bg-white'
                              }`}
                              title={`Click to inspect: Actual ${trueCls} vs Predicted ${predCls}`}
                            >
                              {count}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedCell && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">Selected Cell:</span>
                  <span>
                    Ground Truth <strong>{selectedCell.actual}</strong> was classified as <strong>{selectedCell.pred}</strong> in <strong className="font-mono">{selectedCell.count}</strong> test sample(s).
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${selectedCell.isDiagonal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedCell.isDiagonal ? 'True Positive (Correct)' : 'Misclassification'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-teal-500/30 border border-teal-500 rounded-xs" />
                <span>Diagonal = Correct Predictions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-100 border border-rose-300 rounded-xs" />
                <span>Off-Diagonal = Confused / Misclassified</span>
              </div>
              <span className="text-slate-400 italic ml-auto">Click any cell to inspect breakdown</span>
            </div>
          </div>

          {/* Classification Report Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Per-Class Classification Report</h3>
              <p className="text-xs text-slate-500">
                Detailed precision, recall, and harmonic F1-score across all domain classes
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Class Name</th>
                    <th className="px-6 py-3 font-mono">Precision</th>
                    <th className="px-6 py-3 font-mono">Recall</th>
                    <th className="px-6 py-3 font-mono">F1-Score</th>
                    <th className="px-6 py-3 font-mono">Support (Test Samples)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {currentMetrics.classes.map((cls) => {
                    const row = currentMetrics.classification_report[cls] || {
                      precision: 0,
                      recall: 0,
                      'f1-score': 0,
                      support: 0
                    };
                    return (
                      <tr key={cls} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                          {cls}
                        </td>
                        <td className="px-6 py-3.5 font-mono tabular-nums text-slate-700">
                          {(row.precision * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3.5 font-mono tabular-nums text-slate-700">
                          {(row.recall * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3.5 font-mono tabular-nums font-semibold text-teal-800">
                          {(row['f1-score'] * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-3.5 font-mono tabular-nums text-slate-500">
                          {row.support}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          Calculating model evaluation metrics on held-out test splits...
        </div>
      )}
    </div>
  );
};
