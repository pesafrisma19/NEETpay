import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Zap,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthResponse {
  api: {
    status: string;
    version: string;
    nodeVersion: string;
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
    env: string;
  };
  database: {
    status: string;
    latencyMs: number;
  };
  worker: {
    status: string;
    pollingIntervalMs: number;
    activePollingAccountsCount: number;
    pendingTransactionsCount: number;
    reconciliationGraceMs: number;
  };
  webhookDispatcher: {
    status: string;
    pollingIntervalMs: number;
    pendingRetriesCount: number;
    failedDeliveriesCount: number;
  };
  recentActivity: {
    recentProviderEvents: Array<{
      id: string;
      eventType: string;
      providerRefId: string;
      isProcessed: boolean;
      createdAt: string;
    }>;
    recentTokenLifecycles: Array<{
      tokenType: string;
      outletName?: string;
      lastSuccessAt?: string;
      failedAt?: string;
      failureCode?: string;
    }>;
  };
  timestamp: string;
}

export const AdminHealthPage: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: async () => {
      const res = await apiClient<HealthResponse>('/api/admin/health');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}h ` : ''}${h}j ${m}m ${s}d`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-card border rounded-2xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h3 className="font-bold text-lg">Gagal Memeriksa Kesehatan Sistem</h3>
        <p className="text-sm text-muted-foreground">Tidak dapat terhubung ke endpoint diagnostik platform.</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-red-600" />
            <span>System & Worker Health</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Diagnostik runtime backend API, database connectivity, dan Payment Worker engine.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostik</span>
        </Button>
      </div>

      {/* 4 Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Gateway Card */}
        <Card className="bg-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              API Gateway
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Server className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                {data.api.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">v{data.api.version}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uptime: <span className="font-semibold text-foreground">{formatUptime(data.api.uptimeSeconds)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Database Card */}
        <Card className="bg-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              PostgreSQL Database
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Database className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  data.database.status === 'CONNECTED'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-bold'
                }
              >
                {data.database.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Query Ping: <span className="font-mono font-semibold text-foreground">{data.database.latencyMs}ms</span>
            </p>
          </CardContent>
        </Card>

        {/* Payment Worker Card */}
        <Card className="bg-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Payment Worker
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                {data.worker.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">{data.worker.pollingIntervalMs / 1000}s interval</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active Polling:{' '}
              <span className="font-bold text-foreground">{data.worker.activePollingAccountsCount} Akun</span>
            </p>
          </CardContent>
        </Card>

        {/* Webhook Dispatcher Card */}
        <Card className="bg-card border-border/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Webhook Dispatcher
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-bold">
                {data.webhookDispatcher.status}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">{data.webhookDispatcher.pollingIntervalMs / 1000}s</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Antrean Retry:{' '}
              <span className="font-bold text-foreground">{data.webhookDispatcher.pendingRetriesCount}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Server Resources & Queue Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Node.js Runtime Resources */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Penggunaan Memori & Node.js</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Node Version:</span>
              <span className="font-mono font-semibold text-foreground">{data.api.nodeVersion}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Environment:</span>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {data.api.env}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Memory RSS:</span>
              <span className="font-mono font-semibold text-foreground">{data.api.memory.rssMb} MB</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Heap Used / Total:</span>
              <span className="font-mono font-semibold text-foreground">
                {data.api.memory.heapUsedMb} MB / {data.api.memory.heapTotalMb} MB
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Worker Queue Engine */}
        <Card className="bg-card border-border/70">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Parameter & Antrean Rekonsiliasi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Pending Transaksi Aktif:</span>
              <Badge variant="outline" className="font-bold text-amber-600 bg-amber-500/10 border-amber-500/20">
                {data.worker.pendingTransactionsCount} Menunggu
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Interval Polling GoBiz:</span>
              <span className="font-mono font-semibold text-foreground">{data.worker.pollingIntervalMs} ms</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Reconciliation Grace Period:</span>
              <span className="font-mono font-semibold text-foreground">
                {data.worker.reconciliationGraceMs / 1000} detik
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Interval Webhook Dispatcher:</span>
              <span className="font-mono font-semibold text-foreground">
                {data.webhookDispatcher.pollingIntervalMs} ms
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Provider Events Log */}
      <Card className="bg-card border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Aktivitas Mutasi GoBiz Terakhir (Provider Events)</span>
          </CardTitle>
          <CardDescription className="text-xs">Event mutasi kredit QRIS yang dideteksi oleh Payment Worker</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentActivity.recentProviderEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Belum ada mutasi GoBiz baru yang dicatat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Event Type</th>
                    <th className="p-2.5 font-mono">Provider Ref ID</th>
                    <th className="p-2.5">Status Proses</th>
                    <th className="p-2.5">Waktu Deteksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.recentActivity.recentProviderEvents.map((pe) => (
                    <tr key={pe.id}>
                      <td className="p-2.5 font-bold">{pe.eventType}</td>
                      <td className="p-2.5 font-mono text-emerald-600 font-bold">{pe.providerRefId}</td>
                      <td className="p-2.5">
                        <Badge
                          variant="outline"
                          className={
                            pe.isProcessed
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'
                          }
                        >
                          {pe.isProcessed ? 'PROCESSED' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-muted-foreground">
                        {new Date(pe.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
