import React from 'react';
import { Link } from 'react-router-dom';
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ApiDocsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 selection:bg-primary selection:text-primary-foreground">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-foreground font-bold tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">NEETpay</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
              v1.0.0
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 h-8">
            <Link to="/dashboard">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Dashboard</span>
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild className="text-xs border-slate-700 text-slate-200 hover:bg-slate-800 h-8">
            <a href="https://api.neetpay.web.id/openapi.json" target="_blank" rel="noopener noreferrer">
              <span>openapi.json</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
            </a>
          </Button>
        </div>
      </header>

      {/* Scalar Native React API Reference Component */}
      <main className="flex-1 w-full">
        <ApiReferenceReact
          configuration={{
            spec: {
              url: 'https://api.neetpay.web.id/openapi.json',
            },
            theme: 'saturn',
            darkMode: true,
            layout: 'modern',
            hideDownloadButton: false,
            searchHotKey: 'k',
            metaData: {
              title: 'NeetPay REST API Reference',
            },
          }}
        />
      </main>
    </div>
  );
};
