import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Store,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface PublicPayData {
  reference: string;
  merchant_name: string;
  outlet_name: string;
  amount: number;
  fee_amount: number;
  total_amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | string;
  qris_url: string | null;
  created_at: string;
  expires_at: string;
  paid_at: string | null;
}

export const PublicPayPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [data, setData] = useState<PublicPayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'https://api.neetpay.web.id';

  const fetchPaymentDetails = useCallback(async (isSilent = false) => {
    if (!reference) return;
    if (!isSilent) setLoading(true);

    try {
      const res = await fetch(`${apiBase}/v1/pay/${reference}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Transaksi tidak ditemukan atau telah kedaluwarsa.');
      }

      setData(json.data);
      setErrorMsg(null);
    } catch (err: any) {
      if (!isSilent) {
        setErrorMsg(err.message || 'Gagal memuat halaman pembayaran.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [reference, apiBase]);

  // Initial Fetch
  useEffect(() => {
    fetchPaymentDetails(false);
  }, [fetchPaymentDetails]);

  // Dynamic Countdown Timer strictly based on backend expires_at
  useEffect(() => {
    if (!data || data.status !== 'PENDING') {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const targetTime = new Date(data.expires_at).getTime();
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        setIsExpiredLocally(true);
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [data]);

  // Polling every 3.5 seconds while PENDING
  useEffect(() => {
    if (!data || data.status !== 'PENDING' || isExpiredLocally) return;

    const interval = setInterval(() => {
      fetchPaymentDetails(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [data, isExpiredLocally, fetchPaymentDetails]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Disalin ke clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadQr = () => {
    if (!data?.qris_url) return;
    const a = document.createElement('a');
    a.href = data.qris_url;
    a.download = `QRIS-${data.reference}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Menyiapkan Pembayaran...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Menghubungkan ke gateway pembayaran NEETpay</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pembayaran Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{errorMsg}</p>
          <div className="pt-2">
            <button
              onClick={() => fetchPaymentDetails(false)}
              className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = data.status === 'PAID';
  const isExpired = data.status === 'EXPIRED' || (data.status === 'PENDING' && isExpiredLocally);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 py-8">
      {/* Brand Header */}
      <div className="mb-6 text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>NEETpay Secure Checkout</span>
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Merchant & Outlet Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.outlet_name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{data.merchant_name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Order ID</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{data.reference}</span>
            </div>
          </div>
        </div>

        {/* Status Content */}
        {isPaid ? (
          /* SUCCESS / PAID STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Pembayaran Berhasil!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terima kasih, tagihan Anda telah terverifikasi lunas secara otomatis.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Dibayar</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                  Rp {data.total_amount.toLocaleString('id-ID')}
                </span>
              </div>
              {data.paid_at && (
                <div className="flex justify-between border-t border-emerald-200/40 dark:border-emerald-800/20 pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Waktu Lunas</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {new Date(data.paid_at).toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-emerald-200/40 dark:border-emerald-800/20 pt-2">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                  LUNAS / SETTLED
                </span>
              </div>
            </div>
          </div>
        ) : isExpired ? (
          /* EXPIRED STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Waktu Pembayaran Habis</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Batas waktu pembayaran untuk transaksi ini telah kedaluwarsa. Silakan lakukan pemesanan ulang di toko.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-xs font-mono text-slate-500">
              ID Transaksi: {data.reference}
            </div>
          </div>
        ) : (
          /* PENDING PAYMENT STATE (QRIS DISPLAY) */
          <div className="p-6 space-y-5">
            {/* Amount Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Total Pembayaran
              </span>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                  Rp {data.total_amount.toLocaleString('id-ID')}
                </h1>
                <button
                  onClick={() => handleCopy(data.total_amount.toString(), 'amount')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Salin nominal"
                >
                  {copiedKey === 'amount' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Countdown Banner */}
            {timeLeft && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>
                  Selesaikan dalam:{' '}
                  <strong className="font-mono text-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </strong>
                </span>
              </div>
            )}

            {/* QRIS Image Container */}
            {data.qris_url && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-slate-100 flex items-center justify-center">
                  <img
                    src={data.qris_url}
                    alt={`QRIS ${data.reference}`}
                    className="w-56 h-56 object-contain"
                  />
                </div>

                <button
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan Gambar QR</span>
                </button>
              </div>
            )}

            {/* Instruction Accordion / Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Mendukung Semua Pembayaran</span>
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">QRIS Nasional</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center">
                Buka GoPay, BCA, Mandiri, Dana, OVO, ShopeePay, atau m-Banking apa saja, lalu scan kode QR di atas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Powered By */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1">
        <p>Diproses secara aman oleh <strong>NEETpay Gateway</strong></p>
      </div>
    </div>
  );
};
