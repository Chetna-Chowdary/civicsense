import {
  GrievanceRecord,
  ClassificationPrediction,
  SentimentPrediction,
  ModelMetrics,
  TrendsData,
  InsightsData,
  DatasetQuality,
  BackendMode
} from '../types';
import {
  TextClassifierModel,
  inspectDataset,
  cleanRecords,
  calculateTrends,
  generateInsights,
  parseCSV,
  exportRecordsToCSV
} from './mlEngine';

const FASTAPI_BASE_URL = 'http://127.0.0.1:8000';

export interface PingResult {
  connected: boolean;
  status?: string;
  records_loaded?: number;
  models_ready?: boolean;
  latency_ms?: number;
  error?: string;
}

export class CivicApiService {
  private mode: BackendMode = 'embedded';
  private embeddedCatClassifier: TextClassifierModel;
  private embeddedSentAnalyzer: TextClassifierModel;

  constructor() {
    // Single primary algorithm: Logistic Regression with TF-IDF Vectorizer
    this.embeddedCatClassifier = new TextClassifierModel('logistic_regression');
    this.embeddedSentAnalyzer = new TextClassifierModel('logistic_regression');
  }

  public getMode(): BackendMode {
    return this.mode;
  }

  public setMode(mode: BackendMode) {
    this.mode = mode;
  }

  public trainEmbeddedModels(records: GrievanceRecord[]) {
    this.embeddedCatClassifier.trainAndEvaluate(records, 'category', 0.25, 42);
    this.embeddedSentAnalyzer.trainAndEvaluate(records, 'sentiment', 0.25, 42);
  }

  public async pingFastApi(): Promise<PingResult> {
    const t0 = performance.now();
    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const t1 = performance.now();
      if (!response.ok) {
        return {
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      const data = await response.json();
      return {
        connected: true,
        status: data.status,
        records_loaded: data.records_loaded,
        models_ready: data.models_ready,
        latency_ms: Math.round(t1 - t0)
      };
    } catch (err: any) {
      return {
        connected: false,
        error: err.message || 'Cannot reach http://127.0.0.1:8000. Ensure uvicorn is running.'
      };
    }
  }

  public async classifyComplaint(
    text: string,
    _modelType: string = 'logistic_regression',
    fallbackRecords: GrievanceRecord[] = []
  ): Promise<ClassificationPrediction> {
    if (this.mode === 'local_fastapi') {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/api/classify-complaint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, model_type: 'logistic_regression' })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('FastAPI unavailable, using embedded model:', e);
      }
    }

    const model = this.embeddedCatClassifier;
    if (!model.metrics && fallbackRecords.length > 0) {
      model.trainAndEvaluate(fallbackRecords, 'category');
    }
    return model.predictCategory(text);
  }

  public async analyzeSentiment(
    text: string,
    _modelType: string = 'logistic_regression',
    fallbackRecords: GrievanceRecord[] = []
  ): Promise<SentimentPrediction> {
    if (this.mode === 'local_fastapi') {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/api/analyze-sentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, model_type: 'logistic_regression' })
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('FastAPI unavailable, using embedded model:', e);
      }
    }

    const model = this.embeddedSentAnalyzer;
    if (!model.metrics && fallbackRecords.length > 0) {
      model.trainAndEvaluate(fallbackRecords, 'sentiment');
    }
    return model.predictSentiment(text);
  }

  public async getModelEvaluation(
    _modelType: string = 'logistic_regression',
    records: GrievanceRecord[] = []
  ): Promise<{ category_classification: ModelMetrics; sentiment_analysis: ModelMetrics }> {
    if (this.mode === 'local_fastapi') {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/api/model-evaluation?model_type=logistic_regression`);
        if (response.ok) {
          const data = await response.json();
          if (data.category_classification && data.sentiment_analysis) {
            return data;
          }
        }
      } catch (e) {
        console.warn('FastAPI unavailable, evaluating embedded models:', e);
      }
    }

    const catMetrics = this.embeddedCatClassifier.metrics || this.embeddedCatClassifier.trainAndEvaluate(records, 'category', 0.25, 42);
    const sentMetrics = this.embeddedSentAnalyzer.metrics || this.embeddedSentAnalyzer.trainAndEvaluate(records, 'sentiment', 0.25, 42);

    return {
      category_classification: catMetrics,
      sentiment_analysis: sentMetrics
    };
  }

  public async getTrends(records: GrievanceRecord[]): Promise<TrendsData> {
    if (this.mode === 'local_fastapi') {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/api/trends`);
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('FastAPI unavailable, computing trends client-side:', e);
      }
    }
    return calculateTrends(records);
  }

  public async getInsights(records: GrievanceRecord[]): Promise<InsightsData> {
    if (this.mode === 'local_fastapi') {
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/api/insights`);
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('FastAPI unavailable, computing insights client-side:', e);
      }
    }
    return generateInsights(records);
  }
}

export const civicApi = new CivicApiService();
