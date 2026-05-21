import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn } from '@/lib/utils';
import { useAdminUsersQuery, useVerifyUserMutation, useToggleActiveMutation } from '@/services/admin/queries';

const ROLE_FILTERS = ['ALL', 'LANDLORD', 'TENANT'] as const;

const verificationBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') ?? 'ALL';
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (roleFilter !== 'ALL') params.role = roleFilter;
  if (searchQuery) params.search = searchQuery;

  const { data, isLoading } = useAdminUsersQuery(params);
  const verifyMutation = useVerifyUserMutation();
  const toggleMutation = useToggleActiveMutation();

  const users = data?.users ?? [];
  const meta = data?.meta;

  const getVerificationStatus = (user: typeof users[0]) => {
    if (user.role === 'LANDLORD') return user.landlord?.verificationStatus ?? 'PENDING';
    if (user.role === 'TENANT') return user.tenant?.kycStatus ?? 'PENDING';
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <Link to={dashboardKeys.admin.home.path} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="mb-6 font-display text-2xl font-bold">User Management</h1>

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-1">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', r === roleFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
              >
                {r === 'ALL' ? 'All Users' : `${r.charAt(0)}${r.slice(1).toLowerCase()}s`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center"><p className="text-muted-foreground">No users found</p></div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => {
              const vStatus = getVerificationStatus(user);
              return (
                <div key={user.id} className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted/30">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.firstName} {user.lastName}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">{user.role}</span>
                    {vStatus !== 'N/A' && (
                      <span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', verificationBadge[vStatus] ?? 'bg-muted text-muted-foreground')}>
                        {vStatus}
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Deactivated</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {vStatus === 'PENDING' && user.role !== 'ADMIN' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); verifyMutation.mutate({ id: user.id, status: 'VERIFIED' }); }}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <Shield className="inline h-3 w-3" /> Approve
                      </button>
                    )}
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(user.id); }}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <ShieldOff className="inline h-3 w-3" /> : <Shield className="inline h-3 w-3" />}
                      </button>
                    )}
                    <Link to={dashboardKeys.admin.userDetail.build(user.id)} className="rounded-lg p-2 hover:bg-muted">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
