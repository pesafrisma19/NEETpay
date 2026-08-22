import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Zap,
  QrCode,
  Smartphone,
  ShieldCheck,
  Code2,
  Webhook,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Store,
  Layers,
  Key,
  ExternalLink,
  Menu,
  X,
  Lock,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PublicActivityItem {
  amount: number;
  paymentMethod: string;
  paidAt: string;
}

interface PublicActivityResponse {
  activities: PublicActivityItem[];
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [checkoutDemoState, setCheckoutDemoState] = useState<'pending' | 'success'>('pending');
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch real-time public activity with 60s background polling
  const { data: activityData, isError } = useQuery<PublicActivityResponse>({
    queryKey: ['public-activity'],
    queryFn: async () => {
      const res = await apiClient<PublicActivityResponse>('/v1/public/activity');
      return res.data || { activities: [] };
    },
    refetchInterval: 60 * 1000,
    staleTime: 50 * 1000,
    retry: 1,
  });

  const activities = activityData?.activities || [];

  const handleCopySnippet = () => {
    const code = `curl -X POST https://api.neetpay.web.id/v1/transactions \\
  -H "X-API-KEY: np_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "INV-2026-001",
    "amount": 25000,
    "customerName": "Budi",
    "customerPhone": "081234567890"
  }'`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqItems = [
    {
      q: 'Apa itu NEETpay?',
      a: 'NEETpay adalah software gateway engine yang mengotomatisasi pembuatan QRIS Dinamis dan pembayaran GoPay untuk website, toko online, atau bot Anda, langsung terhubung dengan akun merchant resmi Anda.',
    },
    {
      q: 'Apakah dana masuk ke saldo NEETpay?',
      a: 'Tidak sama sekali. Pembayaran masuk langsung melalui akun merchant Anda. NEETpay mengotomatisasi pembuatan transaksi dan status pembayaran tanpa menyediakan saldo penampung pembayaran merchant.',
    },
    {
      q: 'Apakah saya harus punya akun merchant sendiri?',
      a: 'Ya. Anda memerlukan akun merchant resmi (seperti GoBiz / GoPay Merchant) yang sudah aktif. NEETpay bertindak sebagai layer otomasi teknologi yang menghubungkan akun merchant Anda ke toko online Anda.',
    },
    {
      q: 'Apa beda NEETpay dengan payment gateway biasa?',
      a: 'Payment gateway konvensional menampung uang penjualan Anda di rekening perantara mereka dan baru mencairkannya kemudian dengan mekanisme withdraw. Di NEETpay, dana pembeli masuk langsung ke akun merchant Anda tanpa saldo perantara.',
    },
    {
      q: 'Apakah QRIS-nya dinamis?',
      a: 'Ya. Setiap transaksi menghasilkan kode QR dengan nominal pembayaran yang sudah ditentukan otomatis, sehingga pembeli tidak perlu mengetik nominal manual dan proses checkout lebih cepat.',
    },
    {
      q: 'Apakah tersedia metode GoPay?',
      a: 'Ya. Pengguna mobile dapat membuka pembayaran GoPay langsung dari perangkat yang mendukung secara praktis.',
    },
    {
      q: 'Apakah tersedia REST API & Webhook?',
      a: 'Ya. Tersedia REST API untuk pembuatan transaksi dan webhook otomatis untuk menerima notifikasi pembayaran sukses di server Anda.',
    },
    {
      q: 'Bagaimana webhook diamankan?',
      a: 'Setiap notifikasi webhook dilengkapi tanda tangan HMAC-SHA256 untuk membantu merchant memverifikasi bahwa payload berasal dari NEETpay.',
    },
    {
      q: 'Apa yang terjadi jika webhook ke server saya gagal?',
      a: 'Pengiriman webhook yang gagal akan dicoba kembali secara otomatis sesuai mekanisme retry NEETpay.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-primary" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                NEETpay
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-muted-foreground">
              <a href="#activity" className="hover:text-foreground transition-colors">Aktivitas</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">Cara Kerja</a>
              <a href="#features" className="hover:text-foreground transition-colors">Fitur</a>
              <a href="#checkout" className="hover:text-foreground transition-colors">Checkout</a>
              <a href="#merchant" className="hover:text-foreground transition-colors">Koneksi Merchant</a>
              <a href="#developer" className="hover:text-foreground transition-colors">Developer</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Harga</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
              <Link to="/docs">
                <Code2 className="w-3.5 h-3.5 mr-1.5" />
                API Docs
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild className="text-xs font-bold shadow-xs">
              <Link to="/register">Mulai Gratis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground pb-3 border-b border-border/60">
              <a href="#activity" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Aktivitas</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Cara Kerja</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Fitur</a>
              <a href="#checkout" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Checkout</a>
              <a href="#merchant" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Koneksi Merchant</a>
              <a href="#developer" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Developer</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">Harga</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-foreground">FAQ</a>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outline" size="sm" asChild className="w-full justify-center text-xs">
                <Link to="/docs">Buka Dokumentasi API</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-center text-xs">
                <Link to="/login">Masuk ke Akun</Link>
              </Button>
              <Button size="sm" asChild className="w-full justify-center text-xs font-bold">
                <Link to="/register">Mulai Gratis</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/40 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Otomatisasi Pembayaran QRIS Dinamis & GoPay</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                  Pembayaran otomatis. Dana langsung melalui akun merchant Anda.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Terima pembayaran QRIS Dinamis dan GoPay melalui API NEETpay. Pantau status transaksi dan terima webhook otomatis tanpa membangun sistem pembayaran dari nol.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Button size="lg" asChild className="w-full sm:w-auto font-bold text-sm h-11 px-6 shadow-md shadow-primary/10">
                    <Link to="/register">
                      Mulai Gratis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto font-semibold text-sm h-11 px-6">
                    <Link to="/docs">
                      <Code2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      Lihat Dokumentasi
                    </Link>
                  </Button>
                </div>

                {/* Trust Micro-Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Dana Melalui Akun Merchant Anda</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Paket Free 30 Trx/Bln</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive Real Preview Mockup */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border-2 border-border/80 bg-card p-5 shadow-xl space-y-4 max-w-md mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-bold text-foreground">NEETpay Hosted Checkout</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">TRX-DEMO-01</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted-foreground">Total Tagihan</span>
                      <p className="text-xl font-mono font-black text-foreground">Rp 25.000</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                      Terkunci Otomatis
                    </span>
                  </div>

                  {checkoutDemoState === 'pending' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>Menunggu pembayaran: <strong className="font-mono">04:32</strong></span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#00AA13] text-white flex items-center justify-center gap-2 font-bold text-xs shadow-xs">
                        <Smartphone className="w-4 h-4" />
                        <span>Lanjutkan dengan GoPay</span>
                      </div>

                      <div className="p-3 rounded-xl border border-border bg-background/50 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">Bayar via QRIS</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">Aplikasi yang mendukung</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCheckoutDemoState('success')}
                        className="w-full text-xs text-muted-foreground hover:text-foreground pt-1"
                      >
                        [ Simulasikan Pembayaran Berhasil ]
                      </Button>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Pembayaran Berhasil</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Status transaksi terverifikasi dan webhook berhasil dikirim ke sistem merchant.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCheckoutDemoState('pending')}
                        className="text-xs"
                      >
                        Reset Simulasi
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LIVE TRANSACTION ACTIVITY (REAL SOCIAL PROOF) */}
        <section id="activity" className="py-10 border-b border-border/60 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Aktivitas Pembayaran</h3>
                <p className="text-xs text-muted-foreground">
                  Pembayaran terbaru yang berhasil diproses melalui NEETpay. Informasi pelanggan dan merchant tidak ditampilkan.
                </p>
              </div>

              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3 text-muted-foreground" />
                Data transaksi aktual yang berstatus PAID
              </span>
            </div>

            {/* Activities List */}
            {isError || activities.length === 0 ? (
              <div className="p-6 rounded-2xl border border-border/60 bg-card text-center text-xs text-muted-foreground">
                <p>Belum ada aktivitas transaksi baru dalam jendela pantau saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {activities.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex items-center justify-between gap-2 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-foreground truncate">
                          Rp {act.amount.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {act.paymentMethod} · Berhasil
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono">
                      {formatRelativeTime(act.paidAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. CORE VALUE / WHY NEETPAY */}
        <section id="features" className="py-16 md:py-24 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Keunggulan</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Dirancang untuk Kebutuhan Pembayaran Merchant
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                NEETpay mengotomatisasi pembuatan transaksi dan status pembayaran tanpa menyediakan saldo penampung pembayaran merchant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <Card className="border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">QRIS Dinamis</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Buat pembayaran dengan nominal transaksi yang sudah ditentukan dan tampilkan QR langsung pada checkout. Dapat dibayar menggunakan aplikasi pembayaran yang mendukung QRIS.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">GoPay yang Lebih Praktis</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pengguna mobile dapat membuka pembayaran GoPay langsung dari perangkat yang mendukung secara instan.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Dana Melalui Akun Merchant</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pembayaran masuk langsung melalui akun merchant yang Anda hubungkan tanpa saldo penampung pada NEETpay.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-border/80 bg-card shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Webhook className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Status Pembayaran Otomatis</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sistem mendeteksi status pembayaran secara otomatis dan mengirimkan webhook ke sistem merchant Anda.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Alur Integrasi</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Cara Kerja NEETpay dalam 3 Langkah
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Mulai menerima pembayaran otomatis dengan alur integrasi yang jelas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-base text-foreground">Hubungkan Akun Merchant</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hubungkan akun provider GoBiz / GoPay Merchant yang Anda miliki. Kredensial disimpan dalam format terenkripsi AES-256-GCM.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-base text-foreground">Buat Transaksi via API</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gunakan API Key untuk membuat transaksi tagihan dari toko online, bot, atau aplikasi bisnis Anda.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-base text-foreground">Terima Pembayaran & Webhook</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Customer membayar → dana masuk langsung ke merchant → sistem Anda menerima notifikasi webhook status pembayaran.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PAYMENT METHODS & 7. CONNECT YOUR MERCHANT ACCOUNT */}
        <section id="merchant" className="py-16 md:py-24 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Merchant Connection Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="outline" className="text-xs font-semibold">Koneksi Merchant</Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Gunakan Akun Merchant Anda Sendiri
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Hubungkan akun pembayaran yang didukung, lalu gunakan NEETpay sebagai layer otomasi untuk membuat transaksi, memantau pembayaran, dan mengirim webhook ke sistem Anda.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>QRIS:</strong> QRIS dapat dibayar dari aplikasi pembayaran yang mendukung jaringan QRIS.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>GoPay:</strong> Pembayaran langsung melalui GoPay yang tersedia pada koneksi merchant.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Dana Langsung:</strong> Pembayaran masuk melalui akun merchant yang Anda hubungkan.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Connection Card Mockup */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border-2 border-border/80 bg-card p-6 shadow-lg space-y-5 max-w-md mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">GoBiz</h4>
                        <span className="text-[11px] text-muted-foreground font-mono">Akun Pembayaran</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground">QRIS</span>
                      <span className="font-semibold text-emerald-500">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40">
                      <span className="text-muted-foreground">GoPay</span>
                      <span className="font-semibold text-emerald-500">Active</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      Kredensial disimpan terenkripsi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CHECKOUT SHOWCASE */}
        <section id="checkout" className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Tampilan Checkout</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Pengalaman Pembayaran yang Bersih & Cepat
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Halaman pembayaran hosted NEETpay yang responsif untuk pelanggan mobile maupun desktop.
              </p>
            </div>

            {/* Browser Frame */}
            <div className="max-w-2xl mx-auto rounded-2xl border-2 border-border/80 bg-card overflow-hidden shadow-2xl">
              {/* Browser Top Bar */}
              <div className="px-4 py-3 bg-muted/60 border-b border-border/60 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 px-3 py-1 rounded-md bg-background/80 border border-border/60 text-[11px] font-mono text-muted-foreground truncate text-center">
                  🔒 https://neetpay.web.id/pay/TRX-1787318509508
                </div>
              </div>

              {/* Browser Content */}
              <div className="p-6 md:p-8 space-y-6 max-w-md mx-auto">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-foreground">Checkout Merchant</span>
                  <p className="text-[11px] font-mono text-muted-foreground">Order Ref: TRX-1787318509508</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Total Tagihan</span>
                    <p className="text-2xl font-mono font-black text-foreground">Rp 25.000</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary font-mono">Nominal Pas</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#00AA13] text-white flex items-center justify-center gap-2 font-bold text-xs shadow-md">
                    <Smartphone className="w-4 h-4" />
                    <span>Lanjutkan dengan GoPay</span>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-muted-foreground">Atau</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <div className="p-4 rounded-xl border border-border/80 bg-card text-center space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-primary" />
                        <span>Bayar via QRIS</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">Semua m-Banking</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block">
                      <div className="w-32 h-32 bg-slate-900/5 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                        <QrCode className="w-20 h-20 text-slate-800" />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Scan menggunakan aplikasi yang mendukung QRIS.</p>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] text-muted-foreground border-t border-border/40">
                  Diproses melalui NEETpay Gateway
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. DEVELOPER / API & 10. WEBHOOK SECTION */}
        <section id="developer" className="py-16 md:py-24 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Integrasi Developer</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                REST API & Webhook dengan Signature
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Integrasikan transaksi dalam beberapa baris kode menggunakan API Key standar dan terima notifikasi webhook otomatis.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: cURL Snippet */}
              <div className="lg:col-span-7 rounded-2xl border-2 border-border/80 bg-card overflow-hidden shadow-lg">
                <div className="px-4 py-3 bg-muted/60 border-b border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground font-mono">POST /v1/transactions</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopySnippet} className="h-7 px-2 text-[11px]">
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedCode ? 'Tersalin' : 'Salin'}
                  </Button>
                </div>

                <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{`curl -X POST https://api.neetpay.web.id/v1/transactions \\
  -H "X-API-KEY: np_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "INV-2026-001",
    "amount": 25000,
    "customerName": "Budi",
    "customerPhone": "081234567890"
  }'`}</pre>
                </div>

                <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Dokumentasi interaktif OpenAPI & SDK</span>
                  <Button size="sm" variant="outline" asChild className="text-xs font-bold w-full sm:w-auto">
                    <Link to="/docs">
                      Buka Dokumentasi API
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: Webhook Delivery Showcase */}
              <div className="lg:col-span-5 rounded-2xl border-2 border-border/80 bg-card p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                  <Webhook className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">Webhook Notifikasi</h4>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">transaction.paid</Badge>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Delivered
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    NEETpay ───→ https://merchant.example/webhook
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Webhook dengan signature:</strong> Setiap webhook dapat diverifikasi menggunakan HMAC-SHA256.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span><strong>Retry otomatis saat pengiriman webhook gagal:</strong> Pengiriman webhook yang gagal akan dicoba kembali sesuai mekanisme retry NEETpay.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. SECURITY & RELIABILITY */}
        <section className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Keamanan & Reliabilitas</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Mekanisme Keamanan Nyata
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Setiap layer arsitektur NEETpay dibangun dengan mekanisme keamanan dan validasi yang jelas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">API Key Authentication</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Request API transaksi dilindungi dengan API credential merchant.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Signed Webhook</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Webhook dilengkapi HMAC-SHA256 untuk membantu merchant memverifikasi payload.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">AES-256-GCM</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Credential provider merchant disimpan menggunakan enkripsi AES-256-GCM.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-foreground">QR Proxy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gambar QRIS di-proxy oleh server NEETpay tanpa redirect eksternal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 12. PRICING */}
        <section id="pricing" className="py-16 md:py-24 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Pilihan Paket</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Harga Transparan
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pilih paket yang sesuai dengan kebutuhan transaksi Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free Plan */}
              <div className="p-8 rounded-2xl border-2 border-border/80 bg-card flex flex-col justify-between space-y-6 shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground">Free</h3>
                    <p className="text-xs text-muted-foreground">Untuk evaluasi dan penggunaan awal.</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-foreground">Rp 0</span>
                    <span className="text-xs text-muted-foreground">/ bulan</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>1 Akun Pembayaran</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Kuota 30 Transaksi / Bulan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Akses REST API</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Webhook Notifikasi</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="lg" asChild className="w-full font-bold text-xs">
                  <Link to="/register">Mulai Gratis</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-2xl border-2 border-primary bg-card flex flex-col justify-between space-y-6 shadow-xl relative">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider">
                  Pro
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground">Pro</h3>
                    <p className="text-xs text-muted-foreground">Untuk penggunaan aktif sesuai kebijakan Pro.</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-foreground">Rp 20.000</span>
                    <span className="text-xs text-muted-foreground">/ bulan</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span><strong>Hingga 3 Akun Pembayaran</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span><strong>Penggunaan sesuai kebijakan Pro (Unlimited Limit)</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Akses REST API & Webhook</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Fitur Fee Rule (Markup Biaya)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Prioritas Fitur Pro</span>
                    </div>
                  </div>
                </div>

