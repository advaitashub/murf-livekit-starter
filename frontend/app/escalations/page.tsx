'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCcwIcon, CircleCheck, AlertTriangleIcon, FileSearch, ShieldCheck, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EscalationRequest = {
  id: string;
  reason: string;
  summary: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency' | string;
  language: string;
  follow_up_method: string;
  status: 'open' | 'in_progress' | 'resolved' | string;
  created_at: string;
};

type StatusOption = 'all' | 'open' | 'in_progress' | 'resolved';
type UrgencyOption = 'all' | 'low' | 'medium' | 'high' | 'emergency';

const urgencyLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  emergency: 'Emergency',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const urgencyClasses: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  emergency: 'bg-red-500/10 text-red-300 border-red-500/20',
};

const statusClasses: Record<string, string> = {
  open: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  in_progress: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

const filterButtons = [
  { label: 'All statuses', value: 'all' as StatusOption },
  { label: 'Open', value: 'open' as StatusOption },
  { label: 'In Progress', value: 'in_progress' as StatusOption },
  { label: 'Resolved', value: 'resolved' as StatusOption },
];

const urgencyButtons = [
  { label: 'All urgencies', value: 'all' as UrgencyOption },
  { label: 'Low', value: 'low' as UrgencyOption },
  { label: 'Medium', value: 'medium' as UrgencyOption },
  { label: 'High', value: 'high' as UrgencyOption },
  { label: 'Emergency', value: 'emergency' as UrgencyOption },
];

export default function EscalationsPage() {
  const [requests, setRequests] = useState<EscalationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusOption>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyOption>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/escalations', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load escalation requests.');
        }
        const data = await response.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        setError((err as Error).message || 'Unable to load escalation requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshCount]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      if (urgencyFilter !== 'all' && request.urgency !== urgencyFilter) {
        return false;
      }
      return true;
    });
  }, [requests, statusFilter, urgencyFilter]);

  const openCount = useMemo(
    () => requests.filter((request) => request.status === 'open').length,
    [requests]
  );
  const majorUrgencyCount = useMemo(
    () => requests.filter((request) => request.urgency === 'high' || request.urgency === 'emergency').length,
    [requests]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
                <Sparkle className="size-4" />
                Human Help Dashboard
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Escalation Requests
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                  Review incoming voice-agent human-help requests with urgency and status clearly visible.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => setRefreshCount((value) => value + 1)}
                disabled={loading}
              >
                <RefreshCcwIcon className="size-4" />
                {loading ? 'Refreshing...' : 'Refresh data'}
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Total requests</p>
              <p className="mt-3 text-4xl font-semibold text-white">{requests.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Open requests</p>
              <p className="mt-3 text-4xl font-semibold text-white">{openCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">High / emergency</p>
              <p className="mt-3 text-4xl font-semibold text-white">{majorUrgencyCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Current filters</p>
              <p className="mt-3 text-sm text-zinc-200">
                {statusFilter !== 'all' ? statusLabels[statusFilter] : 'Any status'} ·{' '}
                {urgencyFilter !== 'all' ? urgencyLabels[urgencyFilter] : 'Any urgency'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Filter requests</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Refine the support queue</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select onValueChange={(value) => setStatusFilter(value as StatusOption)}>
                <SelectTrigger aria-label="Filter by status" className="w-full">
                  <SelectValue>{statusFilter === 'all' ? 'All statuses' : statusLabels[statusFilter]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filterButtons.map((button) => (
                    <SelectItem key={button.value} value={button.value}>
                      {button.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => setUrgencyFilter(value as UrgencyOption)}>
                <SelectTrigger aria-label="Filter by urgency" className="w-full">
                  <SelectValue>{urgencyFilter === 'all' ? 'All urgencies' : urgencyLabels[urgencyFilter]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {urgencyButtons.map((button) => (
                    <SelectItem key={button.value} value={button.value}>
                      {button.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {error ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-red-200">
                <AlertTriangleIcon className="size-4" />
                Data error
              </div>
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={() => setRefreshCount((value) => value + 1)}>
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-950/80 p-10 text-zinc-400">
              Loading escalation requests…
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-zinc-950/80 p-10 text-center text-zinc-400">
              <FileSearch className="size-12 text-zinc-500" />
              <p className="text-xl font-semibold text-white">No human-help requests yet.</p>
              <p className="max-w-xl text-sm leading-6 text-zinc-400">
                The CashCompass escalation queue is empty right now. New requests will appear here automatically as they are created by the voice agent.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredRequests.map((request) => (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-lg shadow-black/10"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Reference</p>
                      <p className="mt-2 text-lg font-semibold text-white">{request.id}</p>
                    </div>
                    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">
                      {request.language || 'Unknown'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400">Reason</p>
                      <p className="mt-1 font-medium text-white capitalize">{request.reason.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Summary</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-200">{request.summary}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
                        Follow-up
                        <p className="mt-2 text-base text-white">{request.follow_up_method || 'Unknown'}</p>
                      </div>
                      <div className="rounded-3xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
                        Created
                        <p className="mt-2 text-base text-white">
                          {new Date(request.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div
                        className={`rounded-3xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${urgencyClasses[request.urgency] ?? 'bg-zinc-800 text-zinc-200 border-zinc-700'}`}
                      >
                        Urgency
                        <p className="mt-2 text-base text-white">{urgencyLabels[request.urgency] ?? request.urgency}</p>
                      </div>
                      <div
                        className={`rounded-3xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${statusClasses[request.status] ?? 'bg-zinc-800 text-zinc-200 border-zinc-700'}`}
                      >
                        Status
                        <p className="mt-2 text-base text-white">{statusLabels[request.status] ?? request.status}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
