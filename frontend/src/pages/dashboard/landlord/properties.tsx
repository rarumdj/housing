import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import { SearchField } from '@/components/forms/search-field';
import { useMyPropertiesQuery, useDeletePropertyMutation } from '@/services/properties/queries';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'RENTED', 'DRAFT', 'PENDING_VERIFICATION', 'ARCHIVED'] as const;

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  RENTED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

const LandlordPropertiesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useMyPropertiesQuery();
  const deleteMutation = useDeletePropertyMutation();
  const properties = data?.data ?? [];

  const filtered = properties.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <button
          onClick={() => navigate(dashboardKeys.landlord.home.path)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-2xl font-bold">My Properties</h1>
          <Link
            to={dashboardKeys.landlord.create.path}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <SearchField
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties..."
          />

          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  s === filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {s === 'PENDING_VERIFICATION' ? 'Pending' : s.charAt(0) + s.slice(1).toLowerCase()}
                {s !== 'ALL' && (
                  <span className="ml-1 opacity-70">
                    ({properties.filter((p) => p.status === s).length})
                  </span>
                )}
                {s === 'ALL' && <span className="ml-1 opacity-70">({properties.length})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                <div className="h-20 w-28 flex-shrink-0 rounded-xl bg-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/2 rounded bg-shimmer" />
                  <div className="h-4 w-1/3 rounded bg-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-2 font-medium">No properties found</p>
            <p className="text-sm text-muted-foreground">
              {filter !== 'ALL' ? 'Try a different filter' : 'Add your first property to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((property) => (
              <div
                key={property.code}
                className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted/30"
              >
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {property.media?.[0] ? (
                    <img src={property.media[0].url} alt={property.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{property.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {property.lga}, {property.state}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('rounded-lg px-2 py-0.5 text-xs font-medium', statusBadge[property.status ?? ''] ?? 'bg-muted text-muted-foreground')}>
                      {(property.status ?? 'UNKNOWN').replace('_', ' ')}
                    </span>
                    {property._count?.bookings !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {property._count.bookings} application{property._count.bookings !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">{formatNaira(property.priceAnnually)}<span className="text-xs font-normal text-muted-foreground">/yr</span></p>
                </div>

                <div className="flex items-center gap-1">
                  {['DRAFT', 'ARCHIVED'].includes(property.status ?? '') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(property.code);
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    to={dashboardKeys.landlord.detail.build(property.code)}
                    className="rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordPropertiesPage;
