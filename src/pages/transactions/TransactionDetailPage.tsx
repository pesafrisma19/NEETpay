import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Webhook,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionDetailData {
  id: string;
  reference: string;
  externalRefNo: string;
  amount: number;
  feeAmount: number;
  feeType: string;
  feeValue: number;
  uniqueCode: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone?: string | null;
  metadata: Record<string, any> | null;
  qrisPayload: string | null;
  qrisUrl: string | null;
  providerRefId: string | null;
  paymentAccount: {
    id: string;
    name: string;
    providerCode?: string;
    providerName?: string;
    outletName: string;
    merchantName: string | null;
  };
  timeline: Array<{
    id: string;
    type: string;
    fromStatus: string | null;
    toStatus: string | null;
    metadata: any;
    createdAt: string;
  }>;
  webhookDeliveries: Array<{
    id: string;
    event: string;
    status: string;
    attemptsCount: number;
    createdAt: string;
    attempts: Array<{
      id: string;
      attempt: number;
      httpStatus: number | null;
      error: string | null;
      durationMs: number | null;
      createdAt: string;
    }>;
  }>;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string;
  updatedAt: string;
}

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const { data: trx, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transaction-detail', id],
    queryFn: async () => {
      const res = await apiClient<TransactionDetailData>(`/api/transactions/${id}`);
      return res.data!;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto-poll every 3s if still PENDING
      return query.state.data?.status === 'PENDING' ? 3000 : false;
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Disalin ke clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PAID / LUNAS</span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>PENDING / MENUNGGU PEMBAYARAN</span>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>EXPIRED / KEDALUWARSA</span>
          </div>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl bg-card" />
          <Skeleton className="h-96 rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  if (isError || !trx) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Button>
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-8 text-center">
          <XCircle className="w-10 h-10 mx-auto mb-2 text-destructive" />
          <CardTitle className="text-base font-bold">Transaksi Tidak Ditemukan</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {error?.message || 'Data transaksi tidak dapat dimuat.'}
          </p>
        </Card>
      </div>
    );
  }

  const isDynamic = trx.paymentAccount?.providerCode === 'GOBIZ_DYNAMIC' || trx.metadata?.provider === 'GOBIZ_DYNAMIC';

  return (
    <div className="space-y-6">
      {/* Top Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
            <Link to="/dashboard/transactions">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Semua Transaksi</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground font-mono flex items-center gap-2">
              <span>{trx.reference}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(trx.reference, 'ref')}
                className="h-6 w-6 text-muted-foreground"
              >
                {copiedKey === 'ref' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {trx.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge(trx.status)}
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-9 w-9 p-0">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Main Grid: Details Left, Timeline & QR Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial & Metadata Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Summary Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Rincian Nominal Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground font-medium">Base Amount (Harga Asal)</span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  Rp {trx.amount.toLocaleString('id-ID')}
                </span>
              </div>

              {trx.feeAmount > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Customer Fee ({trx.feeType === 'PERCENT' ? `${trx.feeValue / 100}%` : `Rp ${trx.feeValue}`})
                  </span>
                  <span className="text-sm font-semibold text-foreground font-mono">
                    Rp {trx.feeAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">Unique Code (Kode Unik)</span>
                  <p className="text-[10px] text-muted-foreground">Otomatis oleh engine untuk verifikasi instan</p>
                </div>
                <span className="text-sm font-bold text-primary font-mono">
                  +{trx.uniqueCode}
                </span>
              </div>

              <Separator />

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-sm font-bold text-foreground">Total Tagihan (Total Settlement)</span>
                  <p className="text-[11px] text-muted-foreground">
                    {isDynamic
                      ? 'Dana masuk 100% langsung ke saldo GoPay Merchant Anda'
                      : 'Dana masuk 100% langsung ke rekening GoBiz Anda'}
                  </p>
                </div>
                <span className="text-2xl font-black text-foreground font-mono">
                  Rp {trx.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Account & Settlement Target */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Target Payment Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">
                    {isDynamic ? 'Nama Outlet' : 'Nama Outlet GoBiz'}
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{trx.paymentAccount.outletName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Merchant Entity</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{trx.paymentAccount.merchantName || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">External Ref No</span>
                  <p className="text-xs font-mono text-foreground mt-0.5">{trx.externalRefNo || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    {isDynamic ? 'Payment Reference ID' : 'GoBiz Mutation Ref ID'}
                  </span>
                  <p className="text-xs font-mono text-foreground mt-0.5">
                    {trx.providerRefId ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{trx.providerRefId}</span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {isDynamic ? 'Menunggu settlement...' : 'Menunggu mutasi...'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Metadata */}
          {(trx.customerName || trx.customerEmail || trx.customerPhone || trx.metadata) && (
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Informasi Customer & Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trx.customerName && (
                    <div>
                      <span className="text-xs text-muted-foreground">Customer Name</span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{trx.customerName}</p>
                    </div>
                  )}
                  {trx.customerEmail && (
                    <div>
                      <span className="text-xs text-muted-foreground">Customer Email</span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{trx.customerEmail}</p>
                    </div>
                  )}
                  {trx.customerPhone && (
                    <div>
                      <span className="text-xs text-muted-foreground">Customer Phone</span>
                      <p className="text-sm font-semibold text-foreground mt-0.5 font-mono">{trx.customerPhone}</p>
                    </div>
                  )}
                </div>

                {trx.metadata && (
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">Raw Metadata</span>
                    <pre className="mt-1 p-3 rounded-lg bg-muted/60 text-xs font-mono text-foreground overflow-x-auto">
                      {JSON.stringify(trx.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Webhook Delivery Information */}
          {trx.webhookDeliveries.length > 0 && (
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Webhook Merchant Delivery
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {trx.webhookDeliveries.map((wh) => (
                  <div key={wh.id} className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {wh.event}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {wh.attemptsCount} Percobaan (Attempts)
                        </span>
                      </div>
                      <Badge variant={wh.status === 'SUCCESS' ? 'paid' : wh.status === 'PENDING' ? 'pending' : 'expired'}>
                        {wh.status}
                      </Badge>
                    </div>

                    {wh.attempts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
                        {wh.attempts.map((att) => (
                          <div key={att.id} className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                            <span>Attempt #{att.attempt} (HTTP {att.httpStatus || 'ERR'})</span>
                            <span>{att.durationMs ? `${att.durationMs}ms` : '-'} | {new Date(att.createdAt).toLocaleTimeString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1 Col: Dynamic Timeline & Expiry */}
        <div className="space-y-6">
          {/* Time Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Lifecycle & Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-muted-foreground">Dibuat Pada</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">
                  {new Date(trx.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Kedaluwarsa (Expires At)</span>
                <p className="font-mono font-semibold text-foreground mt-0.5">
                  {new Date(trx.expiredAt).toLocaleString('id-ID')}
                </p>
              </div>

              {trx.paidAt && (
                <div>
                  <span className="text-muted-foreground">Lunas Terverifikasi (Paid At)</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {new Date(trx.paidAt).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Timeline Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Event Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {trx.timeline.map((evt) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono text-foreground block">
                        {evt.type}
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {new Date(evt.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                      {evt.toStatus && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Status beralih: <span className="font-bold text-foreground">{evt.toStatus}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
