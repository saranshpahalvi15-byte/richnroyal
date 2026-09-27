import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerMenuView } from './views/CustomerMenuView';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminOrdersView } from './views/AdminOrdersView';
import { AdminProductsView } from './views/AdminProductsView';
import { AdminCategoriesView } from './views/AdminCategoriesView';
import { AdminTablesView } from './views/AdminTablesView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AdminLoginView } from './views/AdminLoginView';
import { LandingView } from './views/LandingView';
import { PushNotificationToast } from './components/common/PushNotificationToast';

function AppContent() {
  const { user, isAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const searchParams = new URLSearchParams(window.location.search);
  const isMenuRoute = currentPath.startsWith('/menu') || searchParams.has('table');
  const isAdminRoute = currentPath.startsWith('/admin');

  // Customer QR Menu Route (No login required)
  if (isMenuRoute) {
    return <CustomerMenuView />;
  }

  // Admin Route
  if (isAdminRoute) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#FFF8ED] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-[#5A1724] font-royal uppercase tracking-wider">
            Authenticating Admin Access...
          </p>
        </div>
      );
    }

    if (!user || !isAdmin) {
      return (
        <AdminLoginView
          onLoginSuccess={() => {
            navigate('/admin');
          }}
        />
      );
    }

    return (
      <AdminLayout currentTab={adminTab} setCurrentTab={setAdminTab}>
        {adminTab === 'dashboard' && <AdminDashboardView />}
        {adminTab === 'orders' && <AdminOrdersView />}
        {adminTab === 'products' && <AdminProductsView />}
        {adminTab === 'categories' && <AdminCategoriesView />}
        {adminTab === 'tables' && <AdminTablesView />}
        {adminTab === 'settings' && <AdminSettingsView />}
      </AdminLayout>
    );
  }

  // Default Landing Screen
  return (
    <LandingView
      onNavigateAdmin={() => navigate('/admin')}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PushNotificationToast />
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