                <Button size="lg" asChild className="w-full font-bold text-xs shadow-md">
                  <Link to="/register">Daftar & Upgrade ke Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 13. FAQ */}
        <section id="faq" className="py-16 md:py-24 border-b border-border/60 bg-muted/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <Badge variant="outline" className="text-xs font-semibold">Tanya Jawab</Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Penjelasan mengenai cara kerja dan model pembayaran NEETpay.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-foreground hover:bg-muted/30 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  {activeFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14. FINAL CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-primary/[0.04]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 fill-primary" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Mulai otomatisasi pembayaran Anda
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Hubungkan akun merchant, integrasikan API, dan biarkan NEETpay menangani status pembayaran serta webhook secara otomatis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button size="lg" asChild className="w-full sm:w-auto font-bold text-xs h-11 px-6 shadow-md shadow-primary/10">
                <Link to="/register">
                  Mulai Gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto font-semibold text-xs h-11 px-6">
                <Link to="/docs">
                  <Code2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  Buka Dokumentasi
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 15. FOOTER */}
      <footer className="border-t border-border/60 bg-muted/20 py-8 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-3 h-3 fill-primary" />
            </div>
            <span className="font-bold text-foreground">NEETpay</span>
            <span>· Payment Gateway Automation</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a href="#features" className="hover:text-foreground">Fitur</a>
            <a href="#pricing" className="hover:text-foreground">Harga</a>
            <Link to="/docs" className="hover:text-foreground">Dokumentasi</Link>
            <Link to="/login" className="hover:text-foreground">Masuk</Link>
            <Link to="/register" className="hover:text-foreground">Daftar</Link>
          </div>

          <div className="text-[11px]">
            © {new Date().getFullYear()} NEETpay. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
