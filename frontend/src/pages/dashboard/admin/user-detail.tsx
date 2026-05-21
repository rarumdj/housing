import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldOff, Loader2, Mail, Phone, Calendar } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn } from '@/lib/utils';
import { useAdminUserDetailQuery, useVerifyUserMutation, useToggleActiveMutation } from '@/services/admin/queries';

const verificationBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useAdminUserDetailQuery(id!);
  const verifyMutation = useVerifyUserMutation();
  const toggleMutation = useToggleActiveMutation();

  const user = data?.data as Record<string, unknown> | undefined;

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">User not found</p></div>;

  const role = String(user.role);
  const landlord = user.landlord as Record<string, unknown> | null;
  const tenant = user.tenant as Record<string, unknown> | null;
  const vStatus = role === 'LANDLORD' ? String(landlord?.verificationStatus ?? 'PENDING') : role === 'TENANT' ? String(tenant?.kycStatus ?? 'PENDING') : 'N/A';

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-4xl py-8">
        <button onClick={() => navigate(dashboardKeys.admin.users.path)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>

        {/* Profile Header */}
        <div className="mb-6 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {String(user.firstName).charAt(0)}{String(user.lastName).charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{String(user.firstName)} {String(user.lastName)}</h1>
                <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-medium">{role}</span>
                {vStatus !== 'N/A' && (
                  <span className={cn('rounded-lg px-2.5 py-0.5 text-xs font-medium', verificationBadge[vStatus] ?? 'bg-muted')}>
                    {vStatus}
                  </span>
                )}
                {!user.isActive && <span className="rounded-lg bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Deactivated</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{String(user.email)}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{String(user.phone)}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {new Date(String(user.createdAt)).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {vStatus === 'PENDING' && role !== 'ADMIN' && (
              <>
                <button
                  onClick={() => verifyMutation.mutate({ id: id!, status: 'VERIFIED' })}
                  disabled={verifyMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Shield className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => verifyMutation.mutate({ id: id!, status: 'REJECTED' })}
                  disabled={verifyMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}
            {role !== 'ADMIN' && (
              <button
                onClick={() => toggleMutation.mutate(id!)}
                disabled={toggleMutation.isPending}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {user.isActive ? <><ShieldOff className="h-4 w-4" /> Deactivate</> : <><Shield className="h-4 w-4" /> Activate</>}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Landlord Details */}
          {role === 'LANDLORD' && landlord && (
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="mb-4 font-bold">Landlord Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Business Name</span><span className="font-medium">{String(landlord.businessName || '—')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CAC Number</span><span className="font-medium">{String(landlord.cacNumber || '—')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Properties</span><span className="font-medium">{String(landlord.totalProperties ?? 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Onboarded</span><span className="font-medium">{landlord.isOnboarded ? 'Yes' : 'No'}</span></div>
              </div>

              {Array.isArray(landlord.properties) && landlord.properties.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <h4 className="mb-2 text-sm font-bold">Properties</h4>
                  <div className="space-y-2">
                    {(landlord.properties as Array<Record<string, unknown>>).slice(0, 5).map((p) => (
                      <div key={String(p.id)} className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-medium">{String(p.title)}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{String(p.status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tenant Details */}
          {role === 'TENANT' && tenant && (
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="mb-4 font-bold">Tenant Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">KYC Status</span><span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', verificationBadge[String(tenant.kycStatus)] ?? 'bg-muted')}>{String(tenant.kycStatus)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Screening Band</span><span className="font-medium">{String(tenant.screeningBand || '—')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Employment</span><span className="font-medium">{String(tenant.employmentStatus || '—')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Onboarded</span><span className="font-medium">{tenant.isOnboarded ? 'Yes' : 'No'}</span></div>
              </div>

              {Array.isArray(tenant.bookings) && tenant.bookings.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <h4 className="mb-2 text-sm font-bold">Bookings</h4>
                  <div className="space-y-2">
                    {(tenant.bookings as Array<Record<string, unknown>>).slice(0, 5).map((b) => (
                      <div key={String(b.id)} className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-medium">Booking {String(b.id).slice(0, 8)}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{String(b.status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Info */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-4 font-bold">Account Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Active</span><span className={cn('font-medium', user.isActive ? 'text-emerald-600' : 'text-red-600')}>{user.isActive ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email Verified</span><span className="font-medium">{user.isEmailVerified ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone Verified</span><span className="font-medium">{user.isPhoneVerified ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
