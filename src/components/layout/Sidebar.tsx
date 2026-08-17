import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  QrCode,
  KeyRound,
  Webhook,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onNavClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { to: '/dashboard/payment-accounts', label: 'Payment Accounts', icon: QrCode },
    { to: '/dashboard/api-key', label: 'API Key', icon: KeyRound },
    { to: '/dashboard/webhook', label: 'Webhook', icon: Webhook },
    { to: '/dashboard/plan', label: 'Plan & Usage', icon: Sparkles },
  ];

  const planCode = user?.subscription?.plan?.code || 'FREE';

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border/80 text-foreground w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-extrabold text-base tracking-tight">NEETpay</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Gateway V1</span>
          </div>
        </NavLink>
        <Badge variant={planCode === 'PRO' ? 'default' : 'outline'} className="text-[10px] font-semibold uppercase px-2 py-0.5">
          {planCode}
        </Badge>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-border/60 space-y-1.5 bg-muted/20">
        <NavLink
          to="/dashboard/profile"
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors group',
              isActive ? 'bg-muted text-foreground' : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
            )
          }
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'Merchant User'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'merchant@example.com'}</p>
          </div>
          <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
        </NavLink>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2.5 px-3 py-2 h-9 rounded-lg"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar (Logout)</span>
        </Button>
      </div>
    </aside>
  );
};
