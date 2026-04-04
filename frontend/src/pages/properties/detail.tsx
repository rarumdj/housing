import { Link, useParams } from 'react-router-dom';
import { BedDouble, CalendarDays, CheckCircle2, ChevronLeft, MapPin, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PropertyLiveTour } from '@/components/property-live-tour';
import type { Property, PropertyDetail, PropertyMedia, PropertyRoomScan, PropertyTourHotspot, PropertyTourLink, PropertyTourStop } from '@/types/domain';
import { publicKeys } from '@/routes/keys';
import { usePropertyQuery } from '@/services/properties/queries';
import { formatDate, formatNaira } from '@/lib/utils';

function AmenityBadge({ active, children }: { active: boolean; children: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {children}
    </span>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError } = usePropertyQuery(id);
  const property = data?.data;

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-6 w-40 rounded-lg bg-shimmer" />
          <div className="grid gap-6 lg:grid-cols-[1.5fr,0.9fr]">
            <div className="aspect-[16/10] rounded-3xl bg-shimmer" />
            <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
              <div className="h-8 w-3/4 rounded-lg bg-shimmer" />
              <div className="h-4 w-1/2 rounded-lg bg-shimmer" />
              <div className="h-20 rounded-2xl bg-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center">
          <h1 className="font-display text-3xl font-bold">Property not found</h1>
          <p className="mt-3 text-muted-foreground">This listing is unavailable or the link is incomplete.</p>
          <Link
            to={publicKeys.search.path}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const cover = property.media?.[0];
  const has3DTour = property.media?.some((item) => item.type === 'MODEL_3D' || item.type === 'TOUR_360');
  const tourProperty = has3DTour ? buildTourProperty(property) : null;

  return (
    <div className="bg-muted/10">
      <div className="container py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to={publicKeys.search.path}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to search
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.5fr,0.9fr]">
            <section className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="relative aspect-[16/10] bg-muted">
                {cover ? (
                  <img src={cover.url} alt={property.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo available</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-6 text-white">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      {property.type.replace(/_/g, ' ')}
                    </span>
                    {property.verificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                    {has3DTour ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        3D Tour
                      </span>
                    ) : null}
                  </div>
                  <h1 className="font-display text-3xl font-bold md:text-4xl">{property.title}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {property.address}, {property.lga}, {property.state}
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">Annual rent</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-foreground">{formatNaira(property.priceAnnually)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatNaira(property.priceMonthly)} monthly equivalent</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <InfoChip icon={BedDouble} label="Rooms" value={`${property._count?.rooms ?? 0}`} />
                  <InfoChip icon={CalendarDays} label="Available" value={formatDate(property.availableFrom)} />
                  <InfoChip icon={ShieldCheck} label="Security" value={property.hasSecurity ? 'Yes' : 'No'} />
                  <InfoChip icon={Zap} label="Generator" value={property.hasGenerator ? 'Yes' : 'No'} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold">About this property</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <AmenityBadge active={!!property.hasParking}>Parking</AmenityBadge>
                  <AmenityBadge active={!!property.hasSecurity}>Security</AmenityBadge>
                  <AmenityBadge active={!!property.hasGenerator}>Generator</AmenityBadge>
                  <AmenityBadge active={!!property.isFurnished}>Furnished</AmenityBadge>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-8">
            {tourProperty ? <PropertyLiveTour property={tourProperty} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildTourProperty(property: PropertyDetail): Property {
  const tourMedia = (property.media || []).filter(
    (item) => item.type === 'MODEL_3D' || item.type === 'TOUR_360'
  );

  const roomNames = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Study'];
  const baseHighlights = [
    ...(property.hasSecurity ? ['Security ready'] : []),
    ...(property.hasGenerator ? ['Power backup'] : []),
    ...(property.hasParking ? ['Parking access'] : []),
    ...(property.isFurnished ? ['Furnished'] : ['Flexible furnishing']),
  ];

  const tourStops: PropertyTourStop[] = tourMedia.map((media, index) => {
    const roomLabel = roomNames[index % roomNames.length];
    const previousId = tourMedia[index - 1]?.id || `tour-stop-${index - 1}`;
    const nextId = tourMedia[index + 1]?.id || `tour-stop-${index + 1}`;
    const links: PropertyTourLink[] = [];

    if (index > 0) {
      links.push({ nodeId: previousId, yaw: -1.8, pitch: 0.02 });
    }

    if (index < tourMedia.length - 1) {
      links.push({ nodeId: nextId, yaw: 1.2, pitch: 0.04 });
    }

    const hotspots: PropertyTourHotspot[] = [
      {
        id: `${media.id || index}-feature-1`,
        label: roomLabel,
        yaw: -0.35,
        pitch: -0.02,
        note: `This ${roomLabel.toLowerCase()} reflects the listing finish shown in the current inspection scene.`,
      },
      {
        id: `${media.id || index}-feature-2`,
        label: property.hasSecurity ? 'Security point' : 'Access point',
        yaw: 0.65,
        pitch: 0.08,
        note: property.hasSecurity
          ? 'Entry monitoring and secure access can be checked from this angle.'
          : 'Use this angle to confirm access flow and circulation.',
      },
    ];

    return {
      id: media.id || `tour-stop-${index}`,
      label: `${roomLabel} ${index + 1}`,
      description: property.description,
      panoramaUrl: media.url,
      thumbnailUrl: media.thumbnailUrl || media.url,
      kind: media.type === 'MODEL_3D' ? '3D model' : '360 scene',
      captureNote: `Inspect the ${roomLabel.toLowerCase()} remotely and compare the scene against the listing description, amenities, and room flow.`,
      highlights: baseHighlights.slice(0, 3).length > 0 ? baseHighlights.slice(0, 3) : ['Remote inspection', 'Scene linked', 'Tour ready'],
      dimensions: `${Math.max((property._count?.rooms || 1) * 3, 6)}m visual span`,
      roomLabel,
      links,
      hotspots,
    };
  });

  const roomScans: PropertyRoomScan[] = tourStops.map((stop, index) => ({
    room: stop.roomLabel || stop.label,
    fixtures: [
      {
        label: `${stop.roomLabel || stop.label} finish`,
        status: 'checked',
        note: `Surface condition and visual finish are visible in scene ${index + 1}.`,
      },
      {
        label: property.hasGenerator ? 'Power support' : 'Natural lighting',
        status: property.hasGenerator ? 'available' : 'visible',
        note: property.hasGenerator
          ? 'Backup power is listed for this property and can be validated with the tour context.'
          : 'Use the panorama to confirm daylight entry and room openness.',
      },
    ],
  }));

  return {
    ...property,
    media: property.media as PropertyMedia[],
    tourStops,
    roomScans,
  };
}
