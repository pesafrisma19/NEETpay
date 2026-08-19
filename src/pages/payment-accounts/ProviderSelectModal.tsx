import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Store } from 'lucide-react';

interface ProviderSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGoBizNative: () => void;
  onSelectGoBizDynamic: () => void;
}

export const ProviderSelectModal: React.FC<ProviderSelectModalProps> = ({
  open,
  onOpenChange,
  onSelectGoBizNative,
  onSelectGoBizDynamic,
}) => {
  return (
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
            onClick={onSelectGoBizDynamic}
            className="group relative flex flex-col p-4 rounded-xl border border-primary/40 bg-card hover:border-primary hover:bg-primary/5 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      GoPay Merchant Dynamic
                    </span>
                    <Badge variant="paid" className="text-[10px] font-mono uppercase font-bold">
                      QRIS Dinamis
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    QRIS dinamis nominal persis (tanpa kode unik). Pembayaran langsung masuk ke saldo toko Anda.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground text-center">
          Provider perbankan tambahan (seperti BCA Virtual Account) akan hadir pada rilis berikutnya.
        </div>
      </DialogContent>
    </Dialog>
  );
};
