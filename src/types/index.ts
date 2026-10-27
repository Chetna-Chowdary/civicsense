export type ServiceCategory =
  | 'Roads'
  | 'Water Supply'
  | 'Electricity'
  | 'Healthcare'
  | 'Education'
  | 'Transportation'
  | 'Drainage / Sewage'
  | 'Other Public Services';

export type SentimentType = 'Positive' | 'Negative' | 'Neutral';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type GrievanceStatus = 'Open' | 'In Progress' | 'Resolved';

export interface GrievanceRecord {
  id: string;
  complaint_text: string;
  category: ServiceCategory;
  sentiment: SentimentType;
  date: string;
  ward_or_region: string;
  department: string;
  status: GrievanceStatus;
  urgency: UrgencyLevel;
  priority_score?: number;
}

export interface DatasetQuality {
  total_rows: number;
  total_columns: number;
  columns: string[];
  column_types: Record<string, string>;
  missing_by_column: Record<string, number>;
  total_missing_cells: number;
  duplicate_count: number;
  clean_ready: boolean;
}

export interface ClassificationPrediction {
  category: ServiceCategory;
  confidence: number;
  probabilities: Record<ServiceCategory, number>;
  key_keywords: string[];
  cleaned_text: string;
  needs_review?: boolean;
  review_reason?: string;
}

export interface SentimentPrediction {
  sentiment: SentimentType;
  confidence: number;
  probabilities: Record<SentimentType, number>;
  tokens: string[];
  cleaned_text: string;
  needs_review?: boolean;
  review_reason?: string;
}

export interface ModelMetrics {
  model_type: 'logistic_regression' | 'naive_bayes';
  train_samples: number;
  test_samples: number;
  total_samples: number;
  classes: string[];
  accuracy: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  confusion_matrix: number[][];
  classification_report: Record<string, {
    precision: number;
    recall: number;
    'f1-score': number;
    support: number;
  }>;
  cross_validation?: {
    folds: number;
    scores: number[];
    mean_accuracy: number;
    std_accuracy: number;
  };
  class_error_analysis?: {
    true_category: string;
    predicted_as: string;
    error_count: number;
  }[];
  model_comparison?: Record<string, {
    accuracy: number;
    f1_weighted: number;
  }>;
  leakage_protected?: boolean;
  limitations?: string[];
}

export interface CategorySentimentStacked {
  category: ServiceCategory;
  Positive: number;
  Neutral: number;
  Negative: number;
  total: number;
}

export interface DepartmentMetric {
  department: string;
  count: number;
  negative_count: number;
  positive_count: number;
  negative_rate: number;
}

export interface WardMetric {
  ward: string;
  count: number;
  negative_count: number;
  negative_rate: number;
}

export interface ResolutionAnalytics {
  open_cases: number;
  in_progress_cases: number;
  resolved_cases: number;
  total_cases: number;
  resolution_rate_pct: number;
  backlog_count: number;
  median_resolution_days: number;
}

export interface PriorityQueueItem {
  id: string;
  score: number;
  tier: UrgencyLevel;
  category: ServiceCategory;
  text: string;
}

export interface PriorityScoringData {
  distribution: Record<UrgencyLevel, number>;
  high_priority_queue: PriorityQueueItem[];
}

export interface DuplicateCandidate {
  primary_id: string;
  primary_text: string;
  similar_id: string;
  similar_text: string;
  similarity_score: number;
  category: string;
}

export interface TrendsData {
  total_records: number;
  date_range: { start: string; end: string };
  daily_trends: { date: string; count: number; is_anomaly?: boolean; expected?: number }[];
  weekly_trends: { week_start: string; count: number }[];
  monthly_trends: { month: string; count: number }[];
  category_breakdown: { category: ServiceCategory; count: number }[];
  sentiment_breakdown: { sentiment: SentimentType; count: number }[];
  category_sentiment_cross: Record<ServiceCategory, Record<SentimentType, number>>;
  category_sentiment_stacked?: CategorySentimentStacked[];
  department_breakdown?: DepartmentMetric[];
  ward_breakdown?: WardMetric[];
  resolution_analytics?: ResolutionAnalytics;
  priority_scoring?: PriorityScoringData;
  duplicate_candidates?: DuplicateCandidate[];
  frequent_keywords: { term: string; count: number }[];
  frequent_phrases: { term: string; count: number }[];
}

export interface InsightItem {
  id: number;
  type: 'alert' | 'sentiment' | 'risk' | 'opportunity';
  title: string;
  detail: string;
  action: string;
}

export interface InsightsData {
  summary_metrics: {
    total_grievances: number;
    negative_sentiment_pct: number;
    top_category: ServiceCategory;
    highest_frustration_category: ServiceCategory;
    highest_frustration_rate: number;
  };
  automated_insights: InsightItem[];
  frequent_keywords: { term: string; count: number }[];
  frequent_phrases: { term: string; count: number }[];
}

export type BackendMode = 'embedded' | 'local_fastapi';
