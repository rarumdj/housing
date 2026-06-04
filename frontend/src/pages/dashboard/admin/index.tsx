import { Link } from 'react-router-dom';
import { Users, Home, DollarSign, Shield, Clock, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { formatNaira } from '@/lib/utils';
import { useAdminOverviewQuery, useAdminRevenueQuery } from '@/services/admin/queries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboardPage = () => {
  const { data: overviewData, isLoading } = useAdminOverviewQuery();
  const { data: revenueData } = useAdminRevenueQuery();

  const overview = overviewData?.data;
  const revenueRaw = revenueData?.data ?? [];

  const monthlyMap = new Map<string, { month: string; rent: number; fees: number }>();
  for (const r of revenueRaw) {
    const existing = monthlyMap.get(r.month) ?? { month: r.month, rent: 0, fees: 0 };
    if (r.type === 'PLATFORM_FEE') {
      existing.fees += r.total;
    } else {
      existing.rent += r.total;
    }
    monthlyMap.set(r.month, existing);
  }
  const chartData = Array.from(monthlyMap.values()).slice(-12);

  const getUserCount = (role: string) =>
    Number(overview?.usersByRole.find((r) => r.role === role)?.count ?? 0);

  const totalUsers = overview?.usersByRole.reduce((sum, r) => sum + Number(r.count), 0) ?? 0;

  const getPropertyCount = (status: string) =>
    overview?.propertiesByStatus.find((s) => s.status === status)?.count ?? 0;

  const totalProperties = overview?.propertiesByStatus.reduce((sum, s) => sum + Number(s.count), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link to={dashboardKeys.admin.users.path} className="rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-muted/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{totalUsers}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Total Users</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{getUserCount('LANDLORD')} landlords</span>
              <span>{getUserCount('TENANT')} tenants</span>
              <span>{getUserCount('ADMIN')} admins</span>
            </div>
          </Link>

          <Link to={dashboardKeys.admin.properties.path} className="rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-muted/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{totalProperties}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Properties</p>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span>{getPropertyCount('ACTIVE')} active</span>
              <span>{getPropertyCount('RENTED')} rented</span>
            </div>
          </Link>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{formatNaira(overview?.totalRevenue ?? 0)}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Total Revenue</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatNaira(overview?.platformFeeTotal ?? 0)} in platform fees
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold">{overview?.activeLeases ?? 0}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Active Leases</p>
          </div>
        </div>

        {/* Pending Items */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <Link to={`${dashboardKeys.admin.users.path}?role=LANDLORD`} className="flex items-center gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 transition-colors hover:bg-yellow-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-yellow-700">{overview?.pendingLandlords ?? 0}</p>
              <p className="text-sm text-yellow-600">Pending Landlord Verifications</p>
            </div>
            <ArrowRight className="h-5 w-5 text-yellow-600" />
          </Link>

          <Link to={`${dashboardKeys.admin.users.path}?role=TENANT`} className="flex items-center gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 transition-colors hover:bg-yellow-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-yellow-700">{overview?.pendingTenants ?? 0}</p>
              <p className="text-sm text-yellow-600">Pending Tenant KYC</p>
            </div>
            <ArrowRight className="h-5 w-5 text-yellow-600" />
          </Link>

          <Link to={`${dashboardKeys.admin.properties.path}?verificationStatus=PENDING`} className="flex items-center gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/50 p-5 transition-colors hover:bg-yellow-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
              <Home className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-yellow-700">{overview?.pendingProperties ?? 0}</p>
              <p className="text-sm text-yellow-600">Properties Awaiting Approval</p>
            </div>
            <ArrowRight className="h-5 w-5 text-yellow-600" />
          </Link>
        </div>

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend />
                <Bar dataKey="rent" name="Rent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fees" name="Platform Fees" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link to={dashboardKeys.admin.users.path} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/30">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Manage Users</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to={dashboardKeys.admin.properties.path} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/30">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-medium">Manage Properties</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to={dashboardKeys.admin.fees.path} className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/30">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="font-medium">Fee Configuration</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
