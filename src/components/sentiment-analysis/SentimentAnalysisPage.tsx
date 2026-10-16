import React, { useState } from 'react';
import {
  SmilePlus,
  Send,
  Smile,
  Frown,
  Meh,
  Activity,
  Layers,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { civicApi } from '../../services/apiService';
import { SentimentPrediction, SentimentType } from '../../types';

const SENTIMENT_PRESETS = [
  {
    type: 'Negative',
    label: 'Frustration / Outage',
    text: 'Substation transformer caught fire and entire sector has been in total pitch darkness for more than 16 hours.'
  },
  {
    type: 'Positive',
    label: 'Resolution Gratitude',
    text: 'Sincere gratitude to the road maintenance team for quickly resurfacing the damaged asphalt road near the school.'
  },
  {
    type: 'Neutral',
    label: 'Informational Inquiry',
    text: 'Can the education department clarify the eligibility guidelines and documents required for scholarship reimbursement?'
  }
];

export const SentimentAnalysisPage: React.FC = () => {
  const { records, selectedModel, metrics, setActiveTab } = useCivic();
  const [inputText, setInputText] = useState(SENTIMENT_PRESETS[0].text);
  const [prediction, setPrediction] = useState<SentimentPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await civicApi.analyzeSentiment(inputText, selectedModel, records);
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sentMetrics = metrics?.sentiment_analysis;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Sentiment & Polarity Analysis</h2>
          <p className="text-xs text-slate-500 mt-1">
            Separately trained TF-IDF + Logistic Regression model classifying complaints into Positive, Negative, or Neutral sentiment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Model:</span>
            <span className="font-semibold text-slate-900 font-mono">TF-IDF + Logistic Regression</span>
          </div>

          <button
            onClick={() => setActiveTab('model-evaluation')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Held-Out Confusion Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Presets */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Citizen Feedback / Complaint Text
            </label>
            <span className="text-xs text-slate-400 font-mono">{inputText.length} chars</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type or paste citizen feedback..."
            className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-400"
          />

          <div>
            <span className="text-xs text-slate-500 block mb-2 font-medium">Sample Sentiment Presets:</span>
            <div className="flex flex-wrap gap-2">
              {SENTIMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setInputText(p.text)}
                  className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <span className={
                    p.type === 'Positive' ? 'text-emerald-600' :
                    p.type === 'Negative' ? 'text-rose-600' : 'text-sky-600'
                  }>●</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Evaluating Sentiment...' : 'Analyze Sentiment Polarity'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Output Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sentiment Output
              </span>
              <span className="text-xs text-slate-500 font-mono">3-Class Classifier</span>
            </div>

            {prediction ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Result Callout */}
                <div className={`p-4 rounded-lg border ${
                  prediction.sentiment === 'Positive'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : prediction.sentiment === 'Negative'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-sky-50/70 border-sky-200 text-sky-950'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {prediction.sentiment === 'Positive' && <Smile className="w-5 h-5 text-emerald-600" />}
                    {prediction.sentiment === 'Negative' && <Frown className="w-5 h-5 text-rose-600" />}
                    {prediction.sentiment === 'Neutral' && <Meh className="w-5 h-5 text-sky-600" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {prediction.sentiment} Sentiment
                    </span>
                  </div>
                  <div className="text-xs opacity-80 mt-1 leading-relaxed">
                    {prediction.sentiment === 'Positive' && 'Citizen affirms completed work or expresses gratitude.'}
                    {prediction.sentiment === 'Negative' && 'Citizen complains of failure, safety hazard, or prolonged delay.'}
                    {prediction.sentiment === 'Neutral' && 'Citizen submits query, scheme inquiry, or general question.'}
                  </div>
                  <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-black/10">
                    <span>Classification Confidence</span>
                    <span className="font-mono font-bold tabular-nums">
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Polarity Tokens */}
                <div>
                  <span className="text-xs text-slate-500 font-medium block mb-1.5">
                    Informative Polarity Tokens:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.tokens.map((tok, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-mono text-slate-700 bg-slate-100 rounded-md border border-slate-200"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-slate-500 font-medium block">
                    Posterior Probability Split:
                  </span>
                  {(['Positive', 'Negative', 'Neutral'] as SentimentType[]).map((sent) => {
                    const prob = prediction.probabilities?.[sent] || 0;
                    const isTop = sent === prediction.sentiment;
                    return (
                      <div key={sent} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className={isTop ? 'font-bold text-slate-900' : 'text-slate-600'}>
                            {sent}
                          </span>
                          <span className="font-mono tabular-nums text-slate-500">
                            {Math.round(prob * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              sent === 'Positive'
                                ? 'bg-emerald-600'
                                : sent === 'Negative'
                                ? 'bg-rose-600'
                                : 'bg-sky-600'
                            }`}
                            style={{ width: `${Math.max(4, Math.round(prob * 100))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <SmilePlus className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <p className="text-xs max-w-xs text-slate-500">
                  Select a preset or enter text and click <strong>Analyze Sentiment Polarity</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Held-Out Evaluation Metrics Preview */}
      {sentMetrics && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Held-Out Evaluation Benchmark (Sentiment Model)
              </h3>
              <p className="text-xs text-slate-500">
                Evaluated on {sentMetrics.test_samples} held-out citizen test records (25% stratified test split)
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Model: {selectedModel === 'logistic_regression' ? 'Logistic Regression' : 'Multinomial Naive Bayes'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">Test Accuracy</span>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {(sentMetrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">Weighted Precision</span>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {(sentMetrics.precision_weighted * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">Weighted Recall</span>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {(sentMetrics.recall_weighted * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500">Weighted F1-Score</span>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {(sentMetrics.f1_weighted * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
