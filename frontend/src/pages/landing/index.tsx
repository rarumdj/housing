import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, MapPin, Search, Shield, Star, Video } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { authKeys, publicKeys } from '@/routes/keys';
import { usePropertiesQuery } from '@/services/properties/queries';
import { NIGERIAN_STATES } from '@/lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const { data: featuredData } = usePropertiesQuery({ sortBy: 'newest', limit: 6 });
  const featuredProperties = featuredData?.properties ?? [];

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location) params.set('state', location);
    if (type) params.set('type', type);

    navigate(`${publicKeys.search.path}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-background to-background pb-32 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              100% Verified Properties
            </div>
            <h1 className="mb-6 text-5xl font-display font-extrabold leading-none tracking-tight text-foreground md:text-7xl">
              Find your next
              <br />
              <span className="text-primary">home online.</span>
              <br />
              No agents.
            </h1>
            <p className="mb-10 max-w-xl text-xl leading-relaxed text-muted-foreground">
              See verified properties through 3D walkthroughs, inspect every room, and sign your lease — all before leaving your couch.
            </p>

            <div className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-background p-2 shadow-lg shadow-black/5 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 px-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                >
                  <option value="">Any state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden w-px bg-border sm:block" />
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="flex-1 bg-transparent px-3 text-sm text-foreground outline-none"
              >
                <option value="">Any type</option>
                <option value="SELF_CONTAINED">Self Contained</option>
                <option value="ONE_BEDROOM">1 Bedroom</option>
                <option value="TWO_BEDROOM">2 Bedroom</option>
                <option value="THREE_BEDROOM">3 Bedroom</option>
                <option value="DUPLEX">Duplex</option>
              </select>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {[
                ['2,400+', 'Verified Properties'],
                ['1,800+', 'Happy Tenants'],
                ['₦4.2B+', 'Rent Processed'],
              ].map(([number, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{number}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-display font-bold">How HouseHunt works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Three steps to your new home</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Search, step: '01', title: 'Search & filter', desc: 'Browse verified properties in your city. Filter by price, location, type, and amenities.' },
              { icon: Video, step: '02', title: 'Inspect online', desc: 'Walk through every room in 3D. See all fixtures, fittings, and dimensions without leaving home.' },
              { icon: FileText, step: '03', title: 'Pay & sign', desc: 'Apply, get screened, sign digitally, and pay securely. Move in with a code.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-border bg-background p-8">
                <span className="absolute right-6 top-4 font-display text-6xl font-extrabold text-muted/50">{step}</span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProperties.length > 0 ? (
        <section className="py-24">
          <div className="container">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display font-bold">Recently listed</h2>
                <p className="mt-1 text-muted-foreground">Fresh properties, verified and ready</p>
              </div>
              <button
                onClick={() => navigate(publicKeys.search.path)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-4xl font-display font-bold leading-tight">Built to prevent fake listings</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Every property on HouseHunt is verified. Landlords record videos on-location with GPS verification, and documents are reviewed before any listing goes live.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'GPS-verified video recording — no pre-recorded uploads',
                  'C of O, deed, and survey plan verification',
                  'BVN identity check for all landlords',
                  'Escrow payments — funds held until move-in confirmed',
                  'Digital lease with legal backing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Landlord verified', icon: Shield, color: 'bg-emerald-500/10 text-emerald-600' },
                { label: 'GPS video', icon: Video, color: 'bg-orange-500/10 text-orange-600' },
                { label: 'Legal lease', icon: FileText, color: 'bg-blue-500/10 text-blue-600' },
                { label: 'Trusted reviews', icon: Star, color: 'bg-yellow-500/10 text-yellow-600' },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-border bg-background p-6 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="rounded-3xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="mb-4 text-4xl font-display font-bold">Ready to find your home?</h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join thousands of Nigerians who found their home online.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate(`${authKeys.register.path}?role=TENANT`)}
                className="rounded-xl bg-background px-8 py-3 font-semibold text-foreground transition-colors hover:bg-background/90"
              >
                Find a home
              </button>
              <button
                onClick={() => navigate(`${authKeys.register.path}?role=LANDLORD`)}
                className="rounded-xl border border-primary-foreground/30 bg-primary-foreground/20 px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/30"
              >
                List your property
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 HouseHunt. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
