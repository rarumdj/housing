import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Eye,
  Play,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import { usePropertyActivityQuery, useDeletePropertyMutation } from '@/services/properties/queries';
import { useAcceptBookingMutation, useDeclineBookingMutation, useCancelBookingMutation, useTerminateLeaseMutation } from '@/services/bookings/queries';
import { ActivityTimeline } from '@/components/landlord/activity-timeline';

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RENTED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

const TABS = ['overview', 'activity', 'tenant'] as const;
type Tab = typeof TABS[number];

const LandlordPropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading } = usePropertyActivityQuery(id!);
  const deleteMutation = useDeletePropertyMutation();
  const acceptMutation = useAcceptBookingMutation();
  const declineMutation = useDeclineBookingMutation();
  const cancelMutation = useCancelBookingMutation();
  const terminateMutation = useTerminateLeaseMutation();

  const property = data?.data?.property;
  const bookings = data?.data?.bookings ?? [];

  const activeBookings = bookings.filter((b) =>
    ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT', 'PAID', 'ACTIVE'].includes(b.status),
  );
  const activeLease = bookings.find((b) => b.status === 'ACTIVE' && b.lease);
  const pendingApplications = bookings.filter((b) => ['APPLIED', 'UNDER_REVIEW'].includes(b.status));

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id!);
    navigate(dashboardKeys.landlord.properties.path);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const photoMedia = property.media?.filter((m: { type?: string }) => m.type !== 'VIDEO') ?? [];
  const coverImage =
    photoMedia.find((m: { isCover?: boolean }) => m.isCover) ??
    photoMedia[0] ??
    property.media?.find((m: { isCover?: boolean }) => m.isCover) ??
    property.media?.[0];
  const videos = property.media?.filter((m: { type?: string }) => m.type === 'VIDEO') ?? [];

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <button
          onClick={() => navigate(dashboardKeys.landlord.properties.path)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to properties
        </button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{property.title}</h1>
              <span className={cn('rounded-lg px-2.5 py-0.5 text-xs font-medium', statusBadge[property.status ?? ''] ?? 'bg-muted text-muted-foreground')}>
                {(property.status ?? 'UNKNOWN').replace('_', ' ')}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}, {property.lga}, {property.state}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(dashboardKeys.landlord.edit.build(id!))}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Edit className="h-4 w-4" /> Edit
            </button>
            {['DRAFT', 'ARCHIVED'].includes(property.status ?? '') && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Confirm deletion</p>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-background p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors',
                t === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t}
              {t === 'activity' && pendingApplications.length > 0 && (
                <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                  {pendingApplications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {coverImage && (
              <div className="overflow-hidden rounded-2xl">
                {coverImage.type === 'VIDEO' ? (
                  <video
                    src={coverImage.url}
                    poster={coverImage.thumbnailUrl}
                    controls
                    className="h-64 w-full bg-black object-cover sm:h-80"
                  />
                ) : (
                  <img src={coverImage.url} alt={property.title} className="h-64 w-full object-cover sm:h-80" />
                )}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-3 font-bold">Description</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
                </div>

                {/* Media Gallery */}
                {property.media && property.media.length > 1 && (
                  <div className="rounded-2xl border border-border bg-background p-6">
                    <h3 className="mb-3 font-bold">Media ({property.media.length})</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {property.media.map((m: { code?: string; url: string; type?: string }, i: number) => (
                        <div key={m.code ?? i} className="relative aspect-video overflow-hidden rounded-lg">
                          {m.type === 'VIDEO' ? (
                            <video src={m.url} className="h-full w-full object-cover" controls />
                          ) : (
                            <img src={m.url} alt="" className="h-full w-full object-cover" />
                          )}
                          {m.type === 'VIDEO' && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <Play className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div className="rounded-2xl border border-border bg-background p-6">
                    <h3 className="mb-3 font-bold">Property Videos</h3>
                    <div className="space-y-3">
                      {videos.map((v: { code?: string; url: string }, i: number) => (
                        <video key={v.code ?? i} src={v.url} controls className="w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-3 font-bold">Pricing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Annual</span><span className="font-bold">{formatNaira(property.priceAnnually)}</span></div>
                    {property.priceMonthly && <div className="flex justify-between"><span className="text-muted-foreground">Monthly</span><span className="font-medium">{formatNaira(property.priceMonthly)}</span></div>}
                    {property.cautionDeposit && <div className="flex justify-between"><span className="text-muted-foreground">Caution</span><span className="font-medium">{formatNaira(property.cautionDeposit)}</span></div>}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-3 font-bold">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{property.type?.replace('_', ' ')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Available</span><span>{property.availableFrom ? new Date(property.availableFrom).toLocaleDateString() : '—'}</span></div>
                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Views</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {String((property as unknown as Record<string, unknown>).viewCount ?? 0)}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-3 font-bold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.isFurnished && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Furnished</span>}
                    {property.hasGenerator && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Generator</span>}
                    {property.hasSecurity && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Security</span>}
                    {property.hasParking && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Parking</span>}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-3 font-bold">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Applications</span><span className="font-medium">{bookings.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-medium text-yellow-600">{pendingApplications.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Lease</span><span className="font-medium">{activeLease ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <ActivityTimeline
            bookings={bookings}
            onAccept={(bId) => acceptMutation.mutate(bId)}
            onDecline={(bId) => declineMutation.mutate({ id: bId, reason: '' })}
            onCancel={(bId) => cancelMutation.mutate(bId)}
            onMessage={(tenantUserId, propertyId) =>
              navigate(`${dashboardKeys.landlord.messages.path}?recipient=${tenantUserId}&property=${propertyId}`)
            }
          />
        )}

        {/* Tenant Tab */}
        {tab === 'tenant' && (
          <div>
            {activeLease ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-background p-6">
                  <h3 className="mb-4 font-bold">Current Tenant</h3>
                  {(() => {
                    const booking = activeLease;
                    const tenant = booking.tenant?.user;
                    return tenant ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                            {tenant.firstName[0]}{tenant.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{tenant.firstName} {tenant.lastName}</p>
                            <p className="text-sm text-muted-foreground">{tenant.email}</p>
                            <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                          </div>
                        </div>

                        {booking.lease && (
                          <div className="rounded-xl bg-muted/50 p-4">
                            <h4 className="mb-2 text-sm font-bold">Lease Details</h4>
                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                              <div><span className="text-muted-foreground">Start:</span> {new Date(booking.lease.rentStartDate).toLocaleDateString()}</div>
                              <div><span className="text-muted-foreground">End:</span> {new Date(booking.lease.rentEndDate).toLocaleDateString()}</div>
                              <div><span className="text-muted-foreground">Status:</span> {booking.lease.status}</div>
                              {booking.lease.annualRent && <div><span className="text-muted-foreground">Annual Rent:</span> {formatNaira(booking.lease.annualRent)}</div>}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`${dashboardKeys.landlord.messages.path}?recipient=${tenant.code}&property=${id}`)}
                            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                          >
                            <MessageSquare className="h-4 w-4" /> Message Tenant
                          </button>
                          {booking.lease && ['ACTIVE', 'PENDING_SIGNATURE'].includes(booking.lease.status) && (
                            <button
                              onClick={() => terminateMutation.mutate(booking.lease!.code)}
                              disabled={terminateMutation.isPending}
                              className="flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                              {terminateMutation.isPending ? 'Terminating...' : 'Terminate Lease'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Tenant details unavailable</p>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="mb-1 font-medium">No active tenant</h3>
                <p className="text-sm text-muted-foreground">This property is not currently rented</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Home = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
};

export default LandlordPropertyDetailPage;
