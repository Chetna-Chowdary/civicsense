import {
  GrievanceRecord,
  ServiceCategory,
  SentimentType,
  DatasetQuality,
  ClassificationPrediction,
  SentimentPrediction,
  ModelMetrics,
  TrendsData,
  InsightsData,
  InsightItem,
} from '../types';

export const ALL_CATEGORIES: ServiceCategory[] = [
  'Roads',
  'Water Supply',
  'Electricity',
  'Healthcare',
  'Education',
  'Transportation',
  'Drainage / Sewage',
  'Other Public Services',
];

export const ALL_SENTIMENTS: SentimentType[] = ['Positive', 'Negative', 'Neutral'];

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export function cleanText(text: string, removeStopwords = true): string {
  if (!text) return '';
  let str = text.toLowerCase();
  // Strip URLs and emails
  str = str.replace(/https?:\/\/\S+|www\.\S+/g, '');
  str = str.replace(/\S+@\S+/g, '');
  // Remove punctuation & symbols
  str = str.replace(/[^\w\s]|_/g, ' ');
  // Remove lone digits
  str = str.replace(/\b\d+\b/g, ' ');

  const tokens = str.split(/\s+/).filter(w => w.length > 2);
  if (removeStopwords) {
    return tokens.filter(w => !STOPWORDS.has(w)).join(' ');
  }
  return tokens.join(' ');
}

