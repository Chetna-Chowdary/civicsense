import React, { useState } from 'react';
import {
  Tag,
  Send,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { civicApi } from '../../services/apiService';
import { ClassificationPrediction, ServiceCategory } from '../../types';
import { ALL_CATEGORIES } from '../../services/mlEngine';
import { CIVIC_THEME, SENTIMENT_THEME, DOMAIN_THEME } from '../../constants/theme';

const SAMPLE_PRESETS = [
  {
    label: 'Road Hazard',
    text: 'Deep crater potholes on Bowrampet junction are causing multiple two-wheeler accidents in the dark.'
  },
  {
    label: 'Water Contamination',
    text: 'Murky contaminated drinking water flowing through residential pipeline taps with strong foul odor since morning.'
  },
  {
    label: 'Power Grid Failure',
    text: 'High-voltage electric transformer exploded near our colony; entire block without electricity for 14 hours.'
  },
  {
    label: 'Healthcare Crisis',
    text: 'Community government hospital running acute shortage of basic antibiotics, syringes, and antivenom vials.'
  },
  {
    label: 'School Infrastructure',
    text: 'Classroom ceiling plaster collapsed and rainwater is leaking over student benches in government school.'
  },
  {
    label: 'Transit Irregularity',
    text: 'City bus service route 219 is chronically delayed by an hour and bus driver skips regular village stops.'
  },
  {
    label: 'Sanitation & Waste',
    text: 'Illegal garbage accumulation and open dumping on vacant plot attracting stray animals and severe fly menace.'
  },
  {
    label: 'Drainage / Sewage Overflow',
    text: 'Underground sewer pipeline has burst; blocked drains are spewing foul black sewage and waterlogging the residential street.'
  }
];

export const ComplaintAnalysisPage: React.FC = () => {
  const { records, backendMode } = useCivic();
  const [inputText, setInputText] = useState(SAMPLE_PRESETS[0].text);
  const [prediction, setPrediction] = useState<ClassificationPrediction | null>(null);
  const [sentimentPred, setSentimentPred] = useState<{ sentiment: string; confidence: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleClassify = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const [resCat, resSent] = await Promise.all([
        civicApi.classifyComplaint(inputText, 'logistic_regression', records),
        civicApi.analyzeSentiment(inputText, 'logistic_regression', records)
      ]);
      setPrediction(resCat);
      setSentimentPred({ sentiment: resSent.sentiment, confidence: resSent.confidence });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-[#FBF7EF] text-[#182820]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#182820] tracking-tight font-serif">
            Public Grievance Category Classification (8 Domains)
          </h2>
          <p className="text-xs text-[#687568] mt-1">
            Automated routing of citizen complaints into 8 municipal domains using Scikit-Learn TF-IDF & Logistic Regression.
          </p>
        </div>

        {/* Model Architecture Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFDF8] rounded-full border border-[#E7E0D3] text-xs shadow-2xs">
          <span className="text-[#687568] font-medium">Model:</span>
          <span className="font-bold text-[#073D32] font-mono">TF-IDF + Logistic Regression</span>
        </div>
      </div>

      {/* Interactive Classifier Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Box & Presets */}
        <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#182820] uppercase tracking-wider">
              Citizen Complaint Text Input
            </label>
            <span className="text-xs text-[#687568] font-mono">
              {inputText.length} chars
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type or paste any citizen complaint description..."
            className="w-full p-4 text-sm bg-[#FBF7EF] border border-[#E7E0D3] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15966A]/30 focus:border-[#15966A] transition-all text-[#182820] placeholder:text-[#687568]/60"
          />

          {/* Quick Demonstration Presets (8 Presets) */}
          <div>
            <span className="text-xs text-[#687568] block mb-2 font-bold">
              Demonstration Presets (All 8 Domains):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputText(preset.text)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    preset.label.includes('Drainage')
                      ? 'bg-[#FFF1C9] text-[#E85A24] border border-[#FDE68A] hover:bg-[#ffe8a8] font-bold'
                      : 'text-[#182820] bg-[#F5EFE6] hover:bg-[#EAE2D5] border border-[#E7E0D3]/60'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleClassify}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#073D32] hover:bg-[#0c4e40] rounded-full shadow-xs hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-[#15966A]" />
              <span>{isAnalyzing ? 'Classifying Text...' : 'Run Category Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Results Card */}
        <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
              <span className="text-xs font-bold text-[#182820] uppercase tracking-wider">
                Predicted Public Service Domain
              </span>
              <span className="text-xs font-mono text-[#073D32] font-bold">
                {backendMode === 'local_fastapi' ? 'FastAPI Local Engine' : 'TF-IDF + Logistic Regression'}
              </span>
            </div>

            {prediction ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Result Hero */}
                <div className="p-4 bg-[#DFF2E6]/60 border border-[#A3E0C0] rounded-xl space-y-3">
                  <div>
                    <span className="text-xs text-[#073D32] font-semibold">Predicted Public Service Domain</span>
                    <div className="text-2xl font-extrabold text-[#073D32] tracking-tight mt-0.5 font-serif">
                      {prediction.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#A3E0C0]/60 text-xs">
                    <div>
                      <span className="text-[#687568] block">Category Confidence:</span>
                      <span className="font-mono tabular-nums font-bold text-[#073D32] text-sm">
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                    {sentimentPred && (
                      <div>
                        <span className="text-[#687568] block">Detected Sentiment:</span>
                        <span className={`font-mono tabular-nums font-bold text-sm ${
                          sentimentPred.sentiment === 'Positive' ? 'text-[#15966A]' :
                          sentimentPred.sentiment === 'Negative' ? 'text-[#F16B5B]' : 'text-[#F2B544]'
                        }`}>
                          {sentimentPred.sentiment} ({Math.round(sentimentPred.confidence * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Salient Feature Keywords */}
                <div>
                  <span className="text-xs text-[#687568] font-bold block mb-1.5">
                    Informative Terms (TF-IDF Features):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.key_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-mono text-[#182820] bg-[#F5EFE6] rounded-lg border border-[#E7E0D3]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Probability Distribution for all 8 categories */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-[#687568] font-bold block">
                    Posterior Class Probabilities (8 Domains):
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {ALL_CATEGORIES.map((cat) => {
                      const prob = prediction.probabilities?.[cat] || 0;
                      const isTop = cat === prediction.category;
                      const dTheme = DOMAIN_THEME[cat] || DOMAIN_THEME['Other Public Services'];
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={isTop ? 'font-bold text-[#073D32]' : 'text-[#687568]'}>
                              {cat}
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
                                backgroundColor: isTop ? dTheme.color : '#D5CEBF'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#687568] space-y-2">
                <Tag className="w-10 h-10 text-[#A8B99A] stroke-[1.5]" />
                <p className="text-xs max-w-xs text-[#687568]">
                  Select a preset or enter complaint text and click <strong>Run Category Prediction</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monitored Public Service Domains (All 8 Domains) */}
      <div className="bg-[#FFFDF8] border border-[#E7E0D3] rounded-2xl shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#182820] uppercase tracking-wider">
          Monitored Public Service Domains (8 Target Categories)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            { name: 'Roads', desc: 'Potholes, asphalt damage, road caving, speed breakers, footpaths, signals.', theme: DOMAIN_THEME['Roads'] },
            { name: 'Water Supply', desc: 'Drinking tap water supply, low water pressure, municipal water tankers, RO plants.', theme: DOMAIN_THEME['Water Supply'] },
            { name: 'Electricity', desc: 'Transformer burnouts, power outages, low voltage, broken streetlights, wire snapping.', theme: DOMAIN_THEME['Electricity'] },
            { name: 'Healthcare', desc: 'Hospital drug shortage, doctor absence, emergency ambulance delays, diagnostic tools.', theme: DOMAIN_THEME['Healthcare'] },
            { name: 'Education', desc: 'School building roof leaks, mid-day meals, lab equipment, teacher absenteeism.', theme: DOMAIN_THEME['Education'] },
            { name: 'Transportation', desc: 'Bus route delays, fare overcharging, bus shelters, zebra crossings, timetable queries.', theme: DOMAIN_THEME['Transportation'] },
            { name: 'Drainage / Sewage', desc: 'Blocked drains, sewage overflow, leaking sewer lines, storm drain waterlogging, foul odors.', theme: DOMAIN_THEME['Drainage / Sewage'], isDistinct: true },
            { name: 'Other Public Services', desc: 'Solid waste collection, animal control, birth certificates, property tax, fire safety.', theme: DOMAIN_THEME['Other Public Services'] }
          ].map((cat, i) => (
            <div
              key={cat.name}
              className="p-4 rounded-xl border space-y-1.5 transition-all"
              style={{ backgroundColor: cat.theme.bg, borderColor: cat.theme.border }}
            >
              <div className="font-bold flex items-center justify-between" style={{ color: cat.theme.text }}>
                <span>{i + 1}. {cat.name}</span>
                {cat.isDistinct && (
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/80">
                    Distinct
                  </span>
                )}
              </div>
              <div className="text-[11px] leading-relaxed opacity-90" style={{ color: cat.theme.text }}>
                {cat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
