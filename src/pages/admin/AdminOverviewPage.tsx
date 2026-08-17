import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  Users,
  Receipt,
  QrCode,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface OverviewResponse {
  users: {
    total: number;
    free: number;
    pro: number;
  };
  transactions: {
    today: number;
    month: number;
    monthPaid: number;
    monthVolume: number;
    totalPaid: number;
    totalPending: number;
    totalExpired: number;
  };
  paymentAccounts: {
    total: number;
    active: number;
    needsReauth: number;
    qrisUnavailable: number;
  };
  webhooks: {
    successful: number;
    retrying: number;
    failed: number;
  };
  worker: {
    status: string;
    activePendingTransactions: number;
    accountsBeingPolled: number;
  };
}

export const AdminOverviewPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const res = await apiClient<OverviewResponse>('/api/admin/overview');
      return res.data;
    },
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-card border rounded-2xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h3 className="font-bold text-lg">Gagal Memuat Data Overview Admin</h3>
        <p className="text-sm text-muted-foreground">Terjadi kendala saat mengambil ringkasan platform.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Platform Overview</span>
            <Badge variant="destructive" className="text-xs uppercase font-bold px-2 py-0.5">
              Live Monitor
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pemantauan aktivitas pengguna, transaksi, payment accounts, dan kesehatan worker NeetPay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold py-1 px-2.5 gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Worker Operational
          </Badge>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <Card className="bg-card border-border/70 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Total Pengguna
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.users.total}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{data.users.pro} Pro</span>
              <span>•</span>
              <span>{data.users.free} Free</span>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card className="bg-card border-border/70 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Transaksi Bulan Ini
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.transactions.month}</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Volume: <span className="font-semibold text-foreground">{formatIDR(data.transactions.monthVolume)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Payment Accounts Card */}
        <Card className="bg-card border-border/70 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Payment Accounts
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <QrCode className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.paymentAccounts.total}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-emerald-600 font-semibold">{data.paymentAccounts.active} Terhubung</span>
              {data.paymentAccounts.needsReauth > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-amber-600 font-semibold">{data.paymentAccounts.needsReauth} Re-auth</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Deliveries Card */}
        <Card className="bg-card border-border/70 hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Webhook Delivery
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{data.webhooks.successful}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-emerald-600 font-semibold">{data.webhooks.successful} Sukses</span>
              {data.webhooks.failed > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-rose-600 font-semibold">{data.webhooks.failed} Gagal</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Transactions Breakdown & System Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Breakdown */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Status Transaksi Platform</CardTitle>
                <CardDescription className="text-xs">Distribusi status seluruh transaksi yang tercatat</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/admin/transactions">
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground font-medium">PAID</p>
                <p className="text-lg font-black text-emerald-600">{data.transactions.totalPaid}</p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground font-medium">PENDING</p>
                <p className="text-lg font-black text-amber-600">{data.transactions.totalPending}</p>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground font-medium">EXPIRED</p>
                <p className="text-lg font-black text-rose-600">{data.transactions.totalExpired}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Transaksi Hari Ini:</span>
              <span className="font-bold text-foreground">{data.transactions.today} transaksi</span>
            </div>
          </CardContent>
        </Card>

        {/* Worker & Provider Health Pulse */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Worker & Polling Engine</CardTitle>
                <CardDescription className="text-xs">Status deteksi mutasi QRIS GoBiz real-time</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/admin/health">
                  <span>Diagnostik</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Active Polling Accounts</p>
                  <p className="text-[11px] text-muted-foreground">Akun yang memiliki transaksi PENDING</p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-sm">
                {data.worker.accountsBeingPolled} Akun
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Pending Queue</p>
                  <p className="text-[11px] text-muted-foreground">Menunggu deteksi pembayaran masuk</p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold text-sm">
                {data.worker.activePendingTransactions} Transaksi
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/admin/users"
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Kelola Pengguna</p>
              <p className="text-xs text-muted-foreground">Lihat daftar merchant terdaftar</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/transactions"
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Semua Transaksi</p>
              <p className="text-xs text-muted-foreground">Audit log transaksi platform</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/payment-accounts"
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Payment Accounts</p>
              <p className="text-xs text-muted-foreground">Status koneksi GoBiz merchant</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/admin/webhooks"
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Webhook Failure</p>
              <p className="text-xs text-muted-foreground">Investigasi webhook gagal/retry</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
