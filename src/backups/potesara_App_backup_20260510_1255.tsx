import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout/Layout';
import HeatmapView from './views/Analytics/HeatmapView';
import PerformanceResultsView from './views/Analytics/PerformanceResultsView';
import OrderConfirmationView from './views/Analytics/OrderConfirmationView';
import SlotIntegrationView from './views/Management/SlotIntegrationView';
import ExportRulesView from './views/Management/ExportRulesView';
import ImportView from './views/Vendor/ImportView';
import MaterialManagementView from './views/Vendor/MaterialManagementView';
import SlotsOverviewView from './views/Vendor/SlotsOverviewView';
import BulkActionView from './views/Vendor/BulkActionView';
import ChatView from './views/Common/ChatView';
import UpdateRequestView from './views/Common/UpdateRequestView';
import UserManagementView from './views/Common/UserManagementView';
import DashboardView from './views/Common/DashboardView';
import SettingsView from './views/Common/SettingsView';
import OrganizationManagementView from './views/Common/OrganizationManagementView';
import SheetsIntegrationView from './views/Management/SheetsIntegrationView';
import DataSyncView from './views/Management/DataSyncView';
import LoginView from './views/Common/LoginView';
import type { UserRole } from './components/Layout/RoleSwitcher';
import './App.css';



function App() {
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [userOrgId, setUserOrgId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const isSkippedRef = useRef(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // ページロード時に現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsSessionLoading(false);
    });

    // ログイン状態の変化（ログイン・ログアウト）を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setIsSkipped(false);
        isSkippedRef.current = false;
        
        // ユーザープロフィールの取得
        const { data: profile } = await supabase
          .from('public_users')
          .select('role, organization_id')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role as UserRole);
          setUserOrgId(profile.organization_id);
        }
      } else if (!isSkippedRef.current) {
        setIsLoggedIn(false);
        setUserOrgId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsSkipped(false);
    isSkippedRef.current = false;
  };

  const handleSkipLogin = () => {
    isSkippedRef.current = true;
    setIsSkipped(true);
    setIsLoggedIn(true);
    setUserRole('ADMIN');
    setUserOrgId(1); // 開発用デフォルト組織ID
  };

  if (isSessionLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>読み込み中...</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>セッションを確認しています</div>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn && !isSkipped) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} onSkip={handleSkipLogin} />;
  }

  // ここに到達した時点で、isLoggedIn または isSkipped が true
  return (
    <Layout key={isLoggedIn ? 'auth' : 'skip'} userRole={userRole} onRoleChange={setUserRole} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardView userRole={userRole} organizationId={userOrgId} />} />
        <Route path="/analytics" element={<HeatmapView organizationId={userOrgId} />} />
        <Route path="/performance" element={<PerformanceResultsView organizationId={userOrgId} />} />
        <Route path="/order-confirmation" element={<OrderConfirmationView organizationId={userOrgId} />} />
        <Route path="/schedule" element={<SlotIntegrationView organizationId={userOrgId} />} />
        <Route path="/export-rules" element={<ExportRulesView />} />
        <Route path="/update-request" element={<UpdateRequestView userRole={userRole} organizationId={userOrgId} />} />
        <Route path="/slots-overview" element={<SlotsOverviewView organizationId={userOrgId} />} />
        <Route path="/materials" element={<MaterialManagementView organizationId={userOrgId} />} />
        <Route path="/bulk-actions" element={<BulkActionView />} />
        <Route path="/import" element={<ImportView userRole={userRole} organizationId={userOrgId} />} />
        <Route path="/chat" element={<ChatView userRole={userRole} organizationId={userOrgId} />} />
        <Route path="/users" element={<UserManagementView />} />
        <Route path="/organizations" element={<OrganizationManagementView />} />
        <Route path="/sheets-integration" element={<SheetsIntegrationView />} />
        <Route path="/data-sync" element={<DataSyncView />} />
        <Route path="/settings" element={<SettingsView userRole={userRole} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
