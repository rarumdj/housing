import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { NIGERIAN_STATES } from '@/lib/utils';
import { TextInput } from '@/components/forms/atoms/text-input';
import { FieldLabel } from '@/components/ui/field';
import { usePropertiesQuery } from '@/services/properties/queries';

const propertyTypes = [
  { value: '', label: 'All types' },
  { value: 'SELF_CONTAINED', label: 'Self Con' },
  { value: 'ONE_BEDROOM', label: '1 Bed' },
  { value: 'TWO_BEDROOM', label: '2 Bed' },
  { value: 'THREE_BEDROOM', label: '3 Bed' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'FLAT', label: 'Flat' },
];

const SearchPage = () => {
  const [urlParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    state: urlParams.get('state') ?? '',
    type: urlParams.get('type') ?? '',
    minPrice: '',
    maxPrice: '',
    isFurnished: false,
    hasGenerator: false,
    hasSecurity: false,
    has3DTour: false,
    sortBy: 'newest',
    page: 1,
  });

  const queryFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== false));
  const { data, isLoading, isFetching } = usePropertiesQuery(queryFilters);

  const setFilter = (key: string, value: unknown) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="sticky top-16 z-40 border-b border-border bg-background">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.state}
              onChange={(event) => setFilter('state', event.target.value)}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All states</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilter('type', type.value)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                    filters.type === type.value
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background hover:border-primary/40'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowFilters((current) => !current)}
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors hover:border-primary/40"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
              <div className="flex overflow-hidden rounded-xl border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {showFilters ? (
            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4">
              <div>
                <FieldLabel className="mb-1 text-xs text-muted-foreground">Min price (annual)</FieldLabel>
                <TextInput
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => setFilter('minPrice', event.target.value)}
                  placeholder="₦0"
                  className="w-36"
                />
              </div>
              <div>
                <FieldLabel className="mb-1 text-xs text-muted-foreground">Max price (annual)</FieldLabel>
                <TextInput
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => setFilter('maxPrice', event.target.value)}
                  placeholder="No limit"
                  className="w-36"
                />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                {[
                  ['isFurnished', 'Furnished'],
                  ['hasGenerator', 'Generator'],
                  ['hasSecurity', 'Security'],
                  ['has3DTour', '3D Tour'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key, !filters[key as keyof typeof filters])}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                      filters[key as keyof typeof filters]
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="ml-auto">
                <label className="mb-1 block text-xs text-muted-foreground">Sort by</label>
                <select
                  value={filters.sortBy}
                  onChange={(event) => setFilter('sortBy', event.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: Low to high</option>
                  <option value="price_desc">Price: High to low</option>
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Searching…' : `${data?.meta?.total ?? 0} properties found`}
            {isFetching && !isLoading ? <Loader2 className="ml-2 inline h-3 w-3 animate-spin" /> : null}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-border">
                <div className="aspect-[4/3] bg-shimmer" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded-lg bg-shimmer" />
                  <div className="h-3 w-1/2 rounded-lg bg-shimmer" />
                  <div className="h-6 w-1/3 rounded-lg bg-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.properties?.length ? (
          <div className="py-24 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-display text-xl font-bold">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or searching a different area</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {data.properties.map((property) => (
                <PropertyCard key={property.code} property={property} />
              ))}
            </div>

            {data.meta.pages > 1 ? (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: data.meta.pages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters((current) => ({ ...current, page }))}
                    className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors ${
                      filters.page === page
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
