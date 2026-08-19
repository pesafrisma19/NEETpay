import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Check,
  Copy,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TestDynamicQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    id: string;
    name: string;
    provider: string;
    providerName: string;
  } | null;
}

interface TestData {
  testOrderId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  paymentUrl: string | null;
  createdAt: string;
  paidAt?: string | null;
  issuer?: string;
  acquirer?: string;
}

export const TestDynamicQrModal: React.FC<TestDynamicQrModalProps> = ({
  open,
  onOpenChange,
  account,
}) => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Generate a test QR when modal opens
  useEffect(() => {
    if (open && account && !testData) {
      handleCreateTest();
    }
    if (!open) {
      setTestData(null);
    }
  }, [open, account]);

  const handleCreateTest = async () => {
    if (!account) return;
    setLoadingCreate(true);
    try {
      const res = await apiClient<TestData>(
        `/api/payment-accounts/gobiz-dynamic/${account.id}/test-qr`,
        { method: 'POST' }
      );
      if (res.data) {
        setTestData(res.data);
        toast.success('QRIS Dinamis Test Rp 1.000 berhasil diterbitkan!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menerbitkan QRIS Dinamis test.');
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!account || !testData) return;
    setLoadingCheck(true);
    try {
      const res = await apiClient<{
        orderId: string;
        status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
        rawStatus: string;
        isPaid: boolean;
        amount: number;
        paidAt?: string | null;
        issuer?: string;
      }>(`/api/payment-accounts/gobiz-dynamic/${account.id}/test-status`, {
        method: 'POST',
        body: JSON.stringify({ orderId: testData.testOrderId }),
      });

      const result = res.data;
      if (result) {
        setTestData((prev) =>
          prev
            ? {
                ...prev,
                status: result.status,
                paidAt: result.paidAt,
                issuer: result.issuer,
              }
            : null
        );

        if (result.isPaid || result.status === 'PAID') {
          toast.success('Pembayaran Berhasil Terverifikasi (Settlement)!');
        } else if (result.status === 'PENDING') {
          toast.info('Transaksi masih menunggu pembayaran dari pelanggan.');
        } else {
          toast.warning(`Status transaksi: ${result.status}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memeriksa status transaksi.');
    } finally {
      setLoadingCheck(false);
    }
  };

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    toast.success('Order ID disalin.');
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Test Dynamic QRIS Rp 1.000
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/40">
              Test Mode
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Akun: <strong className="text-foreground">{account?.name}</strong> (GoPay Merchant Dynamic)
          </DialogDescription>
        </DialogHeader>

        {loadingCreate ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Menerbitkan QRIS dinamis menggunakan kredensial tersimpan...</p>
          </div>
        ) : !testData ? (
          <div className="py-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto opacity-80" />
            <p className="text-xs text-muted-foreground">Gagal memuat QRIS Dinamis test.</p>
            <Button size="sm" onClick={handleCreateTest} className="text-xs font-semibold">
              Coba Lagi
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Amount & Status Card */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Nominal Transaksi (Exact)</span>
                <p className="text-xl font-bold text-foreground">Rp 1.000</p>
              </div>
              <Badge
                variant={
                  testData.status === 'PAID'
                    ? 'paid'
                    : testData.status === 'PENDING'
                    ? 'pending'
                    : 'expired'
                }
                className="text-xs font-bold font-mono px-2.5 py-0.5"
              >
                {testData.status}
              </Badge>
            </div>

            {/* Order Reference Box */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60 text-xs">
              <div className="truncate mr-2">
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Order Reference</span>
                <code className="text-[11px] font-mono text-foreground font-semibold">{testData.testOrderId}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyOrderId(testData.testOrderId)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Main Interactive Payment & Status Section */}
            {testData.status === 'PAID' ? (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Pembayaran Sukses (Settlement)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dana Rp 1.000 telah masuk langsung ke saldo merchant Anda. Transaksi ini tidak memakan kuota produksi dan tidak memicu webhook.
                </p>
                {testData.paidAt && (
                  <div className="pt-2 text-[11px] text-muted-foreground border-t border-emerald-500/20 flex justify-between">
                    <span>Waktu Lunas:</span>
                    <span className="font-semibold text-foreground">{new Date(testData.paidAt).toLocaleTimeString('id-ID')} WIB</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {testData.paymentUrl && (
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
                      <QrCode className="w-4 h-4" />
                      <span>Halaman Pembayaran QRIS Dinamis</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Buka halaman QR di bawah, lalu scan kode QR menggunakan aplikasi m-Banking (BCA, Mandiri, GoPay, Dana, dll).
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 h-9"
                    >
                      <a href={testData.paymentUrl} target="_blank" rel="noopener noreferrer">
                        <span>Buka QRIS Pembayaran Rp 1.000</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Check Status Button */}
                <Button
                  onClick={handleCheckStatus}
                  disabled={loadingCheck}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold h-9 gap-1.5 border-border/80"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCheck ? 'animate-spin' : ''}`} />
                  <span>{loadingCheck ? 'Memeriksa Gateway...' : 'Cek Status Pembayaran'}</span>
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
