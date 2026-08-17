import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  QrCode,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ConnectGoBizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const otpPhoneSchema = z.object({
  phoneNumber: z.string().min(9, 'Nomor HP GoBiz minimal 9 digit').max(15, 'Nomor HP terlalu panjang'),
});

const otpVerifySchema = z.object({
  otp: z.string().length(4, 'OTP GoBiz terdiri dari 4 digit angka'),
});

const passwordSchema = z.object({
  email: z.string().email('Format email GoBiz tidak valid'),
  password: z.string().min(1, 'Password GoBiz harus diisi'),
  accountName: z.string().optional(),
});

export const ConnectGoBizModal: React.FC<ConnectGoBizModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'otp' | 'password'>('otp');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [otpToken, setOtpToken] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Form 1: Phone
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<{ phoneNumber: string }>({
    resolver: zodResolver(otpPhoneSchema),
  });

  // OTP Form 2: Verify
  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
  } = useForm<{ otp: string }>({
    resolver: zodResolver(otpVerifySchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  // Step 1: Request OTP
  const onRequestOtp = async (data: { phoneNumber: string }) => {
    setLoading(true);
    try {
      const res = await apiClient<{ otpToken: string; uniqueId: string; expiresInSeconds: number }>(
        '/api/payment-accounts/gobiz/request-otp',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      setOtpToken(res.data!.otpToken);
      setUniqueId(res.data!.uniqueId);
      setOtpStep('verify');
      toast.success('Kode OTP telah dikirimkan via SMS oleh GoBiz.');
    } catch (err: any) {
      toast.error(err.message || 'Gagal meminta OTP GoBiz');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (data: { otp: string }) => {
    setLoading(true);
    try {
      await apiClient('/api/payment-accounts/gobiz/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          otpToken,
          otp: data.otp,
          uniqueId,
        }),
      });

      toast.success('Akun GoBiz berhasil terhubung via OTP!');
      onSuccess();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error(err.message || 'Verifikasi OTP gagal. Periksa kembali 4 digit kode Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Connect Password
  const onConnectPassword = async (data: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    try {
      await apiClient('/api/payment-accounts/gobiz/connect-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Akun GoBiz berhasil terhubung via kredensial!');
      onSuccess();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error(err.message || 'Gagal login ke GoBiz. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setOtpStep('phone');
    setOtpToken('');
    setUniqueId('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetState();
      }}
    >
      <DialogContent className="sm:max-w-lg bg-card text-foreground border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold">Hubungkan Akun GoBiz</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Pilih metode autentikasi GoBiz untuk mengaktifkan direct settlement QRIS ke rekening Anda.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 h-9 bg-muted/60 mb-4">
            <TabsTrigger value="otp" className="text-xs font-semibold">
              SMS OTP (Nomor HP)
            </TabsTrigger>
            <TabsTrigger value="password" className="text-xs font-semibold">
              Email & Password
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: OTP Flow */}
          <TabsContent value="otp" className="space-y-4">
            {otpStep === 'phone' ? (
              <form onSubmit={handlePhoneSubmit(onRequestOtp)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Nomor Handphone Terdaftar di GoBiz
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="phone"
                      placeholder="Contoh: 08123456789 atau +628123456789"
                      className="pl-9 text-xs"
                      disabled={loading}
                      {...registerPhone('phoneNumber')}
                    />
                  </div>
                  {phoneErrors.phoneNumber && (
                    <p className="text-xs text-destructive">{phoneErrors.phoneNumber.message}</p>
                  )}
                </div>

                <Alert className="border-border/60 bg-muted/30">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-xs font-semibold">One-Time Password (OTP)</AlertTitle>
                  <AlertDescription className="text-[11px] text-muted-foreground">
                    GoBiz akan mengirimkan 4 digit SMS ke nomor HP Anda. Kode OTP hanya digunakan sekali saat verifikasi.
                  </AlertDescription>
                </Alert>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full text-xs font-semibold gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>Kirim Kode OTP</span>
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit(onVerifyOtp)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs font-semibold">
                    Masukkan 4 Digit Kode OTP
                  </Label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="otp"
                      placeholder="Contoh: 1234"
                      maxLength={4}
                      className="pl-9 text-sm font-mono tracking-widest text-center font-bold"
                      disabled={loading}
                      {...registerVerify('otp')}
                    />
                  </div>
                  {verifyErrors.otp && (
                    <p className="text-xs text-destructive">{verifyErrors.otp.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOtpStep('phone')}
                    className="text-xs text-muted-foreground"
                    disabled={loading}
                  >
                    Ganti Nomor HP
                  </Button>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full text-xs font-semibold gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Verifikasi & Hubungkan GoBiz</span>
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>

          {/* Tab 2: Password Flow */}
          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordSubmit(onConnectPassword)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gobiz-email" className="text-xs font-semibold">
                  Email Akun GoBiz
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="gobiz-email"
                    type="email"
                    placeholder="namaoutlet@gmail.com"
                    className="pl-9 text-xs"
                    disabled={loading}
                    {...registerPassword('email')}
                  />
                </div>
                {passwordErrors.email && (
                  <p className="text-xs text-destructive">{passwordErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gobiz-pass" className="text-xs font-semibold">
                  Password GoBiz
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="gobiz-pass"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    disabled={loading}
                    {...registerPassword('password')}
                  />
                </div>
                {passwordErrors.password && (
                  <p className="text-xs text-destructive">{passwordErrors.password.message}</p>
                )}
              </div>

              {/* Mandatory Disclosure */}
              <Alert className="border-border/60 bg-muted/30">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-semibold">Transparansi Keamanan Enkripsi</AlertTitle>
                <AlertDescription className="text-[11px] text-muted-foreground leading-relaxed">
                  Password GoBiz disimpan dalam bentuk terenkripsi AES-256 dan hanya digunakan untuk menghubungkan ulang akun GoBiz secara otomatis jika sesi tidak dapat diperpanjang.
                </AlertDescription>
              </Alert>

              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full text-xs font-semibold gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Hubungkan Akun GoBiz</span>
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
