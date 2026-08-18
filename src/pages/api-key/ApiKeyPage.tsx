import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Code,
  Terminal,
  PlusCircle,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ApiKeyMetadata {
  exists: boolean;
  keyPrefix: string | null;
  createdAt: string | null;
  rotatedAt: string | null;
  lastUsedAt: string | null;
}

interface GenerateKeyResult {
  rawKey: string;
  keyPrefix: string;
  createdAt: string;
  message?: string;
}

interface RotateKeyResult {
  rawKey: string;
  keyPrefix: string;
  rotatedAt: string;
  message?: string;
}

export const ApiKeyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [copiedRawKey, setCopiedRawKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [oneTimeRawKey, setOneTimeRawKey] = useState<string | null>(null);
  const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);

  const { data: keyInfo, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['api-key-metadata'],
    queryFn: async () => {
      const res = await apiClient<ApiKeyMetadata>('/api/api-key');
      return res.data!;
    },
    staleTime: 1000 * 30,
  });

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => apiClient<GenerateKeyResult>('/api/api-key/generate', { method: 'POST' }),
    onSuccess: (res) => {
      setOneTimeRawKey(res.data!.rawKey);
      toast.success('API Key berhasil dibuat!');
      queryClient.invalidateQueries({ queryKey: ['api-key-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal membuat API Key.');
    },
  });

  // Rotate Mutation
  const rotateMutation = useMutation({
    mutationFn: () => apiClient<RotateKeyResult>('/api/api-key/rotate', { method: 'POST' }),
    onSuccess: (res) => {
      setOneTimeRawKey(res.data!.rawKey);
      setRotateConfirmOpen(false);
      toast.success('API Key berhasil dirotasi!');
      queryClient.invalidateQueries({ queryKey: ['api-key-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal merotasi API Key.');
    },
  });

  const handleCopyRawKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedRawKey(true);
    toast.success('API Key berhasil disalin!');
    setTimeout(() => setCopiedRawKey(false), 2000);
  };

  const handleCopySnippet = (snippet: string, name: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(name);
    toast.success(`${name} code disalin ke clipboard!`);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const curlSnippet = `# STEP 1 — Ambil Daftar Payment Channels
curl https://api.neetpay.web.id/v1/payment-channels \\
  -H "Authorization: Bearer YOUR_NEETPAY_API_KEY"

# Response Contoh:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "cms_xxxxx",
#       "name": "QRIS Utama",
#       "method": "QRIS",
#       "provider": "GOBIZ"
#     }
#   ]
# }

# STEP 2 — Buat Dynamic QRIS Transaksi
# (id dari Step 1 digunakan sebagai paymentAccountId. Bersifat opsional)
curl -X POST https://api.neetpay.web.id/v1/transactions \\
  -H "Authorization: Bearer YOUR_NEETPAY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "INV-2026-001",
    "amount": 25000,
    "paymentAccountId": "cms_xxxxx",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com"
  }'`;

  const nodeSnippet = `// STEP 1 — Ambil Daftar Payment Channels
const channelsRes = await fetch('https://api.neetpay.web.id/v1/payment-channels', {
  headers: {
    'Authorization': 'Bearer YOUR_NEETPAY_API_KEY'
  }
});
const { data: channels } = await channelsRes.json();
console.log('Available Channels:', channels);
// Contoh: [{ id: "cms_xxxxx", name: "QRIS Utama", method: "QRIS", provider: "GOBIZ" }]

// STEP 2 — Buat Dynamic QRIS Transaksi
// paymentAccountId bersifat opsional. Jika tidak diisi, akun default aktif akan digunakan.
const response = await fetch('https://api.neetpay.web.id/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_NEETPAY_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: 'INV-2026-001',
    amount: 25000,
    paymentAccountId: channels[0]?.id, // id channel dari Step 1 (opsional)
    customerName: 'John Doe',
    customerEmail: 'customer@example.com'
  })
});

const data = await response.json();
console.log('Dynamic QRIS String:', data.data.qr_string);`;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">API Key Management</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gunakan Secret API Key ini untuk mengintegrasikan backend toko online Anda dengan NeetPay REST API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs gap-1.5 h-9"
          >
            <Link to="/docs" target="_blank" rel="noopener noreferrer">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Scalar API Docs</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
        </div>
      </div>

      {/* Main Key Info Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <KeyRound className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                Secret API Key (Live)
              </CardTitle>
            </div>
            <Badge variant={keyInfo?.exists ? 'paid' : 'pending'} className="text-[10px] font-bold">
              {keyInfo?.exists ? 'ACTIVE' : 'NOT GENERATED'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg bg-muted/60" />
          ) : !keyInfo?.exists ? (
            <div className="p-6 text-center space-y-3">
              <KeyRound className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm font-semibold text-foreground">Anda belum memiliki API Key</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Buat API Key pertama Anda untuk mulai memproses pembuatan Dynamic QRIS transaksi secara otomatis.
              </p>
              <Button
                size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="text-xs font-semibold gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{generateMutation.isPending ? 'Membuat Kunci...' : 'Generate API Key'}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Key Prefix Identifier</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-lg bg-muted/50 border border-border/60 font-mono text-xs text-foreground font-semibold flex items-center justify-between">
                    <span>{keyInfo.keyPrefix}••••••••••••••••</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-medium uppercase">
                      Masked for Security
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotateConfirmOpen(true)}
                    className="text-xs font-semibold h-9 px-3 gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Key</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground">Dibuat Pada</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {keyInfo.createdAt ? new Date(keyInfo.createdAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Terakhir Dirotasi</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {keyInfo.rotatedAt ? new Date(keyInfo.rotatedAt).toLocaleDateString('id-ID') : 'Belum pernah'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Terakhir Digunakan</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">
                    {keyInfo.lastUsedAt ? new Date(keyInfo.lastUsedAt).toLocaleString('id-ID') : 'Belum digunakan'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Guide Snippet Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Integrasi Cepat (Quick Integration — 2 Steps)
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Gunakan header <code>Authorization: Bearer YOUR_NEETPAY_API_KEY</code> pada setiap request.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="text-xs h-8 gap-1.5 self-start sm:self-auto border-primary/30 text-primary hover:bg-primary/10">
            <Link to="/docs" target="_blank" rel="noopener noreferrer">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scalar API Docs</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">STEP 1: Get Payment Channels</span>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Panggil <code>GET /v1/payment-channels</code> untuk mendapatkan daftar channel aktif. Nilai <code>id</code> (misal: <em>cms_xxxxx</em>) digunakan sebagai <code>paymentAccountId</code>.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">STEP 2: Create Transaction</span>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Kirim <code>POST /v1/transactions</code> dengan parameter <code>paymentAccountId</code>. Jika parameter tidak diisi, sistem otomatis memilih akun GoBiz default.
              </p>
            </div>
          </div>

          <Tabs defaultValue="curl" className="space-y-3 pt-2">
            <TabsList className="grid grid-cols-2 h-9 bg-muted/60 max-w-xs">
              <TabsTrigger value="curl" className="text-xs font-semibold gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>cURL</span>
              </TabsTrigger>
              <TabsTrigger value="node" className="text-xs font-semibold gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span>JavaScript (Fetch)</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="relative">
              <pre className="p-4 rounded-xl bg-muted/80 text-foreground font-mono text-xs overflow-x-auto leading-relaxed border border-border/60">
                {curlSnippet}
              </pre>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopySnippet(curlSnippet, 'cURL')}
                className="absolute right-3 top-3 h-7 px-2.5 text-xs font-semibold"
              >
                {copiedSnippet === 'cURL' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                <span>Salin cURL</span>
              </Button>
            </TabsContent>

            <TabsContent value="node" className="relative">
              <pre className="p-4 rounded-xl bg-muted/80 text-foreground font-mono text-xs overflow-x-auto leading-relaxed border border-border/60">
                {nodeSnippet}
              </pre>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopySnippet(nodeSnippet, 'JavaScript')}
                className="absolute right-3 top-3 h-7 px-2.5 text-xs font-semibold"
              >
                {copiedSnippet === 'JavaScript' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                <span>Salin JS</span>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* One-Time Raw Key Display Modal */}
      <Dialog open={!!oneTimeRawKey} onOpenChange={(open) => !open && setOneTimeRawKey(null)}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <DialogTitle className="text-base font-bold">API Key Baru Anda</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Simpan API Key ini di tempat yang aman. Kunci rahasia ini hanya ditampilkan sekali dan tidak akan dapat dilihat kembali setelah jendela ini ditutup.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-lg bg-muted/80 border border-primary/30 flex items-center justify-between gap-3">
            <code className="font-mono text-xs font-bold text-primary break-all">
              {oneTimeRawKey}
            </code>
            <Button
              size="sm"
              onClick={() => oneTimeRawKey && handleCopyRawKey(oneTimeRawKey)}
              className="h-8 px-3 text-xs font-semibold shrink-0 gap-1.5"
            >
              {copiedRawKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRawKey ? 'Tersalin' : 'Salin Kunci'}</span>
            </Button>
          </div>

          <DialogFooter className="pt-2">
            <Button
              onClick={() => setOneTimeRawKey(null)}
              className="w-full text-xs font-semibold"
            >
              Saya Telah Menyimpan API Key Ini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Key Confirmation Modal */}
      <Dialog open={rotateConfirmOpen} onOpenChange={setRotateConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Rotasi API Key?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Merotasi API Key akan langsung menonaktifkan kunci lama Anda. Seluruh integrasi API yang menggunakan kunci lama akan berhenti berfungsi hingga diperbarui dengan kunci baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setRotateConfirmOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => rotateMutation.mutate()}
              disabled={rotateMutation.isPending}
              className="text-xs font-semibold"
            >
              {rotateMutation.isPending ? 'Memproses...' : 'Ya, Rotasi Kunci Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
