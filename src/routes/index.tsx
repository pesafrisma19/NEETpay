import React from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Documentation Page (OpenAPI + Scalar)
import { ApiDocsPage } from '@/pages/docs/ApiDocsPage';

// Public Hosted Checkout Page
import { PublicPayPage } from '@/pages/checkout/PublicPayPage';

// User Dashboard Pages
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { TransactionDetailPage } from '@/pages/transactions/TransactionDetailPage';
import { PaymentAccountsPage } from '@/pages/payment-accounts/PaymentAccountsPage';
import { PaymentAccountDetailPage } from '@/pages/payment-accounts/PaymentAccountDetailPage';
import { ApiKeyPage } from '@/pages/api-key/ApiKeyPage';
import { WebhookPage } from '@/pages/webhook/WebhookPage';
import { PlanUsagePage } from '@/pages/plan/PlanUsagePage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

// Admin Dashboard Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import { AdminTransactionsPage } from '@/pages/admin/AdminTransactionsPage';
import { AdminTransactionDetailPage } from '@/pages/admin/AdminTransactionDetailPage';
import { AdminPaymentAccountsPage } from '@/pages/admin/AdminPaymentAccountsPage';
import { AdminPaymentAccountDetailPage } from '@/pages/admin/AdminPaymentAccountDetailPage';
import { AdminWebhookFailuresPage } from '@/pages/admin/AdminWebhookFailuresPage';
import { AdminHealthPage } from '@/pages/admin/AdminHealthPage';

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
 * Route guard requiring ADMIN role
 */
const RequireAdmin: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-card border rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Akses Ditolak (403)</h2>
          <p className="text-sm text-muted-foreground">
            Halaman ini hanya dapat diakses oleh Administrator resmi platform NeetPay. Akun Anda tidak memiliki hak akses.
          </p>
          <Button asChild className="w-full">
            <Link to="/dashboard">Kembali ke User Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

/**
 * Route guard for guest only pages (e.g. Login, Register)
 */
const RequireGuest: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Documentation Route */}
      <Route path="/docs" element={<ApiDocsPage />} />

      {/* Public Hosted Checkout Route */}
      <Route path="/pay/:reference" element={<PublicPayPage />} />

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

      {/* Protected Admin Dashboard Routes */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="transactions/:id" element={<AdminTransactionDetailPage />} />
          <Route path="payment-accounts" element={<AdminPaymentAccountsPage />} />
          <Route path="payment-accounts/:id" element={<AdminPaymentAccountDetailPage />} />
          <Route path="webhooks" element={<AdminWebhookFailuresPage />} />
          <Route path="health" element={<AdminHealthPage />} />
        </Route>
      </Route>

      {/* Root & Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
