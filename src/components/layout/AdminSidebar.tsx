import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  QrCode,
  AlertTriangle,
  Activity,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  onNavClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavClick }) => {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
    { to: '/admin/payment-accounts', label: 'Payment Accounts', icon: QrCode },
    { to: '/admin/webhooks', label: 'Webhook Failures', icon: AlertTriangle },
    { to: '/admin/health', label: 'System / Worker Health', icon: Activity },
  ];

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border/80 text-foreground w-64 select-none">
      {/* Admin Brand Header */}
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <NavLink to="/admin/overview" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 shadow-sm">
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-foreground font-extrabold text-base tracking-tight">NEETpay</span>
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-0.5">Admin Operator</span>
          </div>
        </NavLink>
        <Badge variant="destructive" className="text-[10px] font-semibold uppercase px-2 py-0.5">
          ADMIN
        </Badge>
      </div>

      {/* Admin Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Platform Management
        </div>
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Admin Footer & Back to User Dashboard */}
      <div className="p-3 border-t border-border/60 space-y-1.5 bg-muted/20">
        <NavLink
          to="/dashboard"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>Ke User Dashboard</span>
        </NavLink>

        <div className="flex items-center gap-3 p-2.5 rounded-lg text-sm bg-muted/40 text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 font-bold shrink-0 text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@neetpay.web.id'}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </Button>
      </div>
    </aside>
  );
};
