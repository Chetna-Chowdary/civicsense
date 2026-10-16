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
  Cpu
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { civicApi } from '../../services/apiService';
import { ClassificationPrediction, ServiceCategory } from '../../types';
import { ALL_CATEGORIES } from '../../services/mlEngine';

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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Public Grievance Category Classification (8 Domains)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated routing of citizen complaints into 8 municipal domains using Scikit-Learn TF-IDF & Logistic Regression.
          </p>
        </div>

        {/* Fixed Model Architecture Label */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Model:</span>
          <span className="font-semibold text-slate-900 font-mono">TF-IDF + Logistic Regression</span>
        </div>
      </div>

      {/* Interactive Classifier Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Box & Presets */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Citizen Complaint Text Input
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {inputText.length} chars
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type or paste any citizen complaint description..."
            className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-400"
          />

          {/* Quick Demonstration Presets (8 Presets) */}
          <div>
            <span className="text-xs text-slate-500 block mb-2 font-medium">
              Demonstration Presets (All 8 Domains):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputText(preset.text)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    preset.label.includes('Drainage')
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-semibold'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
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
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Classifying Text...' : 'Run Category Prediction'}</span>
            </button>
          </div>
        </div>

        {/* Prediction Results Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Predicted Public Service Domain
              </span>
              <span className="text-xs font-mono text-teal-700 font-semibold">
                {backendMode === 'local_fastapi' ? 'FastAPI API' : 'TF-IDF + Logistic Regression'}
              </span>
            </div>

            {prediction ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Result Hero */}
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg space-y-3">
                  <div>
                    <span className="text-xs text-teal-700 font-medium">Predicted Public Service Domain</span>
                    <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                      {prediction.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block">Category Confidence:</span>
                      <span className="font-mono tabular-nums font-bold text-teal-800 text-sm">
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                    {sentimentPred && (
                      <div>
                        <span className="text-slate-500 block">Detected Sentiment:</span>
                        <span className={`font-mono tabular-nums font-bold text-sm ${
                          sentimentPred.sentiment === 'Positive' ? 'text-emerald-700' :
                          sentimentPred.sentiment === 'Negative' ? 'text-rose-700' : 'text-sky-700'
                        }`}>
                          {sentimentPred.sentiment} ({Math.round(sentimentPred.confidence * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Salient Feature Keywords */}
                <div>
                  <span className="text-xs text-slate-500 font-medium block mb-1.5">
                    Informative Terms (TF-IDF Features):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prediction.key_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-mono text-slate-700 bg-slate-100 rounded-md border border-slate-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Probability Distribution for all 8 categories */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs text-slate-500 font-medium block">
                    Posterior Class Probabilities (8 Domains):
                  </span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {ALL_CATEGORIES.map((cat) => {
                      const prob = prediction.probabilities?.[cat] || 0;
                      const isTop = cat === prediction.category;
                      return (
                        <div key={cat} className="space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className={isTop ? 'font-bold text-slate-900' : 'text-slate-600'}>
                              {cat}
                            </span>
                            <span className="font-mono tabular-nums text-slate-500">
                              {Math.round(prob * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isTop ? 'bg-teal-600' : 'bg-slate-300'
                              }`}
                              style={{ width: `${Math.max(4, Math.round(prob * 100))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Tag className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <p className="text-xs max-w-xs text-slate-500">
                  Select a preset or enter complaint text and click <strong>Run Category Prediction</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monitored Public Service Domains (All 8 Domains) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Monitored Public Service Domains (8 Target Categories)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">1. Roads</div>
            <div className="text-slate-600 leading-relaxed">
              Potholes, asphalt damage, road caving, speed breakers, footpaths, signals.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">2. Water Supply</div>
            <div className="text-slate-600 leading-relaxed">
              Drinking tap water supply, low water pressure, municipal water tankers, RO plants.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">3. Electricity</div>
            <div className="text-slate-600 leading-relaxed">
              Transformer burnouts, power outages, low voltage, broken streetlights, wire snapping.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">4. Healthcare</div>
            <div className="text-slate-600 leading-relaxed">
              Hospital drug shortage, doctor absence, emergency ambulance delays, diagnostic tools.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">5. Education</div>
            <div className="text-slate-600 leading-relaxed">
              School building roof leaks, mid-day meals, lab equipment, teacher absenteeism.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">6. Transportation</div>
            <div className="text-slate-600 leading-relaxed">
              Bus route delays, fare overcharging, bus shelters, zebra crossings, timetable queries.
            </div>
          </div>
          <div className="p-3.5 bg-teal-50/70 rounded-lg border border-teal-200 space-y-1">
            <div className="font-bold text-teal-950 flex items-center justify-between">
              <span>7. Drainage / Sewage</span>
              <span className="text-[10px] text-teal-700 font-mono font-semibold uppercase">Distinct</span>
            </div>
            <div className="text-teal-900/80 leading-relaxed">
              Blocked drains, sewage overflow, leaking sewer lines, storm drain waterlogging, foul odors.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">8. Other Public Services</div>
            <div className="text-slate-600 leading-relaxed">
              Solid waste collection, animal control, birth certificates, property tax, fire safety.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
