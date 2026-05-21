import { Link } from 'react-router-dom';
import { ArrowRight, Bell, ClipboardCheck, FileText, Home, Pencil, Search, UserCheck } from 'lucide-react';
import { dashboardKeys, publicKeys } from '@/routes/keys';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useTenantBookingsQuery, useTenantProfileQuery } from '@/services/tenant/queries';
import { formatDate, formatNaira } from '@/lib/utils';

export default function TenantDashboardPage() {
  const { user } = useAuthManager();
  const { data } = useTenantBookingsQuery();
  const { data: profileData } = useTenantProfileQuery();
  const bookings = data?.data ?? [];
  const activeBooking = bookings.find((booking) => booking.status === 'ACTIVE');
  const isOnboarded = profileData?.data?.isOnboarded ?? user?.tenant?.isOnboarded;

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Welcome, {user?.firstName}</h1>
          <p className="mt-1 text-muted-foreground">Your rental hub</p>
        </div>

        {/* Onboarding prompt */}
        {!isOnboarded ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-amber-900 dark:text-amber-100">
                  Complete your profile
                </h3>
                <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
                  Fill in your employment, financial, and identity details so landlords can review your application.
                </p>
                <Link
                  to={dashboardKeys.tenant.onboarding.path}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                >
                  <UserCheck className="h-4 w-4" />
                  Complete Onboarding
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {activeBooking ? (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">Active lease</p>
                <h2 className="font-display text-xl font-bold">{activeBooking.property?.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeBooking.property?.address}</p>
              </div>
              <Link
                to={dashboardKeys.tenant.applications.path}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View lease
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Monthly rent', value: formatNaira(activeBooking.property?.priceMonthly) },
                { label: 'Lease start', value: formatDate(activeBooking.rentStart) },
                { label: 'Lease end', value: formatDate(activeBooking.rentEnd) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-0.5 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-border bg-background p-8 text-center">
            <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 font-medium">No active lease</h3>
            <p className="mb-4 text-sm text-muted-foreground">Start browsing to find your next home</p>
            <Link
              to={publicKeys.search.path}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Browse properties
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Search, label: 'Browse homes', desc: 'Find a new property', href: publicKeys.search.path, color: 'text-blue-600 bg-blue-50' },
            { icon: FileText, label: 'My applications', desc: 'Track your bookings', href: dashboardKeys.tenant.applications.path, color: 'text-orange-600 bg-orange-50' },
            { icon: isOnboarded ? Pencil : UserCheck, label: isOnboarded ? 'Edit profile' : 'Complete profile', desc: isOnboarded ? 'Update your details' : 'Required to apply', href: dashboardKeys.tenant.onboarding.path, color: isOnboarded ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
            { icon: Bell, label: 'Notifications', desc: 'Stay up to date', href: dashboardKeys.tenant.applications.path, color: 'text-purple-600 bg-purple-50' },
          ].map(({ icon: Icon, label, desc, href, color }) => (
            <Link
              key={label}
              to={href}
              className="group rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-md hover:shadow-black/5"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-medium transition-colors group-hover:text-primary">{label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
