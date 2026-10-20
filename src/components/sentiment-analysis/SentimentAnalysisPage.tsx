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
import { CIVIC_THEME, SENTIMENT_THEME } from '../../constants/theme';

const SENTIMENT_PRESETS = [
  {
    type: 'Negative',
    label: 'Frustration / Outage',
    text: 'Substation transformer caught fire and entire sector has been in total pitch darkness for more than 16 hours.'
  },
  {
    label: 'Resolution Gratitude',
    type: 'Positive',
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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Citizen Sentiment & Polarity Analysis
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Separately trained TF-IDF + Logistic Regression model classifying complaints into Positive (Emerald), Negative (Coral), or Neutral (Golden Yellow) sentiment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDF8] rounded-full border border-[#E7E0D3] text-xs shadow-2xs">
            <span className="text-[#687568] font-medium">Model:</span>
            <span className="font-bold text-[#073D32] font-mono">TF-IDF + Logistic Regression</span>
          </div>

          <button
            onClick={() => setActiveTab('model-evaluation')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#073D32] bg-[#DFF2E6] border border-[#A3E0C0] rounded-full hover:bg-[#cceed9] transition-colors whitespace-nowrap shadow-2xs"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#15966A]" />
            <span>Held-Out Confusion Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Presets */}
        <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#182820] uppercase tracking-wider">
              Citizen Feedback / Complaint Text
            </label>
            <span className="text-xs text-[#687568] font-mono">{inputText.length} chars</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type or paste citizen feedback..."
            className="w-full p-4 text-sm bg-[#FBF7EF] border border-[#E7E0D3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15966A]/30 focus:border-[#15966A] transition-all text-[#182820] placeholder:text-[#687568]/60"
          />

          <div>
            <span className="text-xs text-[#687568] block mb-2 font-bold">Sample Sentiment Presets:</span>
            <div className="flex flex-wrap gap-2">
              {SENTIMENT_PRESETS.map((p) => {
                const sTheme = SENTIMENT_THEME[p.type as 'Positive' | 'Negative' | 'Neutral'];
                return (
                  <button
                    key={p.label}
                    onClick={() => setInputText(p.text)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-2 hover:-translate-y-0.5"
                    style={{ backgroundColor: sTheme.bg, color: sTheme.text, borderColor: sTheme.border }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sTheme.color }} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full shadow-xs hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-[#15966A]" />
              <span>{isAnalyzing ? 'Evaluating Sentiment...' : 'Analyze Sentiment Polarity'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Output Card */}
        <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
              <span className="text-xs font-bold text-[#182820] uppercase tracking-wider">
                Sentiment Output
              </span>
              <span className="text-xs text-[#073D32] font-mono font-bold">3-Class Classifier</span>
            </div>

            {prediction ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Result Callout */}
                {(() => {
                  const sTheme = SENTIMENT_THEME[prediction.sentiment as 'Positive' | 'Negative' | 'Neutral'] || SENTIMENT_THEME.Neutral;
                  return (
                    <div
                      className="p-4 rounded-xl border space-y-1.5"
                      style={{ backgroundColor: sTheme.bg, borderColor: sTheme.border, color: sTheme.text }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {prediction.sentiment === 'Positive' && <Smile className="w-5 h-5 text-[#15966A]" />}
                        {prediction.sentiment === 'Negative' && <Frown className="w-5 h-5 text-[#F16B5B]" />}
                        {prediction.sentiment === 'Neutral' && <Meh className="w-5 h-5 text-[#F2B544]" />}
                        <span className="text-sm font-black uppercase tracking-wider font-serif">
                          {prediction.sentiment} Sentiment
                        </span>
                      </div>
                      <div className="text-xs opacity-90 leading-relaxed">
                        {prediction.sentiment === 'Positive' && 'Citizen affirms completed municipal work or expresses gratitude.'}
                        {prediction.sentiment === 'Negative' && 'Citizen complains of service failure, public safety hazard, or delay.'}
                        {prediction.sentiment === 'Neutral' && 'Citizen submits formal query, scheme inquiry, or clarification.'}
                      </div>
                      <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-black/10 font-bold">
                        <span>Classification Confidence</span>
                        <span className="font-mono tabular-nums text-sm">
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Polarity Tokens */}
                <div>
                  <span className="text-xs text-[#687568] font-bold block mb-1.5">
                    Informative Polarity Tokens:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.tokens.map((tok, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-mono text-[#182820] bg-[#F5EFE6] rounded-lg border border-[#E7E0D3]"
                      >
                        {tok}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-[#687568] font-bold block">
                    Posterior Probability Split:
                  </span>
                  {(['Positive', 'Negative', 'Neutral'] as SentimentType[]).map((sent) => {
                    const prob = prediction.probabilities?.[sent] || 0;
                    const isTop = sent === prediction.sentiment;
                    const sTheme = SENTIMENT_THEME[sent];
                    return (
                      <div key={sent} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={isTop ? 'font-bold' : 'text-[#687568]'} style={{ color: isTop ? sTheme.text : undefined }}>
                            {sent}
                          </span>
                          <span className="font-mono tabular-nums text-[#687568] font-bold">
                            {Math.round(prob * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#F5EFE6] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(4, Math.round(prob * 100))}%`,
                              backgroundColor: sTheme.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#687568] space-y-2">
                <SmilePlus className="w-10 h-10 text-[#A8B99A] stroke-[1.5]" />
                <p className="text-xs max-w-xs text-[#687568]">
                  Select a preset or input text to evaluate sentiment polarity with the trained Logistic Regression model.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Benchmark Card */}
      {sentMetrics && (
        <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider">
              Sentiment Model Evaluation Metrics
            </h3>
            <span className="text-xs font-mono font-bold text-[#073D32]">
              Scikit-Learn Logistic Regression
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#DFF2E6]/60 border border-[#A3E0C0] rounded-xl text-center">
              <div className="text-xs text-[#073D32] font-semibold">Test Accuracy</div>
              <div className="text-2xl font-bold font-mono text-[#073D32] mt-1">
                {Math.round(sentMetrics.accuracy * 100)}%
              </div>
            </div>
            <div className="p-4 bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl text-center">
              <div className="text-xs text-[#687568] font-semibold">Macro Precision</div>
              <div className="text-2xl font-bold font-mono text-[#182820] mt-1">
                {Math.round(sentMetrics.precision_macro * 100)}%
              </div>
            </div>
            <div className="p-4 bg-[#F5EFE6] border border-[#E7E0D3] rounded-xl text-center">
              <div className="text-xs text-[#687568] font-semibold">Macro Recall</div>
              <div className="text-2xl font-bold font-mono text-[#182820] mt-1">
                {Math.round(sentMetrics.recall_macro * 100)}%
              </div>
            </div>
            <div className="p-4 bg-[#FCE7D7]/60 border border-[#FDBA74] rounded-xl text-center">
              <div className="text-xs text-[#7C2D12] font-semibold">Macro F1-Score</div>
              <div className="text-2xl font-bold font-mono text-[#E85A24] mt-1">
                {Math.round(sentMetrics.f1_macro * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
