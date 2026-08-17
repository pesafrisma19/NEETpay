import React from 'react';
import { User, Mail, ShieldCheck, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const planCode = user.subscription?.plan?.code || 'FREE';
  const planName = user.subscription?.plan?.name || 'Free Plan';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Profil Akun Merchant</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Informasi identitas merchant, role akses, dan sesi autentikasi Anda.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-foreground">{user.name}</CardTitle>
                <Badge variant={planCode === 'PRO' ? 'default' : 'outline'} className="text-[10px] uppercase font-bold">
                  {planName}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Nama Lengkap / Bisnis</span>
              </span>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Email Terdaftar</span>
              </span>
              <p className="text-sm font-semibold text-foreground">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Role Akses</span>
              </span>
              <div className="pt-0.5">
                <Badge variant="outline" className="text-[11px] font-mono font-bold">
                  {user.role} (Merchant User)
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Tanggal Terdaftar</span>
              </span>
              <p className="text-sm font-mono text-foreground font-semibold">
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Session Security Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Sesi & Keamanan Autentikasi</h4>
            <p className="text-muted-foreground leading-relaxed">
              Autentikasi dashboard diamankan dengan <code>HttpOnly Session Cookie</code> terenkripsi dengan masa berlaku 7 hari. Token sesi tidak dapat diakses melalui skrip frontend.
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-2 border-t border-border/60 justify-between">
          <span className="text-[11px] text-muted-foreground">
            Status Akun: <strong className="text-emerald-600 dark:text-emerald-400">{user.status}</strong>
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => logout()}
            className="text-xs font-semibold gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun (Logout)</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
