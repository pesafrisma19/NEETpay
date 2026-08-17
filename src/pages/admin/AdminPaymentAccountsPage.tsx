import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  QrCode,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminPaymentAccountItem {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  provider: string;
  goBiz: {
    authType: string;
    merchantId: string;
    outletId: string;
    merchantName: string;
    outletName: string;
    maskedIdentifier: string;
    hasQrString: boolean;
    qrUpdatedAt?: string;
    lastConnectionCheckAt?: string;
  } | null;
}

interface PaymentAccountsResponse {
  items: AdminPaymentAccountItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AdminPaymentAccountsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminPaymentAccounts', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await apiClient<PaymentAccountsResponse>(`/api/admin/payment-accounts?${params.toString()}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-purple-600" />
            <span>Semua Payment Accounts</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar seluruh akun outlet GoBiz milik merchant yang terhubung ke NeetPay.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-lg">
          Total Akun: <span className="font-bold text-foreground">{data?.pagination.total || 0}</span>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="bg-card border-border/70">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama outlet, merchant, atau identifier..."
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
              {['ALL', 'ACTIVE', 'NEEDS_REAUTH', 'INACTIVE'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    statusFilter === st ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="p-8 text-center bg-card border rounded-2xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-semibold text-sm">Gagal memuat data payment accounts.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl space-y-3">
          <QrCode className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base">Tidak Ada Payment Account</h3>
          <p className="text-sm text-muted-foreground">Belum ada akun GoBiz yang terdaftar pada filter ini.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground border-b uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4">Outlet & Merchant</th>
                    <th className="p-3.5">Pemilik (User)</th>
                    <th className="p-3.5">Provider & Auth</th>
                    <th className="p-3.5">Status Koneksi</th>
                    <th className="p-3.5">Status QRIS</th>
                    <th className="p-3.5">Cek Terakhir</th>
                    <th className="p-3.5 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((pa) => (
                    <tr key={pa.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-foreground">{pa.goBiz?.outletName || pa.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {pa.goBiz?.merchantId || 'N/A'} • {pa.goBiz?.maskedIdentifier}
                        </div>
                      </td>
                      <td className="p-3.5 text-xs">
                        <Link to={`/admin/users/${pa.user.id}`} className="font-semibold text-foreground hover:underline">
                          {pa.user.name}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">{pa.user.email}</div>
                      </td>
                      <td className="p-3.5 text-xs">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">
                          {pa.provider}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground ml-1.5 font-mono">
                          {pa.goBiz?.authType || 'OTP'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            pa.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs'
                              : pa.status === 'NEEDS_REAUTH'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs'
                          }
                        >
                          {pa.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-xs">
                        {pa.goBiz?.hasQrString ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>QRIS Synced</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Unavailable</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {pa.goBiz?.lastConnectionCheckAt
                          ? new Date(pa.goBiz.lastConnectionCheckAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Baru saja'}
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                          <Link to={`/admin/payment-accounts/${pa.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Audit</span>
                          </Link>
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
            {data.items.map((pa) => (
              <Card key={pa.id} className="bg-card border-border/70 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{pa.goBiz?.outletName || pa.name}</h3>
                    <p className="text-xs text-muted-foreground">{pa.user.name} ({pa.user.email})</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      pa.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]'
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'
                    }
                  >
                    {pa.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-t border-b border-border/50 text-muted-foreground">
                  <span>Provider: {pa.provider} ({pa.goBiz?.authType})</span>
                  <span>{pa.goBiz?.hasQrString ? 'QRIS OK' : 'No QR'}</span>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                  <Link to={`/admin/payment-accounts/${pa.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit Detail Akun</span>
                  </Link>
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
    </div>
  );
};
