import React from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationToast } from './components/common/NotificationToast';
import { BackendModal } from './components/common/BackendModal';

import { DashboardPage } from './components/dashboard/DashboardPage';
import { DataManagementPage } from './components/data-management/DataManagementPage';
import { ComplaintAnalysisPage } from './components/complaint-analysis/ComplaintAnalysisPage';
import { SentimentAnalysisPage } from './components/sentiment-analysis/SentimentAnalysisPage';
import { TrendAnalysisPage } from './components/trend-analysis/TrendAnalysisPage';
import { ComplaintExplorerPage } from './components/complaint-explorer/ComplaintExplorerPage';
import { ModelEvaluationPage } from './components/model-evaluation/ModelEvaluationPage';
import { InsightsPage } from './components/insights/InsightsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useCivic();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'data-management':
        return <DataManagementPage />;
      case 'complaint-analysis':
        return <ComplaintAnalysisPage />;
      case 'sentiment-analysis':
        return <SentimentAnalysisPage />;
      case 'trend-analysis':
        return <TrendAnalysisPage />;
      case 'complaint-explorer':
        return <ComplaintExplorerPage />;
      case 'model-evaluation':
        return <ModelEvaluationPage />;
      case 'insights':
        return <InsightsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Overlays & Alerts */}
      <NotificationToast />
      <BackendModal />
    </div>
  );
};

export default function App() {
  return (
    <CivicProvider>
      <AppContent />
    </CivicProvider>
  );
}
