import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AdminTransactionItem {
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
    outletName: string;
    merchantName: string;
  };
  provider: string;
}

interface TransactionsResponse {
  items: AdminTransactionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AdminTransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminTransactions', page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await apiClient<TransactionsResponse>(`/api/admin/transactions?${params.toString()}`);
      return res.data;
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Semua Transaksi Platform</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit dan monitor seluruh arus transaksi QRIS dinamis di seluruh merchant NeetPay.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-lg">
          Total Transaksi: <span className="font-bold text-foreground">{data?.pagination.total || 0}</span>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="bg-card border-border/70">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari Reference, Order ID, atau Nama Pelanggan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50 text-xs">
              {['ALL', 'PAID', 'PENDING', 'EXPIRED'].map((st) => (
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
                  {st === 'ALL' ? 'Semua' : st}
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
          <p className="font-semibold text-sm">Gagal memuat data transaksi.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl space-y-3">
          <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base">Tidak Ada Transaksi</h3>
          <p className="text-sm text-muted-foreground">Tidak ada riwayat transaksi yang cocok dengan filter Anda.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground border-b uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4">Reference & Merchant</th>
                    <th className="p-3.5">Outlet GoBiz</th>
                    <th className="p-3.5">Nominal Dasar</th>
                    <th className="p-3.5 text-center">Kode Unik</th>
                    <th className="p-3.5">Total Tagihan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Waktu Dibuat</th>
                    <th className="p-3.5 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
                          <span>{tx.externalRefNo}</span>
                          <button
                            onClick={() => copyToClipboard(tx.externalRefNo, tx.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === tx.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {tx.user.name} ({tx.user.email})
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-foreground font-medium">
                        {tx.paymentAccount.outletName}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {formatIDR(tx.amount)}
                      </td>
                      <td className="p-3.5 text-center font-mono text-xs font-bold text-primary">
                        +{tx.uniqueCode}
                      </td>
                      <td className="p-3.5 font-bold text-foreground text-sm">
                        {formatIDR(tx.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            tx.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs gap-1'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs gap-1'
                          }
                        >
                          {tx.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'PENDING' && <Clock className="w-3 h-3 animate-pulse" />}
                          {tx.status === 'EXPIRED' && <XCircle className="w-3 h-3" />}
                          <span>{tx.status}</span>
                        </Badge>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                          <Link to={`/admin/transactions/${tx.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
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
            {data.items.map((tx) => (
              <Card key={tx.id} className="bg-card border-border/70 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-foreground">{tx.externalRefNo}</span>
                    <p className="text-[11px] text-muted-foreground">{tx.user.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      tx.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]'
                    }
                  >
                    {tx.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-t border-b border-border/50">
                  <span className="text-muted-foreground">Outlet: {tx.paymentAccount.outletName}</span>
                  <span className="font-bold text-foreground text-sm">{formatIDR(tx.totalAmount)}</span>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                  <Link to={`/admin/transactions/${tx.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail Transaksi</span>
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
