import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Server,
  Layers,
  Database,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface HealthData {
  service: string;
  version: string;
  status: string;
  timestamp: string;
}

const FoundationLanding: React.FC = () => {
  const [mockLiveMode, setMockLiveMode] = useState(true);

  const { data: health, isLoading, isError } = useQuery({
    queryKey: ['health-check'],
    queryFn: () => apiClient<HealthData>('/health'),
    retry: 1,
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-4xl w-full space-y-8">
        {/* Brand & Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold tracking-wide shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>NEETPAY V1 ARCHITECTURE & UI FOUNDATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Non-Custodial Payment Gateway
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Lightweight, high-throughput payment orchestration engine. Direct merchant QRIS settlement without intermediary wallets or custodial balances.
          </p>
        </div>

        {/* Status & Connection Alert */}
        <Alert className="border-border/60 bg-card/60 backdrop-blur shadow-sm">
          <Server className="h-4 w-4 text-primary" />
          <AlertTitle className="flex items-center justify-between text-sm font-semibold">
            <span>Gateway Engine Health</span>
            {isLoading ? (
              <Badge variant="outline" className="animate-pulse text-xs">
                Checking API...
              </Badge>
            ) : isError ? (
              <Badge variant="pending" className="text-xs">
                API Offline (Standby)
              </Badge>
            ) : (
              <Badge variant="paid" className="text-xs">
                {health?.data?.status || 'OPERATIONAL'}
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            Target Host: <code className="font-mono text-foreground font-semibold">https://api.neetpay.web.id</code> | Frontend: <code className="font-mono text-foreground font-semibold">https://neetpay.web.id</code>
          </AlertDescription>
        </Alert>

        {/* Core Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 text-primary text-xs font-medium">
                <Database className="w-4 h-4" />
                <span>Prisma PostgreSQL</span>
              </div>
              <CardTitle className="text-base font-bold text-foreground">18 Core Models</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                Non-custodial, isolated GoBizAccount credentials, integer-safe fee rules.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 text-primary text-xs font-medium">
                <Cpu className="w-4 h-4" />
                <span>Runtime Engine</span>
              </div>
              <CardTitle className="text-base font-bold text-foreground">Node 24 + Hono</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                Web standards REST API with Zod validation & Pino structured logging.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 text-primary text-xs font-medium">
                <Layers className="w-4 h-4" />
                <span>Dual PM2 Process</span>
              </div>
              <CardTitle className="text-base font-bold text-foreground">API + Worker</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                PostgreSQL index-driven polling queue with retry backoff timers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Theme & Component Verification Section */}
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="p-5 pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold">Design System & Semantic Token Verification</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Confirming shadcn/ui components, semantic payment status tokens, and interaction primitives.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="live-mode-toggle"
                  checked={mockLiveMode}
                  onCheckedChange={setMockLiveMode}
                />
                <Label htmlFor="live-mode-toggle" className="text-xs font-medium cursor-pointer">
                  {mockLiveMode ? 'Live Preview' : 'Draft Mode'}
                </Label>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Tabs for Semantic Statuses & Model Snapshots */}
            <Tabs defaultValue="status-tokens" className="w-full">
              <TabsList className="grid grid-cols-2 w-full max-w-sm mb-4">
                <TabsTrigger value="status-tokens" className="text-xs">Semantic Status Badges</TabsTrigger>
                <TabsTrigger value="schema-spec" className="text-xs">4 Schema Corrections</TabsTrigger>
              </TabsList>

              <TabsContent value="status-tokens" className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/70 space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground block">Payment Status Semantic Variants:</span>
                  <div className="flex flex-wrap gap-2.5">
                    <Badge variant="paid">PAID / SUCCESS</Badge>
                    <Badge variant="pending">PENDING POLL</Badge>
                    <Badge variant="failed">FAILED / REJECTED</Badge>
                    <Badge variant="expired">EXPIRED</Badge>
                  </div>
                </div>

                <div className="rounded-md border border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs">Payment Method</TableHead>
                        <TableHead className="text-xs">Provider</TableHead>
                        <TableHead className="text-xs">Fee Snapshot</TableHead>
                        <TableHead className="text-xs text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-semibold">QRIS Dynamic</TableCell>
                        <TableCell className="text-xs">GoBiz Merchant</TableCell>
                        <TableCell className="text-xs text-muted-foreground">FLAT Rp500 + Unique Code</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="paid">PAID</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs font-semibold">QRIS Dynamic</TableCell>
                        <TableCell className="text-xs">GoBiz Merchant</TableCell>
                        <TableCell className="text-xs text-muted-foreground">PERCENT 0.70% (70 bps)</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="pending">PENDING</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="schema-spec" className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-background/60 border border-border/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-paid-foreground" />
                      <span>1. Non-Custodial (No User Saldo)</span>
                    </div>
                    <p className="text-muted-foreground">
                      User model has 0 balance fields. Funds settle directly into User's GoBiz account.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background/60 border border-border/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-paid-foreground" />
                      <span>2. Clean SaaS Plan Quota</span>
                    </div>
                    <p className="text-muted-foreground">
                      Plan only manages subscription tiers (Free vs Pro). No payment fee markup in Plan.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background/60 border border-border/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-paid-foreground" />
                      <span>3. 1 User = 1 API Key</span>
                    </div>
                    <p className="text-muted-foreground">
                      Single <code className="font-mono text-primary">np_live_xxxx</code> key with keyHash in database. Webhook uses separate secretKey.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-background/60 border border-border/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-paid-foreground" />
                      <span>4. Provider Credential Isolation</span>
                    </div>
                    <p className="text-muted-foreground">
                      PaymentAccount is purely generic. GoBiz-specific tokens are isolated in GoBizAccount.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <Separator className="bg-border/60" />

          <CardFooter className="p-5 flex flex-wrap items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => toast.success('Sonner Toast notification system verified!')}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Test Toast Trigger
              </Button>

              <Dialog>
                <DialogTrigger
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'sm' }),
                    'text-xs'
                  )}
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  View Security Model
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">NeetPay V1 Security Architecture</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                      Non-custodial cryptographic guarantees and session auditing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-3 text-xs text-muted-foreground">
                    <p>
                      • <strong className="text-foreground">AuthSession:</strong> Stateful hashed tokens for dashboard sessions with full IP and User-Agent logging.
                    </p>
                    <p>
                      • <strong className="text-foreground">ApiCredential:</strong> Single SHA-256 hashed API key (<code className="font-mono text-primary">np_live_...</code>) with Bearer token authentication.
                    </p>
                    <p>
                      • <strong className="text-foreground">GoBizAccount Encryption:</strong> Sensitive merchant credentials encrypted at rest with AES-256-GCM.
                    </p>
                    <p>
                      • <strong className="text-foreground">Webhook Deliveries:</strong> Signed payload headers with dedicated merchant secret keys.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Next Phase:</span>
              <Badge variant="outline" className="font-mono text-[11px]">
                Business Logic & Modules
                <ArrowRight className="w-3 h-3 ml-1 inline" />
              </Badge>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-6">
          <span>NeetPay V1 &copy; 2026. All rights reserved. </span>
          <a
            href="https://neetpay.web.id"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium ml-1"
          >
            neetpay.web.id <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </main>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FoundationLanding />} />
      <Route path="*" element={<FoundationLanding />} />
    </Routes>
  );
};
