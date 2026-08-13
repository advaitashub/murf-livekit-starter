'use client';

import { useEffect, useState } from 'react';
import { RefreshCcwIcon, PhoneCall, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG_DEFAULTS } from '@/app-config';

type AnalyticsStats = {
  total: number;
  successful: number;
  failed: number;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/analytics', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load analytics data.');
        }
        const data = await response.json();
        
        // Validate the response
        if (
          typeof data.total === 'number' &&
          typeof data.successful === 'number' &&
          typeof data.failed === 'number'
        ) {
          setStats(data);
        } else {
          throw new Error('Invalid analytics data format.');
        }
      } catch (err) {
        setError((err as Error).message || 'Unable to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshCount]);

  const successRate = stats && stats.total > 0 
    ? ((stats.successful / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-background/95">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Logo and Title */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={APP_CONFIG_DEFAULTS.logo} 
                alt="CashCompass Logo" 
                className="h-10 w-10 block dark:hidden" 
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={APP_CONFIG_DEFAULTS.logoDark || APP_CONFIG_DEFAULTS.logo} 
                alt="CashCompass Logo" 
                className="h-10 w-10 hidden dark:block" 
              />
            </div>
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Call Analytics
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Monitor CashCompass call performance and metrics.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setRefreshCount((prev) => prev + 1)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCcwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && stats === null && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && stats && stats.total === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <PhoneCall className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h2 className="mt-4 text-xl font-semibold">No Calls Yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start a call to see analytics appear here.
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        {!loading && stats && stats.total > 0 && (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {/* Total Calls Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Calls
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {stats.total}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <PhoneCall className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                All recorded calls
              </p>
            </div>

            {/* Successful Calls Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Successful Calls
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-500">
                    {stats.successful}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Completed successfully
              </p>
            </div>

            {/* Failed Calls Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Failed Calls
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-red-500">
                    {stats.failed}
                  </p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Calls that encountered issues
              </p>
            </div>
          </div>
        )}

        {/* Success Rate (Optional) */}
        {!loading && stats && stats.total > 0 && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-500">
                  {successRate}%
                </p>
              </div>
              <div className="h-32 w-32 rounded-full border-4 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-500">
                  {successRate}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
