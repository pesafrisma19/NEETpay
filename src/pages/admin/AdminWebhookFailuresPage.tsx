import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WebhookFailureItem {
  id: string;
  event: string;
  status: string;
  attemptsCount: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  transaction: {
    id: string;
    merchantTradeNo: string;
    externalRefNo: string;
    totalAmount: number;
    status: string;
  } | null;
  latestAttempt: {
    attempt: number;
    httpStatus?: number;
    durationMs?: number;
    error?: string;
    createdAt: string;
  } | null;
  attempts: Array<{
    attempt: number;
    httpStatus?: number;
    durationMs?: number;
    error?: string;
    createdAt: string;
  }>;
}

interface WebhookFailuresResponse {
  items: WebhookFailureItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AdminWebhookFailuresPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<WebhookFailureItem | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminWebhookFailures', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await apiClient<WebhookFailuresResponse>(`/api/admin/webhooks/failures?${params.toString()}`);
      return res.data;
    },
    refetchInterval: 8000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Investigasi Webhook Failures</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoring dan investigasi pengiriman notifikasi webhook merchant yang mengalami kegagalan atau antrean retry.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-lg">
          Total Masalah: <span className="font-bold text-foreground">{data?.pagination.total || 0}</span>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="bg-card border-border/70">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari Reference transaksi atau email merchant..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/50 text-xs">
              {['ALL', 'FAILED', 'RETRYING'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    statusFilter === st ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Masalah' : st === 'RETRYING' ? 'Antrean Retry' : 'Gagal Permanen'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="p-8 text-center bg-card border rounded-2xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-semibold text-sm">Gagal memuat data webhook failure.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600/60 mx-auto" />
          <h3 className="font-bold text-base">Tidak Ada Webhook Bermasalah</h3>
          <p className="text-sm text-muted-foreground">Semua pengiriman webhook merchant berhasil terkirim dengan lancar.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground border-b uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4">Merchant & Reference</th>
                    <th className="p-3.5">Event</th>
                    <th className="p-3.5">Status Delivery</th>
                    <th className="p-3.5 text-center">Percobaan</th>
                    <th className="p-3.5">HTTP Terakhir</th>
                    <th className="p-3.5">Pesan Error</th>
                    <th className="p-3.5 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-foreground">
                          {item.transaction?.externalRefNo || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.user.name} ({item.user.email})
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {item.event}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            item.status === 'FAILED'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs'
                          }
                        >
                          {item.status === 'FAILED' ? 'FAILED' : 'RETRYING'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center font-bold text-foreground text-xs">
                        {item.attemptsCount}x
                      </td>
                      <td className="p-3.5 text-xs font-mono font-bold text-foreground">
                        {item.latestAttempt?.httpStatus ? (
                          <span className={item.latestAttempt.httpStatus >= 400 ? 'text-rose-600' : 'text-foreground'}>
                            HTTP {item.latestAttempt.httpStatus}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Timeout / Net Error</span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        {item.latestAttempt?.error || 'Tidak ada response dari server merchant'}
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data.items.map((item) => (
              <Card key={item.id} className="bg-card border-border/70 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {item.transaction?.externalRefNo || item.id}
                    </span>
                    <p className="text-xs text-muted-foreground">{item.user.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'
                    }
                  >
                    {item.status} ({item.attemptsCount}x)
                  </Badge>
                </div>

                <p className="text-xs text-rose-600 bg-rose-500/10 p-2 rounded-md font-mono text-[11px] truncate">
                  {item.latestAttempt?.error || `HTTP ${item.latestAttempt?.httpStatus || 'Timeout'}`}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="w-full h-8 text-xs gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Riwayat Percobaan</span>
                </Button>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Halaman <span className="font-semibold text-foreground">{data.pagination.page}</span> dari{' '}
                <span className="font-semibold text-foreground">{data.pagination.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 gap-1 text-xs"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Attempt History Dialog Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Audit Riwayat Percobaan Webhook</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log percobaan pengiriman webhook untuk event{' '}
                <span className="font-mono font-bold text-foreground">{selectedItem.event}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="font-semibold text-foreground">{selectedItem.user.name} ({selectedItem.user.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference Transaksi:</span>
                  <span className="font-mono font-bold text-foreground">{selectedItem.transaction?.externalRefNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Percobaan:</span>
                  <span className="font-bold text-foreground">{selectedItem.attemptsCount} kali</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Log Tiap Percobaan</h4>
                {selectedItem.attempts.map((att) => (
                  <div key={att.attempt} className="p-3 rounded-lg border border-border/60 bg-card space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Percobaan #{att.attempt}</span>
                      <span className="font-mono text-muted-foreground text-[11px]">
                        {new Date(att.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>HTTP Status: <strong className="text-foreground">{att.httpStatus || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Durasi: <strong className="text-foreground">{att.durationMs || 0}ms</strong></span>
                    </div>
                    {att.error && (
                      <p className="text-[11px] text-rose-600 bg-rose-500/10 p-2 rounded font-mono break-all">
                        Error: {att.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
