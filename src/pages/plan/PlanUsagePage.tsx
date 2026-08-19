import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Zap,
  QrCode,
  Webhook,
  Check,
  MessageSquare,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface UsageOverviewData {
  plan: {
    code: string;
    name: string;
    priceMonthly: number;
    monthlyTransactionLimit: number | null;
    paymentAccountLimit: number;
    isUnlimited: boolean;
  };
  usage: {
    usedThisMonth: number;
    limit: number | null;
    isUnlimited: boolean;
    percentage: number;
    periodStart: string;
    periodEnd: string;
  };
  paymentAccounts: {
    connectedCount: number;
    limit: number;
  };
}

export const PlanUsagePage: React.FC = () => {
  const { user } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const waNumber = '6285220581369';
  const waText = encodeURIComponent(
    `Halo Admin NEETpay, saya ingin upgrade akun saya ke Paket PRO (Rp 20.000 / bulan).\n\nEmail Akun: ${user?.email || '-'}`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const res = await apiClient<UsageOverviewData>('/api/dashboard/overview');
      return res.data!;
    },
    staleTime: 1000 * 30,
  });

  const plan = data?.plan || {
    code: 'FREE',
    name: 'Free Plan',
    priceMonthly: 0,
    monthlyTransactionLimit: 30,
    paymentAccountLimit: 1,
    isUnlimited: false,
  };

  const usage = data?.usage || {
    usedThisMonth: 0,
    limit: 30,
    isUnlimited: false,
    percentage: 0,
    periodStart: new Date().toISOString(),
    periodEnd: new Date().toISOString(),
  };

  const isPro = plan.code === 'PRO';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Plan & Usage</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau kuota transaksi bulanan dan kelola paket langganan NeetPay Anda.
          </p>
        </div>
      </div>

      {/* Current Month Usage Progress Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Penggunaan Kuota Transaksi Periode Ini
              </CardTitle>
            </div>
            <Badge variant={isPro ? 'default' : 'outline'} className="text-[10px] font-bold">
              {plan.name}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Periode aktif: {new Date(usage.periodStart).toLocaleDateString('id-ID')} -{' '}
            {new Date(usage.periodEnd).toLocaleDateString('id-ID')}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg bg-muted/60" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-foreground">
                    {usage.usedThisMonth}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {usage.isUnlimited ? 'transaksi dibuat (Unlimited)' : `/ ${usage.limit} transaksi per bulan`}
                  </span>
                </div>
                {!usage.isUnlimited && (
                  <span className="text-xs font-mono font-bold text-primary">
                    {usage.percentage}% Terpakai
                  </span>
                )}
              </div>

              {!usage.isUnlimited && (
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      usage.percentage >= 90 ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, usage.percentage)}%` }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Akun GoBiz Terhubung: <strong>{data?.paymentAccounts.connectedCount || 0} / {plan.paymentAccountLimit}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Webhook className="w-3.5 h-3.5 text-primary" />
                  <span>Notifikasi Webhook: <strong>Termasuk (Aktif)</strong></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* FREE PLAN */}
        <Card className={`border-border/80 bg-card shadow-xs relative flex flex-col justify-between ${!isPro ? 'ring-2 ring-primary/30' : ''}`}>
          {!isPro && (
            <div className="absolute -top-3 left-5">
              <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold">
                Paket Aktif Saat Ini
              </Badge>
            </div>
          )}
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-foreground">Free Plan</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Cocok untuk merchant pemula dan validasi sistem toko online.
            </CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-extrabold text-foreground">Rp 0</span>
              <span className="text-xs text-muted-foreground ml-1">/ bulan</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>30 Transaksi</strong> per bulan</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>1 Akun GoBiz</strong> terhubung</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Direct settlement tanpa perantara</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Automatic Unique Code verification</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Merchant Webhook real-time</span>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!isPro}
              className="w-full text-xs font-semibold"
            >
              {!isPro ? 'Sedang Digunakan' : 'Downgrade ke Free'}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO PLAN */}
        <Card className={`border-primary/40 bg-card shadow-sm relative flex flex-col justify-between ${isPro ? 'ring-2 ring-primary' : ''}`}>
          <div className="absolute -top-3 left-5">
            <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold bg-primary text-primary-foreground">
              {isPro ? 'Paket Aktif Saat Ini' : 'Rekomendasi Skala Usaha'}
            </Badge>
          </div>

          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-foreground">Pro Merchant Plan</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Untuk bisnis dengan volume transaksi rutin tanpa batasan kuota.
            </CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-extrabold text-foreground">Rp 20.000</span>
              <span className="text-xs text-muted-foreground ml-1">/ bulan</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-primary font-bold shrink-0" />
              <span><strong>Unlimited Transaksi</strong> (Tanpa Batasan Kuota)</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-primary font-bold shrink-0" />
              <span>Hingga <strong>3 Akun GoBiz</strong> multi-outlet</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-primary font-bold shrink-0" />
              <span>Direct settlement tanpa perantara 0% gateway fee</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-primary font-bold shrink-0" />
              <span>High-frequency polling reconciliation</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Check className="w-4 h-4 text-primary font-bold shrink-0" />
              <span>Priority merchant webhook dispatcher</span>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-2">
            <Button
              size="sm"
              onClick={() => setUpgradeModalOpen(true)}
              disabled={isPro}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isPro ? 'Paket Aktif' : 'Upgrade ke PRO (Rp 20.000 / bln)'}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Zap className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">Upgrade ke NeetPay PRO</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Dapatkan kuota transaksi tanpa batas (Unlimited) dan hubungkan hingga 3 akun GoBiz hanya dengan Rp 20.000 per bulan.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-2">
            <p className="font-semibold text-foreground">Pembayaran Otomatis QRIS Segera Hadir</p>
            <p className="text-muted-foreground leading-relaxed">
              Integrasi pembayaran otomatis billing PRO sedang dalam tahap finalisasi rilis. Hubungi tim support untuk upgrade instan akun Anda.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setUpgradeModalOpen(false)}
              className="text-xs h-9 px-4 sm:flex-1 order-2 sm:order-1"
            >
              Tutup
            </Button>
            <Button
              asChild
              className="text-xs h-9 px-4 sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 order-1 sm:order-2"
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Hubungi Admin (WhatsApp)</span>
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
