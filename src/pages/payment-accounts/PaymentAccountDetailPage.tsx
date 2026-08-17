import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PaymentAccountDetailData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'NEEDS_REAUTH' | 'INACTIVE' | string;
  isActive: boolean;
  provider: string;
  providerName: string;
  customMinAmount: number | null;
  customMaxAmount: number | null;
  lastSyncedAt: string | null;
  feeRule: {
    type: 'NONE' | 'FLAT' | 'PERCENT';
    value: number;
    isEnabled: boolean;
  };
  goBiz: {
    id: string;
    authType: 'OTP' | 'PASSWORD';
    merchantId: string;
    outletId: string;
    merchantName: string | null;
    outletName: string | null;
    loginIdentifierMasked: string | null;
    hasQrString: boolean;
    qrUpdatedAt: string | null;
    lastConnectionCheckAt: string | null;
    connectedSince: string;
    tokenLifecycles: Array<{
      id: string;
      tokenType: string;
      tokenFingerprint: string;
      issuedAt: string;
      lastSuccessAt: string | null;
      lastAttemptAt: string | null;
      failedAt: string | null;
      replacedAt: string | null;
      failureCode: string | null;
    }>;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const settingsSchema = z.object({
  name: z.string().min(1, 'Nama akun harus diisi').max(100),
  customMinAmount: z.string().optional(),
  customMaxAmount: z.string().optional(),
  feeType: z.enum(['NONE', 'FLAT', 'PERCENT']),
  feeValue: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const PaymentAccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('connection');
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);

  const { data: account, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['payment-account-detail', id],
    queryFn: async () => {
      const res = await apiClient<PaymentAccountDetailData>(`/api/payment-accounts/${id}`);
      return res.data!;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      feeType: 'NONE',
      feeValue: '0',
    },
  });

  const selectedFeeType = watch('feeType');

  useEffect(() => {
    if (account) {
      setValue('name', account.name);
      setValue('customMinAmount', account.customMinAmount ? account.customMinAmount.toString() : '');
      setValue('customMaxAmount', account.customMaxAmount ? account.customMaxAmount.toString() : '');
      setValue('feeType', account.feeRule.type);
      setValue(
        'feeValue',
        account.feeRule.type === 'PERCENT'
          ? (account.feeRule.value / 100).toString()
          : account.feeRule.value.toString()
      );
    }
  }, [account, setValue]);

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => {
      const min = data.customMinAmount && data.customMinAmount.trim() !== '' ? Number(data.customMinAmount) : null;
      const max = data.customMaxAmount && data.customMaxAmount.trim() !== '' ? Number(data.customMaxAmount) : null;

      let feeVal = 0;
      if (data.feeType === 'FLAT') {
        feeVal = Math.max(0, parseInt(data.feeValue || '0', 10));
      } else if (data.feeType === 'PERCENT') {
        feeVal = Math.round(parseFloat(data.feeValue || '0') * 100); // basis points
      }

      return apiClient(`/api/payment-accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: data.name,
          customMinAmount: min,
          customMaxAmount: max,
          feeType: data.feeType,
          feeValue: feeVal,
        }),
      });
    },
    onSuccess: () => {
      toast.success('Pengaturan akun dan fee berhasil disimpan.');
      queryClient.invalidateQueries({ queryKey: ['payment-account-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts-list'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan pengaturan.');
    },
  });

  // Resync QRIS Mutation
  const resyncMutation = useMutation({
    mutationFn: () => apiClient(`/api/payment-accounts/${id}/resync-qris`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('QRIS berhasil disinkronkan kembali.');
      queryClient.invalidateQueries({ queryKey: ['payment-account-detail', id] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal sinkronisasi QRIS.');
    },
  });

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: () => apiClient(`/api/payment-accounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Akun GoBiz berhasil diputuskan.');
      navigate('/dashboard/payment-accounts');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal memutuskan akun GoBiz.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-muted" />
        <Skeleton className="h-96 rounded-xl bg-card" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Button>
        <Card className="border-destructive/30 bg-destructive/5 text-destructive p-8 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-destructive" />
          <CardTitle className="text-base font-bold">Akun GoBiz Tidak Ditemukan</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {error?.message || 'Data akun tidak dapat dimuat.'}
          </CardDescription>
        </Card>
      </div>
    );
  }

  const isConnected = account.status === 'ACTIVE';
  const isReauth = account.status === 'NEEDS_REAUTH';

  return (
    <div className="space-y-6">
      {/* Back & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5">
            <Link to="/dashboard/payment-accounts">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Semua Akun</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{account.goBiz?.outletName || account.name}</span>
              <Badge variant={isConnected ? 'paid' : isReauth ? 'pending' : 'expired'} className="text-[10px]">
                {isConnected ? 'CONNECTED' : isReauth ? 'NEEDS REAUTH' : 'DISCONNECTED'}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">ID: {account.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="grid grid-cols-3 h-10 bg-card border border-border max-w-md">
          <TabsTrigger value="connection" className="text-xs font-semibold">
            Koneksi & Status
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs font-semibold">
            Limit & Customer Fee
          </TabsTrigger>
          <TabsTrigger value="session" className="text-xs font-semibold">
            Sesi & Token Lifecycle
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Connection & Status */}
        <TabsContent value="connection" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Account Metadata Card */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Informasi Outlet GoBiz
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Nama Outlet</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{account.goBiz?.outletName || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Entitas Merchant</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{account.goBiz?.merchantName || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">GoBiz Merchant ID</span>
                  <p className="font-mono text-foreground font-semibold mt-0.5">{account.goBiz?.merchantId || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Login Identifier</span>
                  <p className="font-mono text-foreground font-semibold mt-0.5">{account.goBiz?.loginIdentifierMasked || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Metode Autentikasi</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {account.goBiz?.authType === 'OTP' ? 'SMS One-Time Password (OTP)' : 'Email & Password'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* QRIS & Sync Management Card */}
            <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Status QRIS & Sinkronisasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Ketersediaan QRIS Base</span>
                  <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                    {account.goBiz?.hasQrString ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tersinkron & Siap Dynamic QRIS</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-600">Base QRIS Belum Ditemukan</span>
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Sinkronisasi QR Terakhir</span>
                  <p className="font-mono text-foreground mt-0.5">
                    {account.goBiz?.qrUpdatedAt ? new Date(account.goBiz.qrUpdatedAt).toLocaleString('id-ID') : '-'}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">Pemeriksaan Koneksi Terakhir</span>
                  <p className="font-mono text-foreground mt-0.5">
                    {account.goBiz?.lastConnectionCheckAt
                      ? new Date(account.goBiz.lastConnectionCheckAt).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resyncMutation.mutate()}
                    disabled={resyncMutation.isPending}
                    className="w-full text-xs font-semibold gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resyncMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>Resync Base QRIS Sekarang</span>
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-muted/20 border-t border-border/60">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDisconnectModalOpen(true)}
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Putuskan Koneksi Akun Ini</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Limits & Customer Fee */}
        <TabsContent value="settings">
          <Card className="border-border/80 bg-card shadow-xs max-w-2xl">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold text-foreground">
                Pengaturan Limit & Markup Fee
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Atur batas nominal transaksi dan biaya admin tambahan yang ditagihkan ke pelanggan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-name" className="text-xs font-semibold">Nama Label Akun</Label>
                  <Input id="acc-name" className="text-xs" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1.5">
                    <Label htmlFor="min-amount" className="text-xs font-semibold">
                      Custom Minimum Amount (Opsional)
                    </Label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="Contoh: 1000"
                      className="text-xs font-mono"
                      {...register('customMinAmount')}
                    />
                    <p className="text-[10px] text-muted-foreground">Biarkan kosong jika tidak dibatasi</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="max-amount" className="text-xs font-semibold">
                      Custom Maximum Amount (Opsional)
                    </Label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="Contoh: 10000000"
                      className="text-xs font-mono"
                      {...register('customMaxAmount')}
                    />
                    <p className="text-[10px] text-muted-foreground">Biarkan kosong jika tidak dibatasi</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div>
                    <Label className="text-xs font-semibold">Customer Fee Rule (Markup Tambahan)</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Biaya tambahan yang ditambahkan ke nominal tagihan pelanggan per transaksi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipe Biaya</Label>
                      <Select
                        value={selectedFeeType}
                        onValueChange={(val: any) => setValue('feeType', val)}
                      >
                        <SelectTrigger className="text-xs h-9">
                          <SelectValue placeholder="Pilih tipe fee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">NONE (Tanpa Biaya Tambahan)</SelectItem>
                          <SelectItem value="FLAT">FLAT (Nominal Tetap Rp)</SelectItem>
                          <SelectItem value="PERCENT">PERCENT (Persentase %)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFeeType !== 'NONE' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="fee-val" className="text-xs text-muted-foreground">
                          {selectedFeeType === 'FLAT' ? 'Nominal Fee (Rp)' : 'Persentase Fee (%)'}
                        </Label>
                        <Input
                          id="fee-val"
                          type="number"
                          step={selectedFeeType === 'PERCENT' ? '0.01' : '1'}
                          placeholder={selectedFeeType === 'FLAT' ? '500' : '2.5'}
                          className="text-xs font-mono"
                          {...register('feeValue')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full text-xs font-semibold gap-2 mt-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Session & Token Lifecycle Information */}
        <TabsContent value="session">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Informasi Lifecycle Sesi & Token GoBiz
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Data historis observasi sesi GoBiz tanpa menampilkan raw secret atau credential.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20 border border-border/60">
                <div>
                  <span className="text-muted-foreground">Metode Autentikasi</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {account.goBiz?.authType === 'OTP' ? 'SMS OTP' : 'Email & Password'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Terhubung Sejak</span>
                  <p className="font-mono text-foreground mt-0.5">
                    {account.goBiz?.connectedSince ? new Date(account.goBiz.connectedSince).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pemeriksaan Sesi Terakhir</span>
                  <p className="font-mono text-foreground mt-0.5">
                    {account.goBiz?.lastConnectionCheckAt ? new Date(account.goBiz.lastConnectionCheckAt).toLocaleTimeString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Riwayat Observasi Token Sesi ({account.goBiz?.tokenLifecycles.length || 0})
                </h4>

                {(!account.goBiz?.tokenLifecycles || account.goBiz.tokenLifecycles.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic">Belum ada riwayat lifecycle sesi tercatat.</p>
                ) : (
                  <div className="space-y-2">
                    {account.goBiz.tokenLifecycles.map((tl) => (
                      <div
                        key={tl.id}
                        className="p-3 rounded-lg border border-border/60 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {tl.tokenType}
                          </Badge>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            Fingerprint: {tl.tokenFingerprint}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-[11px] font-mono">
                          <span>Diterbitkan: {new Date(tl.issuedAt).toLocaleTimeString('id-ID')}</span>
                          {tl.lastSuccessAt && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Sukses: {new Date(tl.lastSuccessAt).toLocaleTimeString('id-ID')}
                            </span>
                          )}
                          {tl.failedAt && (
                            <span className="text-rose-500">
                              Gagal ({tl.failureCode || 'ERR'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disconnect Modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Putuskan Akun GoBiz?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Apakah Anda yakin ingin memutuskan akun <strong>{account.goBiz?.outletName || account.name}</strong>? Transaksi QRIS baru tidak dapat diproses hingga akun dihubungkan kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setDisconnectModalOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="text-xs font-semibold"
            >
              {disconnectMutation.isPending ? 'Memutuskan...' : 'Ya, Putuskan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
