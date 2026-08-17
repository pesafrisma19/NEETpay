import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Dashboard Pages
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { TransactionDetailPage } from '@/pages/transactions/TransactionDetailPage';
import { PaymentAccountsPage } from '@/pages/payment-accounts/PaymentAccountsPage';
import { PaymentAccountDetailPage } from '@/pages/payment-accounts/PaymentAccountDetailPage';
import { ApiKeyPage } from '@/pages/api-key/ApiKeyPage';
import { WebhookPage } from '@/pages/webhook/WebhookPage';
import { PlanUsagePage } from '@/pages/plan/PlanUsagePage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

/**
 * Route guard requiring active session authentication
 */
const RequireAuth: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="space-y-4 max-w-sm w-full">
          <Skeleton className="h-8 w-40 mx-auto rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * Route guard for guest only pages (e.g. Login, Register)
 */
const RequireGuest: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="space-y-4 max-w-sm w-full">
          <Skeleton className="h-8 w-40 mx-auto rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected User Dashboard Routes */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="payment-accounts" element={<PaymentAccountsPage />} />
          <Route path="payment-accounts/:id" element={<PaymentAccountDetailPage />} />
          <Route path="api-key" element={<ApiKeyPage />} />
          <Route path="webhook" element={<WebhookPage />} />
          <Route path="plan" element={<PlanUsagePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Root & Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
