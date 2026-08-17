import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border">
          <AdminSidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Container */}
      <div className="flex flex-col flex-1 md:pl-64 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka menu admin</span>
            </Button>

            <span className="font-extrabold text-sm tracking-tight text-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Admin Center</span>
            </span>
          </div>

          {/* Desktop Breadcrumb/Context */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5 px-2">
              PLATFORM OPERATOR
            </Badge>
            <span className="text-muted-foreground/60">•</span>
            <span>NeetPay Core Monitoring</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              <NavLink to="/dashboard">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>User Dashboard</span>
              </NavLink>
            </Button>
            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:inline-block">
                {user?.name || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/10">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
