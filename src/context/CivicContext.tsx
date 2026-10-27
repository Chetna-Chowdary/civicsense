import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  GrievanceRecord,
  DatasetQuality,
  TrendsData,
  InsightsData,
  ModelMetrics,
  BackendMode,
} from '../types';
import { INITIAL_DEMO_GRIEVANCES } from '../data/demoGrievances';
import {
  inspectDataset,
  cleanRecords,
  calculateTrends,
  generateInsights,
  parseCSV
} from '../services/mlEngine';
import { civicApi, PingResult } from '../services/apiService';

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'data-management'
  | 'complaint-analysis'
  | 'sentiment-analysis'
  | 'trend-analysis'
  | 'complaint-explorer'
  | 'model-evaluation'
  | 'insights';

export interface ExplorerFilterState {
  category: string;
  sentiment: string;
  status: string;
  search: string;
}

interface CivicContextType {
  records: GrievanceRecord[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedModel: 'logistic_regression' | 'naive_bayes';
  setSelectedModel: (m: 'logistic_regression' | 'naive_bayes') => void;
  backendMode: BackendMode;
  setBackendMode: (m: BackendMode) => void;
  datasetQuality: DatasetQuality;
  trends: TrendsData;
  insights: InsightsData;
  metrics: { category_classification: ModelMetrics; sentiment_analysis: ModelMetrics } | null;
  isLoading: boolean;
  notification: { text: string; type: 'success' | 'info' | 'error' } | null;
  dismissNotification: () => void;
  uploadCSVContent: (csvText: string, filename: string) => void;
  cleanActiveDataset: () => void;
  resetToDemoDataset: () => void;
  fastApiPing: PingResult | null;
  pingFastApiBackend: () => Promise<PingResult>;
  isBackendModalOpen: boolean;
  setIsBackendModalOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  explorerFilter: ExplorerFilterState;
  setExplorerFilter: React.Dispatch<React.SetStateAction<ExplorerFilterState>>;
  navigateToExplorer: (filter?: Partial<ExplorerFilterState>) => void;
}

const DEFAULT_EXPLORER_FILTER: ExplorerFilterState = {
  category: 'All',
  sentiment: 'All',
  status: 'All',
  search: ''
};

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<GrievanceRecord[]>(INITIAL_DEMO_GRIEVANCES);
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedModel, setSelectedModel] = useState<'logistic_regression' | 'naive_bayes'>('logistic_regression');
  const [backendMode, setBackendModeState] = useState<BackendMode>('embedded');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [fastApiPing, setFastApiPing] = useState<PingResult | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [explorerFilter, setExplorerFilter] = useState<ExplorerFilterState>(DEFAULT_EXPLORER_FILTER);

  // Derived state calculated accurately from current records
  const [datasetQuality, setDatasetQuality] = useState<DatasetQuality>(() => inspectDataset(INITIAL_DEMO_GRIEVANCES));
  const [trends, setTrends] = useState<TrendsData>(() => calculateTrends(INITIAL_DEMO_GRIEVANCES));
  const [insights, setInsights] = useState<InsightsData>(() => generateInsights(INITIAL_DEMO_GRIEVANCES));
  const [metrics, setMetrics] = useState<{ category_classification: ModelMetrics; sentiment_analysis: ModelMetrics } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const dismissNotification = () => setNotification(null);

  const navigateToExplorer = (filter?: Partial<ExplorerFilterState>) => {
    if (filter) {
      setExplorerFilter(prev => ({ ...prev, ...filter }));
    }
    setActiveTab('complaint-explorer');
  };

  const refreshAllState = async (newRecords: GrievanceRecord[], model = selectedModel) => {
    setIsLoading(true);
    try {
      const quality = inspectDataset(newRecords);
      const computedTrends = calculateTrends(newRecords);
      const computedInsights = generateInsights(newRecords);

      setDatasetQuality(quality);
      setTrends(computedTrends);
      setInsights(computedInsights);

      // Train embedded models with new records
      civicApi.trainEmbeddedModels(newRecords);

      // Fetch model metrics
      const newMetrics = await civicApi.getModelEvaluation(model, newRecords);
      setMetrics(newMetrics);
    } catch (err) {
      console.error('Error refreshing state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllState(records, selectedModel);
  }, [selectedModel]);

  const setBackendMode = (mode: BackendMode) => {
    setBackendModeState(mode);
    civicApi.setMode(mode);
    if (mode === 'local_fastapi') {
      showNotification('Switched to Local FastAPI mode (http://127.0.0.1:8000). Ping check running...', 'info');
      pingFastApiBackend();
    } else {
      showNotification('Active Engine: TF-IDF + Logistic Regression (In-Browser Execution).', 'success');
    }
  };

  const pingFastApiBackend = async (): Promise<PingResult> => {
    const res = await civicApi.pingFastApi();
    setFastApiPing(res);
    if (res.connected) {
      showNotification(`FastAPI Backend Connected (${res.latency_ms}ms, ${res.records_loaded} records in backend)`, 'success');
    } else {
      showNotification(`FastAPI Backend Disconnected: ${res.error}`, 'error');
    }
    return res;
  };

  const uploadCSVContent = (csvText: string, filename: string) => {
    try {
      const { records: parsed, errors, warnings } = parseCSV(csvText);
      if (errors.length > 0) {
        showNotification(`CSV validation failed: ${errors.join('; ')}`, 'error');
        return;
      }
      if (parsed.length === 0) {
        showNotification('Failed to parse CSV: no usable grievance rows found.', 'error');
        return;
      }

      setRecords(parsed);
      refreshAllState(parsed, selectedModel);

      let msg = `Successfully imported "${filename}" (${parsed.length} records).`;
      if (warnings.length > 0) {
        msg += ` Note: ${warnings[0]}`;
      }
      showNotification(msg, 'success');
    } catch (err: any) {
      showNotification(`Error parsing CSV: ${err.message}`, 'error');
    }
  };

  const cleanActiveDataset = () => {
    const { cleaned, removedDuplicates, fixedNulls } = cleanRecords(records);
    setRecords(cleaned);
    refreshAllState(cleaned, selectedModel);
    showNotification(`Data cleaning complete: removed ${removedDuplicates} duplicates, sanitized ${fixedNulls} null fields.`, 'success');
  };

  const resetToDemoDataset = () => {
    setRecords(INITIAL_DEMO_GRIEVANCES);
    refreshAllState(INITIAL_DEMO_GRIEVANCES, selectedModel);
    showNotification('Reset to default 100-record demo grievance dataset.', 'info');
  };

  return (
    <CivicContext.Provider
      value={{
        records,
        activeTab,
        setActiveTab,
        selectedModel,
        setSelectedModel,
        backendMode,
        setBackendMode,
        datasetQuality,
        trends,
        insights,
        metrics,
        isLoading,
        notification,
        dismissNotification,
        uploadCSVContent,
        cleanActiveDataset,
        resetToDemoDataset,
        fastApiPing,
        pingFastApiBackend,
        isBackendModalOpen,
        setIsBackendModalOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        explorerFilter,
        setExplorerFilter,
        navigateToExplorer
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
