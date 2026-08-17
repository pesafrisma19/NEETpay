import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  Shield,
  QrCode,
  Receipt,
  Webhook,
  KeyRound,
  AlertTriangle,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface UserDetailResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    plan: {
      code: string;
      name: string;
      priceMonthly: number;
      accountLimit: number;
      monthlyLimit: number;
    };
    apiCredential: {
      keyPrefix: string;
      createdAt: string;
      lastUsedAt?: string;
    } | null;
    webhookConfig: {
      url: string;
      isEnabled: boolean;
      createdAt: string;
    } | null;
  };
  paymentAccounts: Array<{
    id: string;
    name: string;
    provider: string;
    status: string;
    isActive: boolean;
    outletName: string;
    merchantName: string;
    authType?: string;
    hasQrString: boolean;
    lastConnectionCheckAt?: string;
    createdAt: string;
  }>;
  transactions: {
    total: number;
    paid: number;
    pending: number;
    expired: number;
    totalVolumePaid: number;
  };
}

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminUserDetail', id],
    queryFn: async () => {
      const res = await apiClient<UserDetailResponse>(`/api/admin/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <h3 className="font-bold text-lg">Pengguna Tidak Ditemukan</h3>
        <p className="text-sm text-muted-foreground">ID pengguna tidak valid atau telah dihapus.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users">Kembali ke Daftar Pengguna</Link>
        </Button>
      </div>
    );
  }

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const { user, paymentAccounts, transactions } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
        <Link to="/admin/users">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengguna</span>
        </Link>
      </Button>

      {/* User Header Profile Card */}
      <Card className="bg-card border-border/80 shadow-2xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-extrabold text-2xl shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                  <Badge variant={user.plan.code === 'PRO' ? 'default' : 'outline'} className="text-xs uppercase font-bold">
                    {user.plan.code}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs'
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Terdaftar:{' '}
                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:pl-6 border-border/60">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">User ID</span>
              <p className="font-mono text-xs text-foreground select-all mt-0.5">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Subscription & Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Info */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Paket Langganan & Kuota</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Plan Aktif:</span>
              <span className="font-bold text-foreground">{user.plan.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Harga Bulanan:</span>
              <span className="font-semibold text-foreground">{formatIDR(user.plan.priceMonthly)} / bulan</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Batas Payment Accounts:</span>
              <span className="font-semibold text-foreground">{user.plan.accountLimit} Akun</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Batas Transaksi:</span>
              <span className="font-semibold text-foreground">
                {user.plan.code === 'PRO' ? 'Unlimited' : `${user.plan.monthlyLimit} per bulan`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Status Integrasi Merchant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">API Key:</span>
              </div>
              <span className="font-mono font-medium text-foreground">
                {user.apiCredential ? `${user.apiCredential.keyPrefix}••••••••` : 'Belum dibuat'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Webhook URL:</span>
              </div>
              <span className="font-mono text-[11px] text-foreground truncate max-w-[200px]">
                {user.webhookConfig?.url || 'Belum diatur'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Webhook Status:</span>
              <Badge variant={user.webhookConfig?.isEnabled ? 'default' : 'outline'} className="text-[10px] uppercase font-bold">
                {user.webhookConfig?.isEnabled ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Metrics Summary */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Ringkasan Transaksi Merchant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
              <p className="text-xs text-muted-foreground">Total Transaksi</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{transactions.total}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-600 font-semibold">Lunas (PAID)</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{transactions.paid}</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-600 font-semibold">PENDING</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{transactions.pending}</p>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-xs text-rose-600 font-semibold">EXPIRED</p>
              <p className="text-xl font-bold text-rose-600 mt-0.5">{transactions.expired}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Volume Sukses (Lunas):</span>
            <span className="font-bold text-foreground text-sm">{formatIDR(transactions.totalVolumePaid)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Connected Payment Accounts List */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <QrCode className="w-4 h-4 text-purple-600" />
            <span>Akun GoBiz Terhubung ({paymentAccounts.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">Daftar payment account GoBiz yang terdaftar untuk merchant ini</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentAccounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Belum ada akun GoBiz yang terhubung untuk merchant ini.
            </div>
          ) : (
            <div className="space-y-3">
              {paymentAccounts.map((pa) => (
                <div
                  key={pa.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{pa.outletName || pa.name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {pa.provider}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          pa.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }
                      >
                        {pa.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Merchant: {pa.merchantName} • Auth: {pa.authType || 'N/A'} • QRIS:{' '}
                      {pa.hasQrString ? 'Tersinkronisasi' : 'Belum Ada'}
                    </p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0">
                    <Link to={`/admin/payment-accounts/${pa.id}`}>
                      <span>Audit Akun</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
