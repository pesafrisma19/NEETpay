import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Sparkles,
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

interface ConnectGoPayDynamicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const otpPhoneSchema = z.object({
  phoneNumber: z.string().min(9, 'Nomor HP merchant minimal 9 digit').max(15, 'Nomor HP terlalu panjang'),
});

const otpVerifySchema = z.object({
  otp: z.string().length(4, 'OTP terdiri dari 4 digit angka'),
});

const passwordSchema = z.object({
  email: z.string().email('Format email merchant tidak valid'),
  password: z.string().min(1, 'Password merchant harus diisi'),
  accountName: z.string().optional(),
});

export const ConnectGoPayDynamicModal: React.FC<ConnectGoPayDynamicModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [otpToken, setOtpToken] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

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

  // Connect via Password
  const onConnectPassword = async (data: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    try {
      await apiClient('/api/payment-accounts/gobiz-dynamic/connect-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Akun GoPay Merchant Dynamic berhasil terhubung!');
      onOpenChange(false);
      resetPassword();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghubungkan akun GoPay Merchant Dynamic.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP
  const onRequestOtp = async (data: { phoneNumber: string }) => {
    setLoading(true);
    try {
      const res = await apiClient<{ otpToken: string; uniqueId: string; expiresInSeconds: number }>(
        '/api/payment-accounts/gobiz-dynamic/request-otp',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (res.data) {
        setOtpToken(res.data.otpToken);
        setUniqueId(res.data.uniqueId);
        setOtpStep('verify');
        toast.info('Kode OTP 4 digit telah dikirim melalui SMS.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim OTP ke nomor tersebut.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (data: { otp: string }) => {
    setLoading(true);
    try {
      await apiClient('/api/payment-accounts/gobiz-dynamic/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          otpToken,
          otp: data.otp,
          uniqueId,
        }),
      });

      toast.success('Akun GoPay Merchant Dynamic berhasil terhubung via OTP!');
      onOpenChange(false);
      setOtpStep('phone');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Kode OTP salah atau telah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Hubungkan GoPay Merchant Dynamic
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Menerbitkan QRIS dinamis dengan nominal persis langsung ke akun merchant Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'password' | 'otp')} className="mt-2">
          <TabsList className="grid grid-cols-2 w-full h-9">
            <TabsTrigger value="password" className="text-xs font-semibold gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </TabsTrigger>
            <TabsTrigger value="otp" className="text-xs font-semibold gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>SMS OTP</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Password Login */}
          <TabsContent value="password" className="space-y-4 pt-3">
            <form onSubmit={handlePasswordSubmit(onConnectPassword)} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Akun Merchant</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    {...registerPassword('email')}
                    type="email"
                    placeholder="nama@email.com"
                    className="text-xs pl-9 h-9"
                    disabled={loading}
                  />
                </div>
                {passwordErrors.email && (
                  <p className="text-[11px] text-destructive">{passwordErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    {...registerPassword('password')}
                    type="password"
                    placeholder="••••••••"
                    className="text-xs pl-9 h-9"
                    disabled={loading}
                  />
                </div>
                {passwordErrors.password && (
                  <p className="text-[11px] text-destructive">{passwordErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Nama Tampilan Channel <span className="text-muted-foreground font-normal">(Opsional)</span>
                </Label>
                <Input
                  {...registerPassword('accountName')}
                  placeholder="Contoh: Kasir Toko Online"
                  className="text-xs h-9"
                  disabled={loading}
                />
              </div>

              <Alert className="py-2 px-3 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <AlertTitle className="text-xs font-semibold ml-1">Kredensial Aman Terenkripsi</AlertTitle>
                <AlertDescription className="text-[11px] text-muted-foreground ml-1">
                  Kredensial disimpan secara terenkripsi AES-256-GCM dan hanya digunakan untuk menerbitkan QR dinamis.
                </AlertDescription>
              </Alert>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="text-xs h-9"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold h-9 gap-1.5">
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghubungkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Hubungkan Akun</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB 2: SMS OTP */}
          <TabsContent value="otp" className="space-y-4 pt-3">
            {otpStep === 'phone' ? (
              <form onSubmit={handlePhoneSubmit(onRequestOtp)} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nomor Handphone Terdaftar</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      {...registerPhone('phoneNumber')}
                      type="tel"
                      placeholder="081234567890 atau +62812..."
                      className="text-xs pl-9 h-9 font-mono"
                      disabled={loading}
                    />
                  </div>
                  {phoneErrors.phoneNumber && (
                    <p className="text-[11px] text-destructive">{phoneErrors.phoneNumber.message}</p>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className="text-xs h-9"
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold h-9 gap-1.5">
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Kode OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit(onVerifyOtp)} className="space-y-3.5">
                <div className="space-y-1.5 text-center">
                  <Label className="text-xs font-semibold">Masukkan 4 Digit Kode OTP SMS</Label>
                  <div className="relative max-w-[180px] mx-auto">
                    <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      {...registerVerify('otp')}
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      className="text-center font-mono tracking-widest text-lg font-bold pl-8 h-10"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {verifyErrors.otp && (
                    <p className="text-[11px] text-destructive">{verifyErrors.otp.message}</p>
                  )}
                </div>

                <DialogFooter className="pt-2 flex justify-between sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOtpStep('phone')}
                    disabled={loading}
                    className="text-xs h-9"
                  >
                    Ubah Nomor HP
                  </Button>
                  <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold h-9 gap-1.5">
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifikasi & Hubungkan</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
