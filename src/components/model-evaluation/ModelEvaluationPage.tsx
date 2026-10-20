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
import { CIVIC_THEME } from '../../constants/theme';

export const ModelEvaluationPage: React.FC = () => {
  const { metrics, selectedModel, setSelectedModel, records, cleanActiveDataset, isLoading } = useCivic();
  const [activeMatrixTab, setActiveMatrixTab] = useState<'category' | 'sentiment'>('category');

  const [selectedCell, setSelectedCell] = useState<{ actual: string; pred: string; count: number; isDiagonal: boolean } | null>(null);

  const catMetrics = metrics?.category_classification;
  const sentMetrics = metrics?.sentiment_analysis;
  const currentMetrics = activeMatrixTab === 'category' ? catMetrics : sentMetrics;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Empirical Model Evaluation & Validation
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Data Science Validation · Evaluated strictly on 25% held-out test splits without fabricated figures.
          </p>
        </div>

        {/* Model Label */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDF8] rounded-full border border-[#E7E0D3] text-xs shadow-2xs">
          <span className="text-[#687568] font-medium">Model:</span>
          <span className="font-bold text-[#073D32] font-mono">TF-IDF + Logistic Regression</span>
        </div>
      </div>

      {/* Dataset Partitioning Protocol Card */}
      <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#073D32] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#15966A]" />
            <span>Dataset Partitioning Protocol</span>
          </div>
          <span className="text-xs text-[#687568] font-mono font-bold">
            {records.length} Total Verified Instances
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3.5 bg-[#FBF7EF] rounded-xl border border-[#E7E0D3]">
            <div className="text-[#687568] font-semibold">Training Corpus (75%)</div>
            <div className="text-lg font-bold text-[#073D32] font-mono tabular-nums mt-0.5">
              {currentMetrics ? currentMetrics.train_samples : Math.round(records.length * 0.75)} samples
            </div>
            <div className="text-[11px] text-[#687568] mt-1">Used to fit TF-IDF vocabulary & model parameters</div>
          </div>

          <div className="p-3.5 bg-[#FBF7EF] rounded-xl border border-[#E7E0D3]">
            <div className="text-[#687568] font-semibold">Held-Out Test Set (25%)</div>
            <div className="text-lg font-bold text-[#073D32] font-mono tabular-nums mt-0.5">
              {currentMetrics ? currentMetrics.test_samples : Math.round(records.length * 0.25)} samples
            </div>
            <div className="text-[11px] text-[#687568] mt-1">Stratified by class to preserve real label distribution</div>
          </div>

          <div className="p-3.5 bg-[#FBF7EF] rounded-xl border border-[#E7E0D3]">
            <div className="text-[#687568] font-semibold">Feature Representation</div>
            <div className="text-lg font-bold text-[#E85A24] font-mono mt-0.5">TF-IDF (1-2 N-Grams)</div>
            <div className="text-[11px] text-[#687568] mt-1">Sublinear term frequency scaling & stopword removal</div>
          </div>
        </div>
      </div>

      {/* Model Task Tab Selector */}
      <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMatrixTab('category')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
              activeMatrixTab === 'category'
                ? 'bg-[#073D32] text-white shadow-xs'
                : 'text-[#687568] hover:text-[#182820] bg-[#FFFDF8] border border-[#E7E0D3]'
            }`}
          >
            Complaint Categorization (8 Domains)
          </button>
          <button
            onClick={() => setActiveMatrixTab('sentiment')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
              activeMatrixTab === 'sentiment'
                ? 'bg-[#073D32] text-white shadow-xs'
                : 'text-[#687568] hover:text-[#182820] bg-[#FFFDF8] border border-[#E7E0D3]'
            }`}
          >
            Sentiment Polarity (3 Classes)
          </button>
        </div>

        <button
          onClick={cleanActiveDataset}
          disabled={isLoading}
          className="text-xs text-[#073D32] hover:text-[#15966A] font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Models</span>
        </button>
      </div>

      {currentMetrics ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Overall Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-[#687568] font-bold">Test Set Accuracy</span>
              <div className="text-3xl font-extrabold text-[#073D32] font-mono tabular-nums">
                {(currentMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-[#687568] pt-1 border-t border-[#E7E0D3]">
                Exact matches on held-out split
              </div>
            </div>

            <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-[#687568] font-bold">Weighted Precision</span>
              <div className="text-3xl font-extrabold text-[#182820] font-mono tabular-nums">
                {(currentMetrics.precision_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-[#687568] pt-1 border-t border-[#E7E0D3]">
                Weighted by class support
              </div>
            </div>

            <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-[#687568] font-bold">Weighted Recall</span>
              <div className="text-3xl font-extrabold text-[#182820] font-mono tabular-nums">
                {(currentMetrics.recall_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-[#687568] pt-1 border-t border-[#E7E0D3]">
                True positive retrieval rate
              </div>
            </div>

            <div className="p-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs space-y-1">
              <span className="text-xs text-[#687568] font-bold">Weighted F1-Score</span>
              <div className="text-3xl font-extrabold text-[#15966A] font-mono tabular-nums">
                {(currentMetrics.f1_weighted * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-[#687568] pt-1 border-t border-[#E7E0D3]">
                Macro F1: {(currentMetrics.f1_macro * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confusion Matrix Heatmap */}
          <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#182820] font-serif">
                Confusion Matrix Heatmap (Actual vs Predicted)
              </h3>
              <p className="text-xs text-[#687568]">
                Rows represent true ground-truth classes; columns represent predicted classes on held-out evaluation test instances.
              </p>
            </div>

            <div className="overflow-x-auto pt-2">
              <div className="inline-block min-w-full align-middle">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2.5 border border-[#E7E0D3] bg-[#F5EFE6] text-[#182820] text-left font-bold text-[11px]">
                        Actual \ Predicted
                      </th>
                      {currentMetrics.classes.map((cls) => (
                        <th
                          key={cls}
                          className="p-2.5 border border-[#E7E0D3] bg-[#F5EFE6] text-[#182820] font-bold text-center text-[11px] max-w-[100px] truncate"
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
                        <td className="p-2.5 border border-[#E7E0D3] font-bold bg-[#FBF7EF] text-[#182820] whitespace-nowrap">
                          {trueCls}
                        </td>
                        {currentMetrics.classes.map((predCls, j) => {
                          const count = currentMetrics.confusion_matrix[i]?.[j] ?? 0;
                          const isDiagonal = i === j;
                          return (
                            <td
                              key={predCls}
                              onClick={() => setSelectedCell({ actual: trueCls, pred: predCls, count, isDiagonal })}
                              className={`p-2.5 border border-[#E7E0D3] text-center font-mono tabular-nums transition-all cursor-pointer hover:ring-2 hover:ring-[#15966A]/50 ${
                                isDiagonal && count > 0
                                  ? 'bg-[#DFF2E6] text-[#073D32] font-bold'
                                  : count > 0
                                  ? 'bg-[#FBE2E0] text-[#A62419] font-medium'
                                  : 'text-[#687568]/50 bg-[#FFFDF8]'
                              }`}
                              title={`Actual: ${trueCls} | Predicted: ${predCls} (${count})`}
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

            {/* Selected Cell Inspector */}
            {selectedCell && (
              <div className="p-4 rounded-xl bg-[#FBF7EF] border border-[#E7E0D3] flex items-center justify-between text-xs animate-in fade-in">
                <div>
                  <span className="text-[#687568]">Selected Matrix Pair:</span>{' '}
                  <strong className="text-[#182820]">Actual: {selectedCell.actual}</strong> →{' '}
                  <strong className="text-[#182820]">Predicted: {selectedCell.pred}</strong>
                </div>
                <div className="font-mono font-bold text-[#073D32]">
                  {selectedCell.count} instances ({selectedCell.isDiagonal ? 'Correct Classification' : 'Misclassified'})
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-[#687568]">
          Computing held-out model evaluation metrics...
        </div>
      )}
    </div>
  );
};
