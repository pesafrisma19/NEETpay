import React, { useState } from 'react';
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
import { Sparkles, ArrowRight, Store, Lock, CheckCircle2, MessageSquare } from 'lucide-react';

interface ProviderSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGoBizNative: () => void;
  onSelectGoBizDynamic: () => void;
  hasDynamicAccess?: boolean;
  userEmail?: string;
}

export const ProviderSelectModal: React.FC<ProviderSelectModalProps> = ({
  open,
  onOpenChange,
  onSelectGoBizNative,
  onSelectGoBizDynamic,
  hasDynamicAccess = false,
  userEmail = '',
}) => {
  const [lockedNoticeOpen, setLockedNoticeOpen] = useState(false);

  const waNumber = '6285220581369';
  const waText = encodeURIComponent(
    `Halo Admin NEETpay, saya ingin mengajukan aktivasi Add-on GoPay Merchant Dynamic (Rp 500.000) untuk akun saya.\n\nEmail Akun: ${userEmail || '-'}`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const handleDynamicClick = () => {
    if (!hasDynamicAccess) {
      setLockedNoticeOpen(true);
      return;
    }
    onSelectGoBizDynamic();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[540px] p-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-bold text-foreground">
              Pilih Jenis Akun Pembayaran
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pilih jenis integrasi akun merchant yang ingin Anda hubungkan ke NEETpay.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3.5 my-3">
            {/* Option 1: GoPay Merchant (Existing Native QRIS) */}
            <div
              onClick={onSelectGoBizNative}
              className="group relative flex flex-col p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        GoPay Merchant
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono uppercase bg-muted/50">
                        QRIS
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Integrasi QRIS toko dengan alokasi kode unik otomatis untuk rekonsiliasi mutasi.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
              </div>
            </div>

            {/* Option 2: GoPay Merchant Dynamic (New Dynamic QRIS) */}
            <div
              onClick={handleDynamicClick}
              className={`group relative flex flex-col p-4 rounded-xl border bg-card transition-all cursor-pointer shadow-xs ${
                hasDynamicAccess
                  ? 'border-primary/40 hover:border-primary hover:bg-primary/5'
                  : 'border-amber-500/40 hover:border-amber-500/70 hover:bg-amber-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${
                      hasDynamicAccess
                        ? 'bg-primary/15 border-primary/30 text-primary'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {hasDynamicAccess ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        GoPay Merchant Dynamic
                      </span>
                      {hasDynamicAccess ? (
                        <Badge variant="paid" className="text-[10px] font-mono uppercase font-bold">
                          QRIS Dinamis
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        >
                          Add-on Rp500.000 • Sekali bayar
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      QRIS dinamis nominal persis (tanpa kode unik). Pembayaran langsung masuk ke saldo toko Anda.
                    </p>
                  </div>
                </div>
                {hasDynamicAccess ? (
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500/70 mt-1 shrink-0" />
                )}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground text-center">
            Provider perbankan tambahan (seperti BCA Virtual Account) akan hadir pada rilis berikutnya.
          </div>
        </DialogContent>
      </Dialog>

      {/* Locked Add-on Activation Notice Dialog */}
      <Dialog open={lockedNoticeOpen} onOpenChange={setLockedNoticeOpen}>
        <DialogContent className="sm:max-w-[440px] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-base font-bold text-foreground">
              Aktivasi GoPay Merchant Dynamic
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              GoPay Merchant Dynamic adalah add-on eksklusif dengan biaya aktivasi Rp500.000 sekali bayar. Hubungi admin untuk aktivasi.
            </DialogDescription>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>QRIS Dinamis 100% nominal persis</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Gambar QRIS langsung siap kirim ke WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Akses permanen (tanpa biaya bulanan)</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLockedNoticeOpen(false)}
              className="text-xs h-9 px-4 sm:flex-1 order-2 sm:order-1"
            >
              Tutup
            </Button>
            <Button
              asChild
              size="sm"
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
    </>
  );
};
