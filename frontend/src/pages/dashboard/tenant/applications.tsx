import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Download, FileText, Home, Search } from 'lucide-react';
import { dashboardKeys, publicKeys } from '@/routes/keys';
import { useTenantBookingsQuery } from '@/services/tenant/queries';
import { formatDate, formatNaira } from '@/lib/utils';

const statusColors: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  AWAITING_PAYMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  DECLINED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const statusLabels: Record<string, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  AWAITING_PAYMENT: 'Awaiting Payment',
  PAID: 'Paid',
  ACTIVE: 'Active',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
};

const TenantApplicationsPage = () => {
  const { data, isLoading } = useTenantBookingsQuery();
  const bookings = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-48 rounded-lg bg-shimmer" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">My Applications</h1>
              <p className="mt-1 text-muted-foreground">Track your rental applications and agreements</p>
            </div>
            <Link
              to={publicKeys.search.path}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Browse properties
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-1 font-medium">No applications yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Complete your profile then start browsing properties to apply.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to={dashboardKeys.tenant.onboarding.path}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Complete Profile
                </Link>
                <Link
                  to={publicKeys.search.path}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.code}
                  className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="truncate font-display text-lg font-bold">
                          {booking.property?.title || 'Property'}
                        </h3>
                        <span
                          className={`flex-shrink-0 rounded-lg px-2.5 py-0.5 text-xs font-semibold ${statusColors[booking.status] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {statusLabels[booking.status] ?? booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {booking.property?.address}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Applied {formatDate(booking.rentStart)}
                        </span>
                        {booking.property?.priceMonthly ? (
                          <span className="font-medium text-foreground">
                            {formatNaira(booking.property.priceMonthly)}/month
                          </span>
                        ) : null}
                        {booking.lease?.status ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Lease: {booking.lease.status}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 gap-2">
                      {booking.lease?.agreementUrl ? (
                        <a
                          href={booking.lease.agreementUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Agreement
                        </a>
                      ) : null}
                      {booking.lease?.pdfUrl && booking.lease.pdfUrl !== booking.lease.agreementUrl ? (
                        <a
                          href={booking.lease.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Lease
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantApplicationsPage;