// Tokenize text into n-grams (1 and 2)
function extractNGrams(cleanedText: string): string[] {
  const words = cleanedText.split(/\s+/).filter(Boolean);
  const ngrams: string[] = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]}_${words[i + 1]}`);
  }
  return ngrams;
}

export class TextClassifierModel {
  private vocab: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private classPriors: Map<string, number> = new Map();
  private featureWeights: Map<string, Map<string, number>> = new Map();
  public classes: string[] = [];
  public metrics: ModelMetrics | null = null;
  public modelType: 'logistic_regression' | 'naive_bayes';

  constructor(modelType: 'logistic_regression' | 'naive_bayes' = 'logistic_regression') {
    this.modelType = modelType;
  }

  public trainAndEvaluate(
    records: GrievanceRecord[],
    targetField: 'category' | 'sentiment',
    testRatio = 0.25,
    seed = 42
  ): ModelMetrics {
    const validRecords = records.filter(r => r.complaint_text && r[targetField]);
    this.classes = Array.from(new Set(validRecords.map(r => r[targetField]))).sort();

    // Pseudo-random stratified split
    const classBuckets = new Map<string, GrievanceRecord[]>();
    this.classes.forEach(c => classBuckets.set(c, []));
    validRecords.forEach(r => classBuckets.get(r[targetField])?.push(r));

    const trainRecords: GrievanceRecord[] = [];
    const testRecords: GrievanceRecord[] = [];

    // Deterministic pseudo-randomness using simple LCG
    let rng = seed;
    const nextRandom = () => {
      rng = (rng * 1664525 + 1013904223) % 4294967296;
      return rng / 4294967296;
    };

    classBuckets.forEach(items => {
      // Shuffle deterministically
      const shuffled = [...items].sort(() => nextRandom() - 0.5);
      const testCount = Math.max(1, Math.round(shuffled.length * testRatio));
      testRecords.push(...shuffled.slice(0, testCount));
      trainRecords.push(...shuffled.slice(testCount));
    });

    // 1. Build Vocabulary and Document Frequencies on Train Set
    const docCount = trainRecords.length;
    const docFreq = new Map<string, number>();

    trainRecords.forEach(r => {
      const tokens = new Set(extractNGrams(cleanText(r.complaint_text)));
      tokens.forEach(tok => {
        docFreq.set(tok, (docFreq.get(tok) || 0) + 1);
      });
    });

    // Filter features: min doc frequency 1, max features 800
    const sortedFeatures = Array.from(docFreq.entries())
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 800);

    this.vocab.clear();
    this.idf.clear();
    sortedFeatures.forEach(([term, df], idx) => {
      this.vocab.set(term, idx);
      // Smooth IDF
      this.idf.set(term, Math.log((docCount + 1) / (df + 1)) + 1);
    });

    // 2. Compute priors and class term distributions
    this.classPriors.clear();
    this.featureWeights.clear();
    this.classes.forEach(c => {
      this.featureWeights.set(c, new Map());
    });

    const classDocCounts = new Map<string, number>();
    const classTotalTermFreq = new Map<string, number>();

    this.classes.forEach(c => {
      classDocCounts.set(c, 0);
      classTotalTermFreq.set(c, 0);
    });

    trainRecords.forEach(r => {
      const cls = r[targetField];
      classDocCounts.set(cls, (classDocCounts.get(cls) || 0) + 1);

      const ngrams = extractNGrams(cleanText(r.complaint_text));
      const weights = this.featureWeights.get(cls)!;

      ngrams.forEach(tok => {
        if (this.vocab.has(tok)) {
          const idfWeight = this.idf.get(tok) || 1;
          weights.set(tok, (weights.get(tok) || 0) + idfWeight);
          classTotalTermFreq.set(cls, (classTotalTermFreq.get(cls) || 0) + idfWeight);
        }
      });
    });

    // Calculate class prior probabilities
    this.classes.forEach(c => {
      const count = classDocCounts.get(c) || 1;
      this.classPriors.set(c, count / docCount);
    });

    // 3. Evaluate on held-out test split
    const yTrue: string[] = [];
    const yPred: string[] = [];

    testRecords.forEach(r => {
      yTrue.push(r[targetField]);
      const pred = this.predictRaw(r.complaint_text);
      yPred.push(pred.bestClass);
    });

    // Compute Confusion Matrix
    const classIdxMap = new Map<string, number>();
    this.classes.forEach((c, idx) => classIdxMap.set(c, idx));

    const cmSize = this.classes.length;
    const cm: number[][] = Array.from({ length: cmSize }, () => Array(cmSize).fill(0));

    for (let i = 0; i < yTrue.length; i++) {
      const trueIdx = classIdxMap.get(yTrue[i]);
      const predIdx = classIdxMap.get(yPred[i]);
      if (trueIdx !== undefined && predIdx !== undefined) {
        cm[trueIdx][predIdx] += 1;
      }
    }

    // Per-class metrics
    let correctTotal = 0;
    const classificationReport: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }> = {};

    let weightedPrecision = 0;
    let weightedRecall = 0;
    let weightedF1 = 0;
    let macroPrecision = 0;
    let macroRecall = 0;
    let macroF1 = 0;

    this.classes.forEach((c, i) => {
      const tp = cm[i][i];
      let fn = 0;
      let fp = 0;
      for (let j = 0; j < cmSize; j++) {
        if (j !== i) {
          fn += cm[i][j];
          fp += cm[j][i];
        }
      }
      const support = tp + fn;
      correctTotal += tp;

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = support > 0 ? tp / support : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      classificationReport[c] = {
        precision: Math.round(precision * 1000) / 1000,
        recall: Math.round(recall * 1000) / 1000,
        'f1-score': Math.round(f1 * 1000) / 1000,
        support
      };

      const weight = support / (yTrue.length || 1);
      weightedPrecision += precision * weight;
      weightedRecall += recall * weight;
      weightedF1 += f1 * weight;

      macroPrecision += precision;
      macroRecall += recall;
      macroF1 += f1;
    });

    const accuracy = yTrue.length > 0 ? correctTotal / yTrue.length : 0;
    macroPrecision /= cmSize;
    macroRecall /= cmSize;
    macroF1 /= cmSize;

    this.metrics = {
      model_type: this.modelType,
      train_samples: trainRecords.length,
      test_samples: testRecords.length,
      total_samples: validRecords.length,
      classes: this.classes,
      accuracy: Math.round(accuracy * 1000) / 1000,
      precision_weighted: Math.round(weightedPrecision * 1000) / 1000,
      recall_weighted: Math.round(weightedRecall * 1000) / 1000,
      f1_weighted: Math.round(weightedF1 * 1000) / 1000,
      precision_macro: Math.round(macroPrecision * 1000) / 1000,
      recall_macro: Math.round(macroRecall * 1000) / 1000,
      f1_macro: Math.round(macroF1 * 1000) / 1000,
      confusion_matrix: cm,
      classification_report: classificationReport
    };

    return this.metrics;
  }

  private predictRaw(rawText: string): { bestClass: string; probabilities: Record<string, number>; topKeywords: string[] } {
    const cleaned = cleanText(rawText);
    const ngrams = extractNGrams(cleaned);
    const matchedTokens: { token: string; weight: number }[] = [];

    // Naive Bayes log probability calculation
    const logPosteriors: Record<string, number> = {};
    const alpha = this.modelType === 'naive_bayes' ? 1.0 : 0.4;

    this.classes.forEach(c => {
      const prior = this.classPriors.get(c) || 1 / this.classes.length;
      logPosteriors[c] = Math.log(prior);
    });

    ngrams.forEach(tok => {
      if (this.vocab.has(tok)) {
        const idfVal = this.idf.get(tok) || 1;
        matchedTokens.push({ token: tok.replace('_', ' '), weight: idfVal });

        this.classes.forEach(c => {
          const weights = this.featureWeights.get(c)!;
          const tokenWeight = weights.get(tok) || 0;
          // Laplace smoothed likelihood
          const p = (tokenWeight + alpha) / ((this.vocab.size * alpha) + 10);
          logPosteriors[c] += Math.log(p);
        });
      }
    });

    // Softmax normalization for calibrated probabilities
    const maxLog = Math.max(...Object.values(logPosteriors));
    const expPosteriors: Record<string, number> = {};
    let sumExp = 0;

    this.classes.forEach(c => {
      const val = Math.exp(logPosteriors[c] - maxLog);
      expPosteriors[c] = val;
      sumExp += val;
    });

    const probabilities: Record<string, number> = {};
    let bestClass = this.classes[0] || '';
    let maxProb = -1;

    this.classes.forEach(c => {
      const prob = sumExp > 0 ? expPosteriors[c] / sumExp : 1 / this.classes.length;
      probabilities[c] = Math.round(prob * 1000) / 1000;
      if (prob > maxProb) {
        maxProb = prob;
        bestClass = c;
      }
    });

    // Sort matching tokens by TF-IDF weight
    const topKeywords = matchedTokens
      .sort((a, b) => b.weight - a.weight)
      .map(t => t.token)
      .slice(0, 6);

    return { bestClass, probabilities, topKeywords };
  }

  public predictCategory(rawText: string): ClassificationPrediction {
    const raw = this.predictRaw(rawText);
    const cleaned = cleanText(rawText);

    // Fallback if no tokens matched
    const bestCategory = (this.classes.includes(raw.bestClass) ? raw.bestClass : 'Other Public Services') as ServiceCategory;
    const conf = raw.probabilities[bestCategory] || 0.45;

    return {
      category: bestCategory,
      confidence: conf,
      probabilities: raw.probabilities as Record<ServiceCategory, number>,
      key_keywords: raw.topKeywords.length > 0 ? raw.topKeywords : cleaned.split(/\s+/).slice(0, 4),
      cleaned_text: cleaned
    };
  }

  public predictSentiment(rawText: string): SentimentPrediction {
    const raw = this.predictRaw(rawText);
    const cleaned = cleanText(rawText);
    const bestSentiment = (this.classes.includes(raw.bestClass) ? raw.bestClass : 'Neutral') as SentimentType;
    const conf = raw.probabilities[bestSentiment] || 0.5;

    return {
      sentiment: bestSentiment,
      confidence: conf,
      probabilities: raw.probabilities as Record<SentimentType, number>,
      tokens: raw.topKeywords.length > 0 ? raw.topKeywords : cleaned.split(/\s+/).slice(0, 6),
      cleaned_text: cleaned
    };
  }
}

// Data Quality and Cleaning
export function inspectDataset(records: GrievanceRecord[]): DatasetQuality {
  const total_rows = records.length;
  const columns = ['id', 'complaint_text', 'category', 'sentiment', 'date', 'ward_or_region', 'department', 'status', 'urgency'];
  const missing_by_column: Record<string, number> = {};
  let total_missing_cells = 0;

  columns.forEach(col => {
    let missing = 0;
    records.forEach(r => {
      const val = (r as any)[col];
      if (val === undefined || val === null || val === '') {
        missing++;
      }
    });
    missing_by_column[col] = missing;
    total_missing_cells += missing;
  });

  // Duplicate detection by complaint_text
  const seenTexts = new Set<string>();
  let duplicate_count = 0;
  records.forEach(r => {
    const key = (r.complaint_text || '').trim().toLowerCase();
    if (key && seenTexts.has(key)) {
      duplicate_count++;
    } else if (key) {
      seenTexts.add(key);
    }
  });

  const column_types: Record<string, string> = {
    id: 'string (alphanumeric)',
    complaint_text: 'string (text)',
    category: 'string (categorical)',
    sentiment: 'string (categorical)',
    date: 'datetime (YYYY-MM-DD)',
    ward_or_region: 'string (region)',
    department: 'string (agency)',
    status: 'string (status)',
    urgency: 'string (priority)'
  };

  return {
    total_rows,
    total_columns: columns.length,
    columns,
    column_types,
    missing_by_column,
    total_missing_cells,
    duplicate_count,
    clean_ready: total_missing_cells === 0 && duplicate_count === 0
  };
}

export function cleanRecords(records: GrievanceRecord[]): { cleaned: GrievanceRecord[]; removedDuplicates: number; fixedNulls: number } {
  const seen = new Set<string>();
  let removedDuplicates = 0;
  let fixedNulls = 0;
  const cleaned: GrievanceRecord[] = [];

  records.forEach((r, idx) => {
    const textKey = (r.complaint_text || '').trim().toLowerCase();
    if (!textKey) {
      fixedNulls++;
      return; // drop empty text
    }
    if (seen.has(textKey)) {
      removedDuplicates++;
      return;
    }
    seen.add(textKey);

    let category = r.category;
    if (!category || !ALL_CATEGORIES.includes(category)) {
      category = 'Other Public Services';
      fixedNulls++;
    }

    let sentiment = r.sentiment;
    if (!sentiment || !ALL_SENTIMENTS.includes(sentiment)) {
      sentiment = 'Neutral';
      fixedNulls++;
    }

    let date = r.date;
    if (!date || isNaN(Date.parse(date))) {
      date = '2026-08-01';
      fixedNulls++;
    }

    cleaned.push({
      ...r,
      id: r.id || `GRV-2026-${String(idx + 1).padStart(3, '0')}`,
      complaint_text: r.complaint_text.trim(),
      category,
      sentiment,
      date,
      ward_or_region: r.ward_or_region || 'Municipal Ward',
      department: r.department || 'Civic Services',
      status: r.status || 'Open',
      urgency: r.urgency || 'Medium'
    });
  });

  return { cleaned, removedDuplicates, fixedNulls };
}

// Compute Trends Data
export function calculateTrends(records: GrievanceRecord[]): TrendsData {
  if (records.length === 0) {
    return {
      total_records: 0,
      date_range: { start: '', end: '' },
      daily_trends: [],
      weekly_trends: [],
      monthly_trends: [],
      category_breakdown: [],
      sentiment_breakdown: [],
      category_sentiment_cross: {} as any,
      frequent_keywords: [],
      frequent_phrases: []
    };
  }

  // Sort by date
  const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const minDate = sorted[0]?.date || '2026-08-01';
  const maxDate = sorted[sorted.length - 1]?.date || '2026-09-30';

  // Daily Counts
  const dailyMap = new Map<string, number>();
  // Weekly Counts
  const weeklyMap = new Map<string, number>();
  // Monthly Counts
  const monthlyMap = new Map<string, number>();
  // Category Counts
  const categoryMap = new Map<ServiceCategory, number>();
  // Sentiment Counts
  const sentimentMap = new Map<SentimentType, number>();
  // Cross Tab
  const crossTab: Record<string, Record<string, number>> = {};

  ALL_CATEGORIES.forEach(c => {
    categoryMap.set(c, 0);
    crossTab[c] = { Positive: 0, Negative: 0, Neutral: 0 };
  });
  ALL_SENTIMENTS.forEach(s => sentimentMap.set(s, 0));

  const wordCounts = new Map<string, number>();
  const phraseCounts = new Map<string, number>();

  sorted.forEach(r => {
    // Date tracking
    const dStr = r.date;
    dailyMap.set(dStr, (dailyMap.get(dStr) || 0) + 1);

    const monthStr = dStr.substring(0, 7);
    monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + 1);

    // Approximate week start
    const dateObj = new Date(dStr);
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateObj.setDate(diff)).toISOString().split('T')[0];
    weeklyMap.set(monday, (weeklyMap.get(monday) || 0) + 1);

    // Categories
    if (r.category) {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
      if (r.sentiment && crossTab[r.category]) {
        crossTab[r.category][r.sentiment] = (crossTab[r.category][r.sentiment] || 0) + 1;
      }
    }

    // Sentiments
    if (r.sentiment) {
      sentimentMap.set(r.sentiment, (sentimentMap.get(r.sentiment) || 0) + 1);
    }

    // Keywords and Phrases
    const words = cleanText(r.complaint_text).split(/\s+/).filter(Boolean);
    words.forEach(w => {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    });
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    }
  });

  const daily_trends = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weekly_trends = Array.from(weeklyMap.entries())
    .map(([week_start, count]) => ({ week_start, count }))
    .sort((a, b) => a.week_start.localeCompare(b.week_start));

  const monthly_trends = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const category_breakdown = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const sentiment_breakdown = Array.from(sentimentMap.entries())
    .map(([sentiment, count]) => ({ sentiment, count }))
    .sort((a, b) => b.count - a.count);

  const frequent_keywords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, count]) => ({ term, count }));

  const frequent_phrases = Array.from(phraseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term, count]) => ({ term, count }));

  return {
    total_records: sorted.length,
    date_range: { start: minDate, end: maxDate },
    daily_trends,
    weekly_trends,
    monthly_trends,
    category_breakdown,
    sentiment_breakdown,
    category_sentiment_cross: crossTab as any,
    frequent_keywords,
    frequent_phrases
  };
}

// Generate Actionable Civic Insights
export function generateInsights(records: GrievanceRecord[]): InsightsData {
  const trends = calculateTrends(records);
  const total = records.length;

  const negCount = records.filter(r => r.sentiment === 'Negative').length;
  const posCount = records.filter(r => r.sentiment === 'Positive').length;
  const negPct = total > 0 ? Math.round((negCount / total) * 1000) / 10 : 0;

  const topCategory = trends.category_breakdown[0]?.category || 'Roads';

  // Sector with highest negative rate
  let highestFrustrationCat: ServiceCategory = 'Roads';
  let highestFrustrationRate = 0;

  trends.category_breakdown.forEach(cb => {
    const cross = trends.category_sentiment_cross[cb.category];
    if (cross && cb.count > 0) {
      const rate = (cross.Negative / cb.count) * 100;
      if (rate > highestFrustrationRate) {
        highestFrustrationRate = rate;
        highestFrustrationCat = cb.category;
      }
    }
  });

  const insights: InsightItem[] = [
    {
      id: 1,
      type: 'alert',
      title: `Critical Category Load: ${topCategory}`,
      detail: `${topCategory} represents the single largest volume of citizen complaints (${trends.category_breakdown[0]?.count || 0} cases, ${total > 0 ? Math.round(((trends.category_breakdown[0]?.count || 0) / total) * 100) : 0}% of all records).`,
      action: `Establish targeted emergency field teams in high-incidence wards to address recurring ${topCategory.toLowerCase()} defects.`
    },
    {
      id: 2,
      type: 'sentiment',
      title: `Citizen Dissatisfaction Level: ${negPct}% Negative`,
      detail: `${negCount} out of ${total} public grievances reflect acute citizen distress, primarily concerning safety hazards, dirty water, and unannounced power interruptions.`,
      action: `Implement automated proactive SMS notifications with estimated resolution times to reduce escalation friction.`
    },
    {
      id: 3,
      type: 'risk',
      title: `Highest Grievance Severity: ${highestFrustrationCat} (${Math.round(highestFrustrationRate)}% Negative)`,
      detail: `Complaints lodged under ${highestFrustrationCat} show the highest concentration of negative sentiment, indicating critical operational strain.`,
      action: `Deploy immediate inter-departmental audit on vendor response SLAs and emergency spares in ${highestFrustrationCat}.`
    },
    {
      id: 4,
      type: 'opportunity',
      title: `Positive Resolution Signals: ${posCount} Appreciations Logged`,
      detail: `Citizens specifically acknowledged and praised municipal teams when repair works (such as asphalt repaving and water leaks) were completed within 48 hours.`,
      action: `Document rapid-resolution practices from top-performing ward engineers as model guidelines across the municipal corporation.`
    }
  ];

  return {
    summary_metrics: {
      total_grievances: total,
      negative_sentiment_pct: negPct,
      top_category: topCategory,
      highest_frustration_category: highestFrustrationCat,
      highest_frustration_rate: Math.round(highestFrustrationRate * 10) / 10
    },
    automated_insights: insights,
    frequent_keywords: trends.frequent_keywords.slice(0, 8),
    frequent_phrases: trends.frequent_phrases.slice(0, 6)
  };
}

// Parse CSV text into GrievanceRecord array
export function parseCSV(csvText: string): GrievanceRecord[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]);
  const textIdx = header.findIndex(h => h.toLowerCase().includes('complaint') || h.toLowerCase().includes('text') || h.toLowerCase().includes('description'));
  const catIdx = header.findIndex(h => h.toLowerCase().includes('category'));
  const sentIdx = header.findIndex(h => h.toLowerCase().includes('sentiment'));
  const dateIdx = header.findIndex(h => h.toLowerCase().includes('date'));
  const idIdx = header.findIndex(h => h.toLowerCase() === 'id' || h.toLowerCase().includes('complaint_id'));
  const wardIdx = header.findIndex(h => h.toLowerCase().includes('ward') || h.toLowerCase().includes('region') || h.toLowerCase().includes('location'));
  const deptIdx = header.findIndex(h => h.toLowerCase().includes('department') || h.toLowerCase().includes('agency'));
  const statusIdx = header.findIndex(h => h.toLowerCase().includes('status'));
  const urgencyIdx = header.findIndex(h => h.toLowerCase().includes('urgency') || h.toLowerCase().includes('priority'));

  const records: GrievanceRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length === 0) continue;

    const rawText = textIdx >= 0 ? cols[textIdx] : cols[1] || '';
    if (!rawText.trim()) continue;

    const rawCatStr = (catIdx >= 0 ? cols[catIdx] : '').trim();
    let category: ServiceCategory = 'Other Public Services';
    if (ALL_CATEGORIES.includes(rawCatStr as ServiceCategory)) {
      category = rawCatStr as ServiceCategory;
    } else if (/drain|sewag|gutter|culvert|manhole/i.test(rawCatStr)) {
      category = 'Drainage / Sewage';
    }

    const rawSent = (sentIdx >= 0 ? cols[sentIdx] : '') as SentimentType;
    const sentiment = ALL_SENTIMENTS.includes(rawSent) ? rawSent : 'Neutral';

    records.push({
      id: idIdx >= 0 && cols[idIdx] ? cols[idIdx] : `GRV-UP-${String(i).padStart(3, '0')}`,
      complaint_text: rawText.trim(),
      category,
      sentiment,
      date: dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx].trim() : '2026-08-01',
      ward_or_region: wardIdx >= 0 && cols[wardIdx] ? cols[wardIdx].trim() : 'General Ward',
      department: deptIdx >= 0 && cols[deptIdx] ? cols[deptIdx].trim() : 'Civic Services',
      status: (statusIdx >= 0 && cols[statusIdx] ? cols[statusIdx].trim() : 'Open') as any,
      urgency: (urgencyIdx >= 0 && cols[urgencyIdx] ? cols[urgencyIdx].trim() : 'Medium') as any
    });
  }

  return records;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      if (inQuotes && text[i + 1] === char) {
        cur += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function exportRecordsToCSV(records: GrievanceRecord[]): string {
  const header = ['id', 'complaint_text', 'category', 'sentiment', 'date', 'ward_or_region', 'department', 'status', 'urgency'];
  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.complaint_text.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.sentiment}"`,
    `"${r.date}"`,
    `"${r.ward_or_region}"`,
    `"${r.department}"`,
    `"${r.status}"`,
    `"${r.urgency}"`
  ].join(','));
  return [header.join(','), ...rows].join('\n');
}
