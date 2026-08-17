import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Receipt,
  CheckCircle2,
  XCircle,
  QrCode,
  Webhook,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface OverviewData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  plan: {
    code: string;
    name: string;
    priceMonthly: number;
    monthlyTransactionLimit: number | null;
    paymentAccountLimit: number;
    isUnlimited: boolean;
  };
  usage: {
    usedThisMonth: number;
    limit: number | null;
    isUnlimited: boolean;
    percentage: number;
    periodStart: string;
    periodEnd: string;
  };
  transactions: {
    total: number;
    paid: number;
    pending: number;
    expired: number;
  };
  paymentAccounts: {
    connectedCount: number;
    limit: number;
    isLimitReached: boolean;
    accounts: Array<{
      id: string;
      name: string;
      outletName: string;
      merchantName: string | null;
      status: string;
      lastSyncedAt: string | null;
    }>;
  };
  webhook: {
    isConfigured: boolean;
    isEnabled: boolean;
    url: string | null;
  };
  recentTransactions: Array<{
    id: string;
    reference: string;
    externalRefNo: string;
    amount: number;
    feeAmount: number;
    uniqueCode: number;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | string;
    paymentAccountName: string;
    createdAt: string;
    paidAt: string | null;
    expiredAt: string;
  }>;
}

export const OverviewPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await apiClient<OverviewData>('/api/dashboard/overview');
      return res.data!;
    },
    staleTime: 1000 * 15, // 15s
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-card border border-border" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-card border border-border" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 text-destructive p-6 text-center">
        <XCircle className="w-10 h-10 mx-auto mb-2 text-destructive" />
        <CardTitle className="text-lg font-bold">Gagal Memuat Ringkasan Dashboard</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          {error?.message || 'Terjadi kesalahan saat mengambil data dari server.'}
        </CardDescription>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </Button>
      </Card>
    );
  }

  const { plan, usage, transactions, paymentAccounts, webhook, recentTransactions } = data;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="paid" className="text-[11px] font-semibold">PAID</Badge>;
      case 'PENDING':
        return <Badge variant="pending" className="text-[11px] font-semibold">PENDING</Badge>;
      case 'EXPIRED':
        return <Badge variant="expired" className="text-[11px] font-semibold">EXPIRED</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-xl p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Selamat Datang, {data.user.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Berikut ringkasan performa gateway dan aktivitas pembayaran toko Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
          <Button asChild size="sm" className="text-xs gap-1.5 h-9 font-semibold">
            <Link to="/dashboard/payment-accounts">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Akun GoBiz</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plan & Usage */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan & Usage</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">{plan.code}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {usage.isUnlimited ? 'Unlimited' : `${usage.usedThisMonth} / ${usage.limit} trx`}
              </span>
            </div>
            {!usage.isUnlimited && (
              <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    usage.percentage >= 90 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, usage.percentage)}%` }}
                />
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {usage.isUnlimited ? 'Transaksi tanpa kuota bulanan' : `${usage.percentage}% kuota transaksi terpakai bulan ini`}
            </p>
          </CardContent>
        </Card>

        {/* Paid Transactions */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaksi Lunas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {transactions.paid}
              </span>
              <span className="text-xs text-muted-foreground">dari {transactions.total} total</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              QRIS berhasil dicocokkan otomatis
            </p>
          </CardContent>
        </Card>

        {/* Payment Accounts */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Account</span>
            <QrCode className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">
                {paymentAccounts.connectedCount} / {paymentAccounts.limit}
              </span>
              <Badge variant={paymentAccounts.connectedCount > 0 ? 'paid' : 'outline'} className="text-[10px]">
                {paymentAccounts.connectedCount > 0 ? 'Connected' : 'Empty'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Akun GoBiz terhubung & siap settlement
            </p>
          </CardContent>
        </Card>

        {/* Webhook Status */}
        <Card className="bg-card border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Webhook URL</span>
            <Webhook className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold truncate max-w-[140px] text-foreground">
                {webhook.isConfigured ? (webhook.isEnabled ? 'Aktif' : 'Nonaktif') : 'Belum Setup'}
              </span>
              <Badge variant={webhook.isConfigured && webhook.isEnabled ? 'paid' : 'pending'} className="text-[10px]">
                {webhook.isConfigured && webhook.isEnabled ? 'Active' : 'Standby'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 truncate">
              {webhook.url || 'Notifikasi otomatis ke server Anda'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-5 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Transaksi Terbaru</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              5 transaksi terakhir yang dibuat melalui NeetPay API
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1 font-semibold">
            <Link to="/dashboard/transactions">
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Receipt className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">Belum ada transaksi</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Buat transaksi pertama Anda via API <code>POST /v1/transactions</code> menggunakan API Key Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Unique Code</TableHead>
                    <TableHead className="text-xs">Total Amount</TableHead>
                    <TableHead className="text-xs">Outlet</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((trx) => (
                    <TableRow key={trx.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        <Link to={`/dashboard/transactions/${trx.id}`} className="hover:text-primary hover:underline">
                          {trx.reference}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        Rp {trx.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        +{trx.uniqueCode}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        Rp {trx.totalAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {trx.paymentAccountName}
                      </TableCell>
                      <TableCell>{renderStatusBadge(trx.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right font-mono">
                        {new Date(trx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
