import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Activity,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface TransactionDetailResponse {
  id: string;
  merchantTradeNo: string;
  externalRefNo: string;
  amount: number;
  feeType: string;
  feeAmount: number;
  uniqueCode: number;
  totalAmount: number;
  status: string;
  customerName?: string;
  customerEmail?: string;
  metadata?: any;
  createdAt: string;
  paidAt?: string;
  expiredAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  paymentAccount: {
    id: string;
    name: string;
    merchantId?: string;
    outletId?: string;
    outletName: string;
    merchantName: string;
  };
  provider: string;
  events: Array<{
    id: string;
    type: string;
    fromStatus?: string;
    toStatus?: string;
    metadata?: any;
    createdAt: string;
  }>;
  webhookDeliveries: Array<{
    id: string;
    event: string;
    status: string;
    attemptsCount: number;
    nextRetryAt?: string;
    createdAt: string;
    attempts: Array<{
      id: string;
      attempt: number;
      httpStatus?: number;
      durationMs?: number;
      error?: string;
      createdAt: string;
    }>;
  }>;
  providerEvent?: {
    id: string;
    eventType: string;
    providerRefId: string;
    isProcessed: boolean;
    processedAt?: string;
    createdAt: string;
  } | null;
}

export const AdminTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminTransactionDetail', id],
    queryFn: async () => {
      const res = await apiClient<TransactionDetailResponse>(`/api/admin/transactions/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 3000 : false),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

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
        <h3 className="font-bold text-lg">Transaksi Tidak Ditemukan</h3>
        <p className="text-sm text-muted-foreground">ID transaksi tidak valid atau tidak tercatat di sistem.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/transactions">Kembali ke Daftar Transaksi</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
        <Link to="/admin/transactions">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Transaksi</span>
        </Link>
      </Button>

      {/* Header Banner */}
      <Card className="bg-card border-border/80 shadow-2xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-foreground">{data.externalRefNo}</span>
                <button
                  onClick={() => copyToClipboard(data.externalRefNo)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <Badge
                  variant="outline"
                  className={
                    data.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs'
                      : data.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs'
                  }
                >
                  {data.status === 'PAID' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {data.status === 'PENDING' && <Clock className="w-3.5 h-3.5 mr-1 animate-pulse" />}
                  {data.status === 'EXPIRED' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                  <span>{data.status}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Order ID Merchant: <span className="font-mono text-foreground font-semibold">{data.merchantTradeNo}</span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider">Total Tagihan</span>
              <p className="text-2xl font-black text-foreground mt-0.5">{formatIDR(data.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Financial Breakdown & Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Breakdown */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Rincian Pembayaran & Nominal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Nominal Dasar (Base):</span>
              <span className="font-medium text-foreground">{formatIDR(data.amount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Customer Fee ({data.feeType}):</span>
              <span className="font-medium text-foreground">{formatIDR(data.feeAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Kode Unik Verifikasi:</span>
              <span className="font-mono font-bold text-primary">+{data.uniqueCode}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm bg-muted/30 p-2.5 rounded-lg">
              <span className="text-foreground">Total Settlement 100%:</span>
              <span className="text-emerald-600">{formatIDR(data.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Merchant & Outlet Details */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Target Outlet & Merchant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Merchant Owner:</span>
              <span className="font-bold text-foreground">
                <Link to={`/admin/users/${data.user.id}`} className="hover:underline text-primary">
                  {data.user.name} ({data.user.email})
                </Link>
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Outlet GoBiz:</span>
              <span className="font-bold text-foreground">{data.paymentAccount.outletName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Merchant ID GoBiz:</span>
              <span className="font-mono text-foreground">{data.paymentAccount.merchantId || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Waktu Kedaluwarsa:</span>
              <span className="text-foreground">
                {new Date(data.expiredAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Riwayat Event Transaksi</span>
          </CardTitle>
          <CardDescription className="text-xs">Audit log status transaksi dari pembuatan hingga rekonsiliasi</CardDescription>
        </CardHeader>
        <CardContent>
          {data.events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Belum ada event tercatat.</p>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {data.events.map((e) => (
                <div key={e.id} className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{e.type}</span>
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(e.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  {e.toStatus && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Status berubah:{' '}
                      <span className="font-semibold text-foreground">
                        {e.fromStatus ? `${e.fromStatus} → ` : ''}
                        {e.toStatus}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Delivery & Provider Event */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Webhook Deliveries */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Pengiriman Webhook ({data.webhookDeliveries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {data.webhookDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Belum ada webhook dipicu untuk transaksi ini.</p>
            ) : (
              <div className="space-y-3">
                {data.webhookDeliveries.map((w) => (
                  <div key={w.id} className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {w.event}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          w.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]'
                        }
                      >
                        {w.status} ({w.attemptsCount}x percobaan)
                      </Badge>
                    </div>
                    {w.attempts[0] && (
                      <p className="text-[11px] text-muted-foreground">
                        HTTP Status: <span className="font-bold text-foreground">{w.attempts[0].httpStatus || 'N/A'}</span> •
                        Durasi: {w.attempts[0].durationMs || 0}ms
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Mutation Match */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Audit Mutasi GoBiz Provider</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {data.providerEvent ? (
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Provider Ref ID:</span>
                  <span className="font-mono font-bold text-emerald-600">{data.providerEvent.providerRefId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Diproses Pada:</span>
                  <span className="text-foreground">
                    {data.providerEvent.processedAt
                      ? new Date(data.providerEvent.processedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'N/A'}
                  </span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  Mutasi Cocok & Tervalidasi
                </Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {data.status === 'PAID' ? 'Mutasi rekonsiliasi internal aktif' : 'Menunggu mutasi masuk dari GoBiz journal'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
