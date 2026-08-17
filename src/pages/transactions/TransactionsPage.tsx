import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface TransactionsResponse {
  items: Array<{
    id: string;
    reference: string;
    externalRefNo: string;
    amount: number;
    feeAmount: number;
    uniqueCode: number;
    totalAmount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | string;
    paymentAccount: {
      id: string;
      name: string;
      outletName: string;
      merchantName: string | null;
    };
    customerName: string | null;
    customerEmail: string | null;
    qrisUrl: string | null;
    createdAt: string;
    paidAt: string | null;
    expiredAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const TransactionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['transactions-list', page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(status !== 'ALL' ? { status } : {}),
        ...(search ? { search } : {}),
      });

      const res = await apiClient<TransactionsResponse>(`/api/transactions?${params.toString()}`);
      return res.data!;
    },
    staleTime: 1000 * 10,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Reference ID disalin ke clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStatusBadge = (trxStatus: string) => {
    switch (trxStatus) {
      case 'PAID':
        return <Badge variant="paid" className="text-xs font-semibold">PAID</Badge>;
      case 'PENDING':
        return <Badge variant="pending" className="text-xs font-semibold">PENDING</Badge>;
      case 'EXPIRED':
        return <Badge variant="expired" className="text-xs font-semibold">EXPIRED</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{trxStatus}</Badge>;
    }
  };

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  return (
    <div className="space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Daftar Transaksi</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola dan pantau seluruh transaksi QRIS yang diproses oleh gateway.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs gap-1.5 h-9 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs Filter */}
          <Tabs
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-4 h-9 bg-muted/60">
              <TabsTrigger value="ALL" className="text-xs">Semua</TabsTrigger>
              <TabsTrigger value="PAID" className="text-xs">PAID</TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs">PENDING</TabsTrigger>
              <TabsTrigger value="EXPIRED" className="text-xs">EXPIRED</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari Reference / Order ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs px-3 font-semibold">
              Cari
            </Button>
          </form>
        </div>
      </Card>

      {/* Main Transactions Container */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3 text-destructive">
            <XCircle className="w-8 h-8 mx-auto opacity-70" />
            <p className="text-sm font-semibold">Gagal memuat daftar transaksi</p>
            <p className="text-xs text-muted-foreground">{error?.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
              Coba Lagi
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <p className="text-base font-semibold text-foreground">Belum ada transaksi</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search || status !== 'ALL'
                ? 'Tidak ada transaksi yang cocok dengan filter atau pencarian Anda.'
                : 'Transaksi QRIS yang dibuat merchant akan otomatis tercatat di sini.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Base Amount</TableHead>
                    <TableHead className="text-xs">Fee</TableHead>
                    <TableHead className="text-xs">Unique Code</TableHead>
                    <TableHead className="text-xs">Total Amount</TableHead>
                    <TableHead className="text-xs">Outlet</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Dibuat</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((trx) => (
                    <TableRow key={trx.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/dashboard/transactions/${trx.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {trx.reference}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(trx.reference, trx.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === trx.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        Rp {trx.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {trx.feeAmount > 0 ? `Rp ${trx.feeAmount.toLocaleString('id-ID')}` : '-'}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        +{trx.uniqueCode}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        Rp {trx.totalAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {trx.paymentAccount.outletName}
                      </TableCell>
                      <TableCell>{renderStatusBadge(trx.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(trx.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold">
                          <Link to={`/dashboard/transactions/${trx.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Detail</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Responsive Card List */}
            <div className="md:hidden divide-y divide-border/60">
              {items.map((trx) => (
                <div key={trx.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-foreground">{trx.reference}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(trx.reference, trx.id)}
                        className="h-6 w-6 text-muted-foreground"
                      >
                        {copiedId === trx.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    {renderStatusBadge(trx.status)}
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Tagihan</span>
                      <span className="text-base font-extrabold text-foreground">
                        Rp {trx.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <span>Rp {trx.amount.toLocaleString('id-ID')}</span>
                      <span className="font-mono ml-1 text-primary">+{trx.uniqueCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="truncate max-w-[180px]">{trx.paymentAccount.outletName}</span>
                    <span className="font-mono">
                      {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <Button asChild variant="secondary" size="sm" className="w-full text-xs font-semibold h-8 mt-1">
                    <Link to={`/dashboard/transactions/${trx.id}`}>
                      <span>Lihat Detail Transaksi</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Menampilkan {items.length} dari <span className="font-semibold text-foreground">{pagination.total}</span> transaksi
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage || isFetching}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Prev</span>
                </Button>
                <span className="font-mono font-medium px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || isFetching}
                  className="h-8 px-2.5 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
