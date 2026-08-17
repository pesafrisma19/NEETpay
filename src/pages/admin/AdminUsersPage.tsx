import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  QrCode,
  Receipt,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  plan: {
    code: string;
    name: string;
    limit: number;
  };
  monthlyUsage: {
    totalTransactions: number;
    totalVolume: number;
  };
  counts: {
    paymentAccounts: number;
    transactions: number;
  };
}

interface UsersResponse {
  items: AdminUserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminUsers', page, search, planFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search.trim()) params.append('search', search.trim());
      if (planFilter !== 'ALL') params.append('plan', planFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await apiClient<UsersResponse>(`/api/admin/users?${params.toString()}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Pengguna Platform</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar seluruh akun merchant yang terdaftar di platform NeetPay.
          </p>
        </div>
        <div className="text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-lg">
          Total Pengguna: <span className="font-bold text-foreground">{data?.pagination.total || 0}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-card border-border/70">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Plan Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/50 text-xs">
              {['ALL', 'FREE', 'PRO'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlanFilter(p);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    planFilter === p ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'ALL' ? 'Semua Plan' : p}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/50 text-xs">
              {['ALL', 'ACTIVE', 'SUSPENDED'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    statusFilter === s ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s === 'ALL' ? 'Semua Status' : s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table / List Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="p-8 text-center bg-card border rounded-2xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-semibold text-sm">Gagal memuat data pengguna.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      ) : data.items.length === 0 ? (
        <div className="p-12 text-center bg-card border rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-bold text-base">Tidak Ada Pengguna Ditemukan</h3>
          <p className="text-sm text-muted-foreground">Tidak ada akun yang sesuai dengan kriteria pencarian.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground border-b uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-4">Pengguna</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Payment Accounts</th>
                    <th className="p-3.5 text-center">Transaksi</th>
                    <th className="p-3.5">Terdaftar</th>
                    <th className="p-3.5 text-right pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="font-bold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={u.plan.code === 'PRO' ? 'default' : 'outline'}
                          className="text-[11px] font-bold uppercase"
                        >
                          {u.plan.code}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center font-medium text-muted-foreground">
                        {u.counts.paymentAccounts} / {u.plan.limit}
                      </td>
                      <td className="p-3.5 text-center font-medium text-foreground">
                        {u.counts.transactions}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                          <Link to={`/admin/users/${u.id}`}>
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
            {data.items.map((u) => (
              <Card key={u.id} className="bg-card border-border/70 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{u.name}</h3>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant={u.plan.code === 'PRO' ? 'default' : 'outline'} className="text-[10px] font-bold">
                    {u.plan.code}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{u.counts.paymentAccounts} Akun</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{u.counts.transactions} Transaksi</span>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                  <Link to={`/admin/users/${u.id}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail Pengguna</span>
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
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
