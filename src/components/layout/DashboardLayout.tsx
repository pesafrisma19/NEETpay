import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/dashboard/transactions/')) return 'Transaction Detail';
    if (pathname === '/dashboard/transactions') return 'Transactions';
    if (pathname.startsWith('/dashboard/payment-accounts/')) return 'Payment Account Detail';
    if (pathname === '/dashboard/payment-accounts') return 'Payment Accounts';
    if (pathname === '/dashboard/api-key') return 'API Key';
    if (pathname === '/dashboard/webhook') return 'Webhook Configuration';
    if (pathname === '/dashboard/plan') return 'Plan & Usage';
    if (pathname === '/dashboard/profile') return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border">
          <Sidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka Menu</span>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 border border-border/60 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>V1 Non-Custodial</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
