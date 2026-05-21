import { Check, Clock, XCircle, CreditCard, Home, UserCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandlordBooking } from '@/types/domain';

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  APPLIED: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Applied' },
  UNDER_REVIEW: { icon: AlertCircle, color: 'text-orange-600 bg-orange-50', label: 'Under Review' },
  ACCEPTED: { icon: Check, color: 'text-emerald-600 bg-emerald-50', label: 'Accepted' },
  DECLINED: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Declined' },
  AWAITING_PAYMENT: { icon: CreditCard, color: 'text-blue-600 bg-blue-50', label: 'Awaiting Payment' },
  PAID: { icon: CreditCard, color: 'text-emerald-600 bg-emerald-50', label: 'Paid' },
  ACTIVE: { icon: Home, color: 'text-primary bg-primary/10', label: 'Active' },
  ENDED: { icon: XCircle, color: 'text-muted-foreground bg-muted', label: 'Ended' },
  CANCELLED: { icon: XCircle, color: 'text-muted-foreground bg-muted', label: 'Cancelled' },
};

interface ActivityTimelineProps {
  bookings: LandlordBooking[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
  onMessage?: (tenantUserId: string, propertyId: string) => void;
}

export function ActivityTimeline({ bookings, onAccept, onDecline, onCancel, onMessage }: ActivityTimelineProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <UserCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Applications will appear here once tenants apply</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.APPLIED;
        const Icon = config.icon;
        const tenant = booking.tenant?.user;
        const isActionable = ['APPLIED', 'UNDER_REVIEW'].includes(booking.status);
        const isCancellable = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'AWAITING_PAYMENT'].includes(booking.status);

        return (
          <div key={booking.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full', config.color)}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant'}
                  </p>
                  <span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', config.color)}>
                    {config.label}
                  </span>
                </div>

                {tenant && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {tenant.email} &middot; {tenant.phone}
                  </p>
                )}

                {booking.message && (
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    &ldquo;{booking.message}&rdquo;
                  </p>
                )}

                {booking.lease && (
                  <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">
                    <span className="font-medium">Lease:</span>{' '}
                    {new Date(booking.lease.rentStartDate).toLocaleDateString()} &ndash;{' '}
                    {new Date(booking.lease.rentEndDate).toLocaleDateString()}
                    <span className={cn('ml-2 rounded px-1.5 py-0.5', STATUS_CONFIG[booking.lease.status]?.color ?? 'bg-muted')}>
                      {booking.lease.status}
                    </span>
                  </div>
                )}

                <p className="mt-2 text-xs text-muted-foreground">
                  Applied {new Date(booking.appliedAt).toLocaleDateString()}
                  {booking.acceptedAt && ` · Accepted ${new Date(booking.acceptedAt).toLocaleDateString()}`}
                  {booking.paidAt && ` · Paid ${new Date(booking.paidAt).toLocaleDateString()}`}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {isActionable && onAccept && (
                    <button
                      onClick={() => onAccept(booking.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                  )}
                  {isActionable && onDecline && (
                    <button
                      onClick={() => onDecline(booking.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Decline
                    </button>
                  )}
                  {isCancellable && onCancel && (
                    <button
                      onClick={() => onCancel(booking.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                  )}
                  {tenant && onMessage && (
                    <button
                      onClick={() => onMessage(tenant.id, booking.propertyId)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
