import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import QueuePage from './pages/QueuePage';
import RevenueRiskPage from './pages/RevenueRiskPage';
import CustomersPage from './pages/CustomersPage';
import AgentOpsPage from './pages/AgentOpsPage';
import RecoveryAnalyticsPage from './pages/RecoveryAnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import PolicyEnginePage from './pages/PolicyEnginePage';
import AIRecoveryDrawer from './components/AIRecoveryDrawer';
import api from './services/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Load Dashboard Data
  const loadDashboard = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('[App] Failed to load dashboard:', err);
      setError(err.message || 'Unable to connect to RecoverAI backend');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Handle re-seed
  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await api.triggerSeed();
      await loadDashboard(true);
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // When analysis or recovery completes, refresh queue & telemetry
  const handleAnalysisComplete = () => {
    loadDashboard(true);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            dashboardData={dashboardData}
            loading={loading}
            onSelectTransaction={setSelectedTransaction}
            onNavigateQueue={() => setActiveTab('queue')}
            onRefresh={() => loadDashboard(true)}
          />
        );

      case 'queue':
        return <QueuePage onSelectTransaction={setSelectedTransaction} />;

      case 'risk':
        return <RevenueRiskPage onSelectTransaction={setSelectedTransaction} />;

      case 'subscriptions':
        return <CustomersPage title="Subscription Renewal Failure Profiles" categoryFilter="SUBSCRIPTION_FAILURE" onSelectTransaction={setSelectedTransaction} />;

      case 'receivables':
        return <CustomersPage title="Overdue Enterprise Receivables & Invoices" categoryFilter="OVERDUE_RECEIVABLE" onSelectTransaction={setSelectedTransaction} />;

      case 'checkout':
        return <CustomersPage title="Checkout Abandonment Recapture Profiles" categoryFilter="CHECKOUT_ABANDONMENT" onSelectTransaction={setSelectedTransaction} />;

      case 'agent':
        return <AgentOpsPage />;

      case 'analytics':
        return <RecoveryAnalyticsPage />;

      case 'audit':
        return <AuditLogsPage />;

      case 'settings':
        return <PolicyEnginePage />;

      default:
        return (
          <OverviewPage
            dashboardData={dashboardData}
            loading={loading}
            onSelectTransaction={setSelectedTransaction}
            onNavigateQueue={() => setActiveTab('queue')}
            onRefresh={() => loadDashboard(true)}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRefresh={() => loadDashboard(true)}
      onSeed={handleSeed}
      isRefreshing={isRefreshing}
      isSeeding={isSeeding}
    >
      {/* Backend Connection Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-between text-rose-300 text-xs mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Backend Connection Error:</strong> {error}. Ensure backend is active on port 5000.
            </span>
          </div>
          <button
            onClick={() => loadDashboard()}
            className="px-3 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-white font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {renderActiveTabContent()}

      {/* AI Recovery Analysis & Execution Drawer */}
      <AIRecoveryDrawer
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </DashboardLayout>
  );
};

export default App;
