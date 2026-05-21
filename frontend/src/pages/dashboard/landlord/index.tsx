import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock, Eye, Home, MessageSquare, Plus, TrendingUp, Users, X } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useMyPropertiesQuery } from '@/services/properties/queries';
import { useLandlordBookingsQuery, useAcceptBookingMutation, useDeclineBookingMutation } from '@/services/bookings/queries';
import { formatNaira } from '@/lib/utils';

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RENTED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export default function LandlordDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthManager();
  const { data, isLoading } = useMyPropertiesQuery();
  const properties = data?.data ?? [];

  const { data: bookingsData } = useLandlordBookingsQuery();
  const allBookings = bookingsData?.data ?? [];

  const acceptMutation = useAcceptBookingMutation();
  const declineMutation = useDeclineBookingMutation();

  const pendingApplications = allBookings.filter((b) => ['APPLIED', 'UNDER_REVIEW'].includes(b.status));
  const activeLeases = allBookings.filter((b) => b.status === 'ACTIVE');

  const stats = {
    total: properties.length,
    active: properties.filter((property) => property.status === 'ACTIVE').length,
    rented: properties.filter((property) => property.status === 'RENTED').length,
    pending: properties.filter((property) => property.status === 'PENDING_VERIFICATION').length,
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome back, {user?.firstName}</h1>
            <p className="mt-1 text-muted-foreground">Manage your properties and tenants</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={dashboardKeys.landlord.messages.path}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-medium transition-colors hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>
            <Link
              to={dashboardKeys.landlord.create.path}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add property
            </Link>
          </div>
        </div>

        {/* Stats Cards - clickable */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total properties', value: stats.total, icon: Home, color: 'text-blue-600 bg-blue-50', path: dashboardKeys.landlord.properties.path },
            { label: 'Active listings', value: stats.active, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', path: dashboardKeys.landlord.properties.path },
            { label: 'Currently rented', value: stats.rented, icon: Users, color: 'text-orange-600 bg-orange-50', path: dashboardKeys.landlord.properties.path },
            { label: 'Awaiting review', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50', path: dashboardKeys.landlord.properties.path },
          ].map(({ label, value, icon: Icon, color, path }) => (
            <Link key={label} to={path} className="rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-muted/30">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Properties List */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-lg font-bold">Your properties</h2>
              <Link to={dashboardKeys.landlord.properties.path} className="flex items-center gap-1 text-sm text-primary hover:underline">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="h-16 w-20 flex-shrink-0 rounded-xl bg-shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-shimmer" />
                      <div className="h-3 w-1/3 rounded bg-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !properties.length ? (
              <div className="py-16 text-center">
                <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="mb-1 font-medium">No properties yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">Add your first property to get started</p>
                <Link
                  to={dashboardKeys.landlord.create.path}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add property
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30">
                    <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                      {property.media?.[0] ? (
                        <img src={property.media[0].url} alt={property.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.lga}, {property.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatNaira(property.priceAnnually)}/yr</p>
                      <span className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-xs ${statusBadge[property.status ?? ''] ?? 'bg-muted text-muted-foreground'}`}>
                        {(property.status ?? 'UNKNOWN').replace('_', ' ')}
                      </span>
                    </div>
                    <Link
                      to={dashboardKeys.landlord.detail.build(property.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Awaiting Review */}
            <div className="rounded-2xl border border-border bg-background">
              <div className="border-b border-border p-4">
                <h3 className="font-bold">Awaiting Review ({pendingApplications.length})</h3>
              </div>
              {pendingApplications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No pending applications</p>
              ) : (
                <div className="divide-y divide-border">
                  {pendingApplications.slice(0, 5).map((booking) => {
                    const tenant = booking.tenant?.user;
                    return (
                      <div key={booking.id} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {tenant ? `${tenant.firstName[0]}${tenant.lastName[0]}` : '??'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {booking.property?.title}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Link
                            to={dashboardKeys.landlord.applicationReview.build(booking.id)}
                            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            <Eye className="h-3 w-3" /> Review
                          </Link>
                          <button
                            onClick={() => acceptMutation.mutate(booking.id)}
                            disabled={acceptMutation.isPending}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3" /> Accept
                          </button>
                          <button
                            onClick={() => declineMutation.mutate({ id: booking.id, reason: '' })}
                            disabled={declineMutation.isPending}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            <X className="h-3 w-3" /> Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Tenants */}
            <div className="rounded-2xl border border-border bg-background">
              <div className="border-b border-border p-4">
                <h3 className="font-bold">Active Tenants ({activeLeases.length})</h3>
              </div>
              {activeLeases.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No active tenants</p>
              ) : (
                <div className="divide-y divide-border">
                  {activeLeases.slice(0, 5).map((booking) => {
                    const tenant = booking.tenant?.user;
                    return (
                      <div key={booking.id} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                            {tenant ? `${tenant.firstName[0]}${tenant.lastName[0]}` : '??'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {booking.property?.title}
                            </p>
                          </div>
                          <Link
                            to={dashboardKeys.landlord.detail.build(booking.propertyId)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
