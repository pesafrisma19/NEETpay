import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QrCode,
  PlusCircle,
  RefreshCw,
  Store,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Trash2,
  Edit2,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ConnectGoBizModal } from './ConnectGoBizModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PaymentAccountItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'NEEDS_REAUTH' | 'INACTIVE' | string;
  provider: string;
  providerName: string;
  customMinAmount: number | null;
  customMaxAmount: number | null;
  lastSyncedAt: string | null;
  goBiz: {
    id: string;
    authType: 'OTP' | 'PASSWORD';
    merchantId: string;
    outletId: string;
    merchantName: string | null;
    outletName: string | null;
    hasQrString: boolean;
    qrUpdatedAt: string | null;
    lastConnectionCheckAt: string | null;
    connectedSince: string;
  } | null;
  createdAt: string;
}

export const PaymentAccountsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<PaymentAccountItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<PaymentAccountItem | null>(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const plan = user?.subscription?.plan || {
    code: 'FREE',
    name: 'Free Plan',
    paymentAccountLimit: 1,
  };

  const { data: accounts, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['payment-accounts-list'],
    queryFn: async () => {
      const res = await apiClient<PaymentAccountItem[]>('/api/payment-accounts');
      return res.data || [];
    },
    staleTime: 1000 * 15,
  });

  const activeAccounts = (accounts || []).filter((a) => a.status !== 'INACTIVE');
  const isLimitReached = activeAccounts.length >= plan.paymentAccountLimit;

  // Copy Channel ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Payment Account ID berhasil disalin.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Rename Display Name Mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient(`/api/payment-accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      }),
    onSuccess: () => {
      toast.success('Nama tampilan channel berhasil diperbarui.');
      setRenameTarget(null);
      queryClient.invalidateQueries({ queryKey: ['payment-accounts-list'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal mengubah nama channel.');
    },
  });

  // Resync QRIS Mutation
  const resyncMutation = useMutation({
    mutationFn: (accountId: string) =>
      apiClient(`/api/payment-accounts/${accountId}/resync-qris`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Status sinkronisasi QRIS berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: ['payment-accounts-list'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal sinkronisasi QRIS.');
    },
  });

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) =>
      apiClient(`/api/payment-accounts/${accountId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Akun GoBiz berhasil diputuskan.');
      setDisconnectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['payment-accounts-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal memutuskan akun GoBiz.');
    },
  });

  const handleOpenRename = (acc: PaymentAccountItem) => {
    setRenameTarget(acc);
    setNewNameInput(acc.name);
  };

  const handleSaveRename = () => {
    if (!renameTarget || !newNameInput.trim()) return;
    renameMutation.mutate({ id: renameTarget.id, name: newNameInput.trim() });
  };

  return (
    <div className="space-y-6">
      {/* Header & Limits Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Payment Accounts & Channels</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola koneksi GoBiz merchant dan nama tampilan channel untuk integrasi API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            disabled={isLimitReached}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Hubungkan GoBiz</span>
          </Button>
        </div>
      </div>

      {/* Quota Limit Info Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {activeAccounts.length}/{plan.paymentAccountLimit}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Kuota Akun GoBiz ({plan.code} Plan)
              </span>
              <Badge variant={isLimitReached ? 'pending' : 'paid'} className="text-[10px]">
                {isLimitReached ? 'Batas Maksimal' : 'Tersedia'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLimitReached
                ? `Anda telah menggunakan batas maksimal ${plan.paymentAccountLimit} akun untuk ${plan.code} plan.`
                : `Anda dapat menghubungkan hingga ${plan.paymentAccountLimit} akun GoBiz outlet.`}
            </p>
          </div>
        </div>

        {plan.code === 'FREE' && (
          <Button asChild variant="outline" size="sm" className="hidden sm:flex text-xs font-semibold">
            <Link to="/dashboard/plan">
              <span>Upgrade ke PRO</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Accounts List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-8 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-70" />
          <CardTitle className="text-base font-bold">Gagal Memuat Akun GoBiz</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">{error?.message}</CardDescription>
        </Card>
      ) : activeAccounts.length === 0 ? (
        <Card className="border-border/80 bg-card p-12 text-center space-y-3 shadow-xs">
          <QrCode className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <CardTitle className="text-lg font-bold text-foreground">
            Belum ada akun GoBiz yang terhubung
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Hubungkan akun GoBiz Anda menggunakan nomor handphone (SMS OTP) atau email & password untuk mulai menerima pembayaran QRIS langsung ke rekening usaha Anda.
          </CardDescription>
          <Button
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            className="text-xs font-semibold gap-1.5 mt-2"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Hubungkan Akun GoBiz Pertama</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeAccounts.map((acc) => {
            const isConnected = acc.status === 'ACTIVE';
            const isReauth = acc.status === 'NEEDS_REAUTH';

            return (
              <Card key={acc.id} className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold text-foreground truncate">
                            {acc.name}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenRename(acc)}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            title="Ubah nama channel"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground truncate mt-0.5">
                          GoBiz Outlet: {acc.goBiz?.outletName || acc.providerName}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={isConnected ? 'paid' : isReauth ? 'pending' : 'expired'} className="text-[11px] font-bold shrink-0">
                      {isConnected ? 'CONNECTED' : isReauth ? 'NEEDS REAUTH' : 'DISCONNECTED'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 py-3 space-y-3 text-xs border-y border-border/40">
                  {/* Technical ID (paymentAccountId) */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono block">Channel / Account ID</span>
                      <code className="text-[11px] font-mono text-foreground font-semibold select-all truncate block">
                        {acc.id}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyId(acc.id)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === acc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Provider Gateway</span>
                      <p className="font-semibold text-foreground mt-0.5">{acc.providerName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Metode Login</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {acc.goBiz?.authType === 'OTP' ? 'SMS OTP' : 'Email & Password'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status QRIS</span>
                      <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                        {acc.goBiz?.hasQrString ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>QRIS Synced</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Unavailable</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Terakhir Sinkron</span>
                      <p className="font-mono text-muted-foreground mt-0.5">
                        {acc.goBiz?.qrUpdatedAt
                          ? new Date(acc.goBiz.qrUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 bg-muted/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resyncMutation.mutate(acc.id)}
                      disabled={resyncMutation.isPending}
                      className="text-xs h-8 px-2.5"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${resyncMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>Resync QRIS</span>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="text-xs h-8 font-semibold">
                      <Link to={`/dashboard/payment-accounts/${acc.id}`}>
                        <Settings className="w-3 h-3 mr-1.5" />
                        <span>Pengaturan & Fee</span>
                      </Link>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDisconnectTarget(acc)}
                    className="text-xs h-8 px-2 text-destructive hover:bg-destructive/10"
                    title="Putuskan koneksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connect GoBiz Dialog */}
      <ConnectGoBizModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['payment-accounts-list'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
        }}
      />

      {/* Quick Rename Display Name Modal */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Ubah Nama Tampilan Channel
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Nama ini digunakan sebagai label tampilan saat client/pembeli memilih metode pembayaran di website Anda (misal: <em>"QRIS Utama"</em> atau <em>"QRIS Toko 2"</em>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rename-channel-input" className="text-xs font-semibold">
                Nama Tampilan (Display Name)
              </Label>
              <Input
                id="rename-channel-input"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                placeholder="Contoh: QRIS Utama"
                className="text-xs h-9 bg-background"
                maxLength={100}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveRename();
                  }
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Perubahan nama tampilan tidak mengubah ID teknis akun dan tidak mempengaruhi saldo ataupun koneksi GoBiz.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameTarget(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSaveRename}
              disabled={renameMutation.isPending || !newNameInput.trim()}
              className="text-xs font-semibold"
            >
              {renameMutation.isPending ? 'Menyimpan...' : 'Simpan Nama'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Putuskan Koneksi Akun GoBiz?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Apakah Anda yakin ingin memutuskan akun <strong>{disconnectTarget?.name}</strong> (Outlet: {disconnectTarget?.goBiz?.outletName || '-'})? Transaksi QRIS baru tidak akan dapat diproses menggunakan akun ini sampai dihubungkan kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setDisconnectTarget(null)} className="text-xs">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => disconnectTarget && disconnectMutation.mutate(disconnectTarget.id)}
              disabled={disconnectMutation.isPending}
              className="text-xs font-semibold"
            >
              {disconnectMutation.isPending ? 'Memutuskan...' : 'Ya, Putuskan Koneksi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
