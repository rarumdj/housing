import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, X, Trash2, Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import { pickListThumbnail } from '@/lib/media';
import type { PropertyMedia } from '@/types/domain';
import { useAdminPropertiesQuery, useVerifyPropertyMutation, useAdminDeletePropertyMutation } from '@/services/admin/queries';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'RENTED', 'ARCHIVED'] as const;

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RENTED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

const verBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminPropertiesPage() {
  const [searchParams] = useSearchParams();
  const initialVer = searchParams.get('verificationStatus') ?? '';

  const [filter, setFilter] = useState(initialVer === 'PENDING' ? 'PENDING' : 'ALL');
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (filter === 'PENDING') {
    params.verificationStatus = 'PENDING';
  } else if (filter !== 'ALL') {
    params.status = filter;
  }

  const { data, isLoading } = useAdminPropertiesQuery(params);
  const verifyMutation = useVerifyPropertyMutation();
  const deleteMutation = useAdminDeletePropertyMutation();

  const properties = data?.properties ?? [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <Link to={dashboardKeys.admin.home.path} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="mb-6 font-display text-2xl font-bold">Property Management</h1>

        <div className="mb-6 flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', s === filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
            >
              {s === 'PENDING' ? 'Pending Approval' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center"><p className="text-muted-foreground">No properties found</p></div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => {
              const p = property as unknown as Record<string, unknown>;
              const owner = p.owner as Record<string, unknown> | undefined;
              const ownerUser = owner?.user as Record<string, unknown> | undefined;
              const media = (p.media ?? []) as Array<Record<string, unknown>>;
              const vStatus = String(p.verificationStatus ?? 'PENDING');
              const thumb = pickListThumbnail(media as unknown as PropertyMedia[]);

              const previewPath = dashboardKeys.admin.propertyDetail.build(String(p.id));

              return (
                <div key={String(p.id)} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted/30">
                  <Link
                    to={previewPath}
                    className="group flex min-w-0 flex-1 items-center gap-4 rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                      {thumb.url && thumb.kind === 'photo' ? (
                        <img src={thumb.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : thumb.url && thumb.kind === 'video' ? (
                        <>
                          <img src={thumb.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
                            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Video</span>
                          </div>
                        </>
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                        Preview
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium group-hover:text-primary group-hover:underline">{String(p.title)}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Eye className="h-3.5 w-3.5" />
                        View full listing (tenant view)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}` : 'Unknown landlord'}
                        {' '}&middot;{' '}{String(p.lga)}, {String(p.state)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', statusBadge[String(p.status)] ?? 'bg-muted text-muted-foreground')}>
                          {String(p.status ?? '').replace('_', ' ')}
                        </span>
                        <span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', verBadge[vStatus] ?? 'bg-muted text-muted-foreground')}>
                          {vStatus}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="shrink-0 text-right">
                    <p className="font-bold">{formatNaira(Number(p.priceAnnually))}<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {vStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => verifyMutation.mutate({ id: String(p.id), verificationStatus: 'VERIFIED' })}
                          disabled={verifyMutation.isPending}
                          className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => verifyMutation.mutate({ id: String(p.id), verificationStatus: 'REJECTED' })}
                          disabled={verifyMutation.isPending}
                          className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(String(p.id))}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Archive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {meta.pages}</span>
            <button onClick={() => setPage((p) => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
