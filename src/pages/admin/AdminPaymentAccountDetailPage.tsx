import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentAccountDetailResponse {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  customMinAmount: number | null;
  customMaxAmount: number | null;
  lastSyncedAt?: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    plan: string;
  };
  provider: {
    code: string;
    name: string;
  };
  goBiz: {
    id: string;
    authType: string;
    merchantId: string;
    outletId: string;
    merchantName: string;
    outletName: string;
    maskedIdentifier: string;
    hasQrString: boolean;
    qrUpdatedAt?: string;
    lastConnectionCheckAt?: string;
    connectedSince: string;
    tokenLifecycles: Array<{
      id: string;
      tokenType: string;
      tokenFingerprint: string;
      issuedAt: string;
      lastSuccessAt?: string;
      lastAttemptAt?: string;
      failedAt?: string;
      failureCode?: string;
    }>;
  } | null;
}

export const AdminPaymentAccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminPaymentAccountDetail', id],
    queryFn: async () => {
      const res = await apiClient<PaymentAccountDetailResponse>(`/api/admin/payment-accounts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const formatIDR = (val: number | null) =>
    val ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val) : 'Tidak dibatasi';

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
        <h3 className="font-bold text-lg">Payment Account Tidak Ditemukan</h3>
        <p className="text-sm text-muted-foreground">ID akun tidak valid atau telah diputuskan.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/payment-accounts">Kembali ke Daftar Akun</Link>
        </Button>
      </div>
    );
  }

  const { owner, goBiz, provider } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
        <Link to="/admin/payment-accounts">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Payment Accounts</span>
        </Link>
      </Button>

      {/* Header Banner */}
      <Card className="bg-card border-border/80 shadow-2xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-extrabold text-2xl shrink-0">
                <QrCode className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{goBiz?.outletName || data.name}</h1>
                  <Badge variant="outline" className="text-xs uppercase font-bold">
                    {provider.name}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      data.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs'
                    }
                  >
                    {data.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Merchant ID GoBiz: <span className="font-mono text-foreground">{goBiz?.merchantId || 'N/A'}</span> • Identifier:{' '}
                  <span className="font-mono text-foreground">{goBiz?.maskedIdentifier}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pemilik:{' '}
                  <Link to={`/admin/users/${owner.id}`} className="font-semibold text-primary hover:underline">
                    {owner.name} ({owner.email})
                  </Link>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Metode Login</span>
              <p className="font-mono font-bold text-foreground mt-0.5">{goBiz?.authType || 'OTP'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: GoBiz Connection & QRIS Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Details */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Status Koneksi & Outlet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Nama Outlet:</span>
              <span className="font-bold text-foreground">{goBiz?.outletName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Entity Merchant:</span>
              <span className="font-semibold text-foreground">{goBiz?.merchantName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Outlet ID:</span>
              <span className="font-mono text-foreground">{goBiz?.outletId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Terhubung Sejak:</span>
              <span className="text-foreground">
                {goBiz?.connectedSince
                  ? new Date(goBiz.connectedSince).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Cek Koneksi Terakhir:</span>
              <span className="text-foreground">
                {goBiz?.lastConnectionCheckAt
                  ? new Date(goBiz.lastConnectionCheckAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Baru saja'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* QRIS & Limit Configuration */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Status QRIS & Batasan Transaksi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Status Base QRIS:</span>
              {goBiz?.hasQrString ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Tersinkronisasi
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                  Belum Tersedia
                </Badge>
              )}
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Update QRIS Terakhir:</span>
              <span className="text-foreground">
                {goBiz?.qrUpdatedAt
                  ? new Date(goBiz.qrUpdatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Minimal Transaksi:</span>
              <span className="font-semibold text-foreground">{formatIDR(data.customMinAmount)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Maksimal Transaksi:</span>
              <span className="font-semibold text-foreground">{formatIDR(data.customMaxAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safe Session & Token Lifecycles */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Riwayat Token Lifecycle & Sesi Aman</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Metrik operasional sesi GoBiz (hanya sidik jari token yang dimasking, tanpa token rahasia)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!goBiz?.tokenLifecycles || goBiz.tokenLifecycles.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Belum ada riwayat token lifecycle tercatat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Tipe Token</th>
                    <th className="p-2.5 font-mono">Fingerprint</th>
                    <th className="p-2.5">Diterbitkan</th>
                    <th className="p-2.5">Akses Sukses Terakhir</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {goBiz.tokenLifecycles.map((tl) => (
                    <tr key={tl.id}>
                      <td className="p-2.5 font-bold">
                        <Badge variant="outline" className="text-[10px]">
                          {tl.tokenType}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">{tl.tokenFingerprint}</td>
                      <td className="p-2.5 text-muted-foreground">
                        {new Date(tl.issuedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-2.5 text-muted-foreground">
                        {tl.lastSuccessAt
                          ? new Date(tl.lastSuccessAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </td>
                      <td className="p-2.5">
                        {tl.failedAt ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Gagal: {tl.failureCode || 'ERROR'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                            Aktif
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
