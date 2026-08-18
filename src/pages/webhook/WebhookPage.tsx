import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Webhook,
  RefreshCw,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface WebhookConfigData {
  id?: string;
  url: string;
  isEnabled: boolean;
  events: string[];
  secretMasked?: string;
  secretKeyMasked?: string;
  secret?: string;
}

interface RotateWebhookSecretResult {
  secret: string;
  maskedSecret: string;
}

interface WebhookDeliveryItem {
  id: string;
  event: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  attemptsCount: number;
  nextRetryAt: string | null;
  reference: string | null;
  totalAmount: number | null;
  payload: any;
  createdAt: string;
  updatedAt: string;
  attempts: Array<{
    id: string;
    attempt: number;
    httpStatus: number | null;
    responseBody: string | null;
    error: string | null;
    durationMs: number | null;
    createdAt: string;
  }>;
}

const webhookSchema = z.object({
  url: z.string().url('Format URL webhook tidak valid (harus diawali http:// atau https://)'),
  isEnabled: z.boolean(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

export const WebhookPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [historyPage, setHistoryPage] = useState(1);
  const [rotatedSecretRaw, setRotatedSecretRaw] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryItem | null>(null);
  const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // 1. Fetch Webhook Config
  const { data: config, isLoading: isConfigLoading, refetch: refetchConfig } = useQuery({
    queryKey: ['webhook-config'],
    queryFn: async () => {
      const res = await apiClient<WebhookConfigData>('/api/webhook');
      return res.data!;
    },
    staleTime: 1000 * 30,
  });

  // 2. Fetch Webhook Delivery History
  const { data: deliveriesData, isLoading: isDeliveriesLoading, refetch: refetchDeliveries, isFetching } = useQuery({
    queryKey: ['webhook-deliveries', historyPage],
    queryFn: async () => {
      const res = await apiClient<{
        items: WebhookDeliveryItem[];
        pagination: { page: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
      }>(`/api/webhook/deliveries?page=${historyPage}&limit=10`);
      return res.data!;
    },
    staleTime: 1000 * 15,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: '',
      isEnabled: true,
    },
  });

  const isEnabledValue = watch('isEnabled');

  useEffect(() => {
    if (config) {
      setValue('url', config.url || '');
      setValue('isEnabled', config.isEnabled);
    }
  }, [config, setValue]);

  // Update Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: (data: WebhookFormData) =>
      apiClient<WebhookConfigData>('/api/webhook', {
        method: 'PUT',
        body: JSON.stringify({
          url: data.url.trim(),
          isEnabled: data.isEnabled,
        }),
      }),
    onSuccess: (res) => {
      if (res.data?.secret) {
        setRotatedSecretRaw(res.data.secret);
      }
      toast.success('Konfigurasi webhook berhasil disimpan!');
      queryClient.invalidateQueries({ queryKey: ['webhook-config'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan konfigurasi webhook.');
    },
  });

  // Rotate Secret Mutation
  const rotateSecretMutation = useMutation({
    mutationFn: () =>
      apiClient<RotateWebhookSecretResult>('/api/webhook/rotate-secret', { method: 'POST' }),
    onSuccess: (res) => {
      if (res.data?.secret) {
        setRotatedSecretRaw(res.data.secret);
      }
      setRotateConfirmOpen(false);
      toast.success('Secret webhook berhasil dirotasi!');
      queryClient.invalidateQueries({ queryKey: ['webhook-config'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal merotasi secret webhook.');
    },
  });

  // Test Webhook Mutation
  const testWebhookMutation = useMutation({
    mutationFn: () => apiClient('/api/webhook/test', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Test webhook berhasil dikirim dan diterima HTTP 200!');
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal mengirim test webhook ke server Anda.');
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
    },
  });

  const handleCopySecret = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    toast.success('Webhook Secret berhasil disalin!');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const deliveries = deliveriesData?.items || [];
  const pagination = deliveriesData?.pagination || { page: 1, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const maskedSecretDisplay = config?.secretMasked || config?.secretKeyMasked || 'whsec_••••••••••••';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Webhook Notifications</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Dapatkan notifikasi otomatis real-time ke server backend Anda saat status transaksi berubah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchConfig();
              refetchDeliveries();
            }}
            disabled={isFetching}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Configuration Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Konfigurasi Endpoint Webhook
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Payload JSON bertanda tangan HMAC-SHA256 (Header <code>X-NeetPay-Signature</code>)
                </CardDescription>
              </div>
            </div>
            <Badge variant={config?.isEnabled ? 'paid' : 'pending'} className="text-[10px] font-bold">
              {config?.isEnabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isConfigLoading ? (
            <Skeleton className="h-40 w-full rounded-lg bg-muted/60" />
          ) : (
            <form onSubmit={handleSubmit((data) => updateConfigMutation.mutate(data))} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="webhook-url" className="text-xs font-semibold">
                  Target Webhook URL
                </Label>
                <Input
                  id="webhook-url"
                  placeholder="https://domain-anda.com/api/webhooks/neetpay"
                  className="text-xs font-mono"
                  {...register('url')}
                />
                {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/30 border border-border/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Status Notifikasi Webhook</span>
                  <p className="text-[11px] text-muted-foreground">
                    Aktifkan untuk mulai menerima event pembayaran secara langsung
                  </p>
                </div>
                <Switch
                  checked={isEnabledValue}
                  onCheckedChange={(checked) => setValue('isEnabled', checked)}
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Webhook Signing Secret</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-lg bg-muted/50 border border-border/60 font-mono text-xs text-foreground font-semibold flex items-center justify-between">
                    <span>{maskedSecretDisplay}</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-medium uppercase">
                      Masked for Security
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotateConfirmOpen(true)}
                    className="text-xs font-semibold h-9 px-3 gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Secret</span>
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                  className="text-xs font-semibold gap-1.5 h-9"
                >
                  <span>{updateConfigMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => testWebhookMutation.mutate()}
                  disabled={testWebhookMutation.isPending || !config?.url}
                  className="text-xs font-semibold gap-1.5 h-9"
                >
                  <Send className={`w-3.5 h-3.5 ${testWebhookMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>{testWebhookMutation.isPending ? 'Mengirim Test...' : 'Kirim Test Webhook'}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Webhook Delivery History Card */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Riwayat Pengiriman Webhook (Delivery History)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Log audit pengiriman HTTP callback beserta status kode dan durasi respon
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isDeliveriesLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted/60" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm font-semibold text-foreground">Belum ada riwayat webhook</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Pengiriman notifikasi otomatis akan tercatat di sini saat transaksi lunas atau kedaluwarsa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs">Event</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">HTTP Status</TableHead>
                    <TableHead className="text-xs">Attempts</TableHead>
                    <TableHead className="text-xs">Waktu</TableHead>
                    <TableHead className="text-xs text-right">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((item) => {
                    const lastAttempt = item.attempts[item.attempts.length - 1];
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {item.event}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.reference || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'SUCCESS' ? 'paid' : item.status === 'PENDING' ? 'pending' : 'expired'}
                            className="text-[10px]"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {lastAttempt?.httpStatus ? (
                            <span className={lastAttempt.httpStatus >= 200 && lastAttempt.httpStatus < 300 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                              HTTP {lastAttempt.httpStatus}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {item.attemptsCount}x
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDelivery(item)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Lihat</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {deliveries.length > 0 && (
          <CardFooter className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Total <span className="font-semibold text-foreground">{pagination.total}</span> pengiriman webhook
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>Prev</span>
              </Button>
              <span className="font-mono px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="h-8 px-2 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Delivery Detail Modal */}
      <Dialog open={!!selectedDelivery} onOpenChange={(open) => !open && setSelectedDelivery(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-bold">
                {selectedDelivery?.event}
              </Badge>
              <DialogTitle className="text-base font-bold">Detail Pengiriman Webhook</DialogTitle>
            </div>
            <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
              ID: {selectedDelivery?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
                <div>
                  <span className="text-muted-foreground">Status Final</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedDelivery.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Percobaan</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedDelivery.attemptsCount}x Percobaan</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Riwayat Percobaan (Attempts)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDelivery.attempts.map((att) => (
                    <div key={att.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 font-mono text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Percobaan #{att.attempt}</span>
                        <span className={att.httpStatus === 200 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                          HTTP {att.httpStatus || 'ERR'} ({att.durationMs ? `${att.durationMs}ms` : '-'})
                        </span>
                      </div>
                      {att.error && <p className="text-destructive text-[10px]">{att.error}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Payload JSON Terkirim</h4>
                <pre className="p-3 rounded-lg bg-muted/60 text-foreground font-mono text-[11px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setSelectedDelivery(null)} className="w-full text-xs font-semibold">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-Time Webhook Secret Modal (Identical to API Key Page) */}
      <Dialog open={!!rotatedSecretRaw} onOpenChange={(open) => !open && setRotatedSecretRaw(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <DialogTitle className="text-base font-bold">Webhook Secret Baru</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Simpan secret ini di file environment backend Anda sekarang. Secret ini hanya ditampilkan sekali dan tidak akan dapat dilihat kembali setelah jendela ini ditutup.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-lg bg-muted/80 border border-primary/30 flex items-center justify-between gap-3">
            <code className="font-mono text-xs font-bold text-primary break-all">
              {rotatedSecretRaw}
            </code>
            <Button
              size="sm"
              onClick={() => rotatedSecretRaw && handleCopySecret(rotatedSecretRaw)}
              className="h-8 px-3 text-xs font-semibold shrink-0 gap-1.5"
            >
              {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSecret ? 'Tersalin' : 'Salin Secret'}</span>
            </Button>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setRotatedSecretRaw(null)} className="w-full text-xs font-semibold">
              Saya Telah Menyimpan Secret Ini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Secret Confirmation Modal */}
      <Dialog open={rotateConfirmOpen} onOpenChange={setRotateConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Rotasi Secret Webhook?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Merotasi secret key akan mengubah signature HMAC pengiriman webhook berikutnya. Pastikan Anda segera memperbarui secret pada backend server Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setRotateConfirmOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => rotateSecretMutation.mutate()}
              disabled={rotateSecretMutation.isPending}
              className="text-xs font-semibold"
            >
              {rotateSecretMutation.isPending ? 'Memproses...' : 'Ya, Rotasi Secret'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
