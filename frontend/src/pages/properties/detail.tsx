import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ImageOff,
  Loader2,
  MapPin,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { PropertyLiveTour } from '@/components/property-live-tour';
import type {
  Property,
  PropertyDetail,
  PropertyMedia,
  PropertyRoomScan,
  PropertyTourHotspot,
  PropertyTourLink,
  PropertyTourStop,
} from '@/types/domain';
import { dashboardKeys, publicKeys } from '@/routes/keys';
import { usePropertyQuery } from '@/services/properties/queries';
import { useVerifyPropertyMutation } from '@/services/admin/queries';
import { useApplyMutation } from '@/services/bookings/queries';
import { useTenantProfileQuery } from '@/services/tenant/queries';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { formatDate, formatNaira } from '@/lib/utils';
import {
  canDisplayMediaInBrowser,
  getDisplayPhotos,
  getDisplayVideos,
  getPanoramaTourMedia,
  isPlaceholderStorageUrl,
} from '@/lib/media';

const AmenityBadge = ({ active, children }: { active: boolean; children: string }) => {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {children}
    </span>
  );
};

const AmenitiesIncluded = ({ amenities }: { amenities: string[] }) => {
  const [open, setOpen] = useState(false);

  if (amenities.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border pt-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <h3 className="text-sm font-semibold">What's included ({amenities.length})</h3>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="mt-3 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <AmenityBadge key={amenity} active>{amenity}</AmenityBadge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const InfoChip = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
};

const verStatusStyle: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  UNDER_REVIEW: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const AdminActions = ({ propertyId, verificationStatus }: { propertyId: string; verificationStatus: string }) => {
  const navigate = useNavigate();
  const verifyMutation = useVerifyPropertyMutation();
  const isPending = verificationStatus === 'PENDING' || verificationStatus === 'UNDER_REVIEW';
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  const handleAction = (status: 'VERIFIED' | 'REJECTED') => {
    verifyMutation.mutate(
      { id: propertyId, verificationStatus: status },
      { onSuccess: () => { setActionTaken(status === 'VERIFIED' ? 'approved' : 'rejected'); setTimeout(() => navigate(dashboardKeys.admin.properties.path), 1200); } },
    );
  };

  const displayStatus = actionTaken ? (actionTaken === 'approved' ? 'VERIFIED' : 'REJECTED') : verificationStatus;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Verification</p>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${verStatusStyle[displayStatus] ?? 'bg-muted text-muted-foreground'}`}>{displayStatus}</span>
      </div>
      {actionTaken ? (
        <p className="text-xs text-muted-foreground">Redirecting back…</p>
      ) : isPending ? (
        <div className="flex gap-2">
          <button onClick={() => handleAction('VERIFIED')} disabled={verifyMutation.isPending} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"><Check className="h-4 w-4" /> Approve</button>
          <button onClick={() => handleAction('REJECTED')} disabled={verifyMutation.isPending} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"><X className="h-4 w-4" /> Reject</button>
        </div>
      ) : null}
    </div>
  );
};

const ApplyButton = ({ propertyId }: { propertyId: string }) => {
  const { user, isAuthenticated } = useAuthManager();
  const navigate = useNavigate();
  const applyMutation = useApplyMutation();
  const { data: profileData } = useTenantProfileQuery();
  const isOnboarded = profileData?.data?.isOnboarded ?? user?.tenant?.isOnboarded;
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isAuthenticated || user?.role !== 'TENANT') return null;

  if (!isOnboarded) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Complete your profile before applying</p>
        <button onClick={() => navigate(dashboardKeys.tenant.onboarding.path)} className="mt-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700">Complete Profile</button>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <Check className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Application submitted!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showForm ? (
        <>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself to the landlord (optional)" rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <div className="flex gap-2">
            <button
              onClick={() => applyMutation.mutate({ propertyId, message: message || undefined }, { onSuccess: () => setApplied(true) })}
              disabled={applyMutation.isPending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Application
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted">Cancel</button>
          </div>
          {applyMutation.isError && (
            <p className="text-xs text-red-600">{(applyMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to apply'}</p>
          )}
        </>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Send className="h-4 w-4" /> Apply for this Property
        </button>
      )}
    </div>
  );
}

const PropertyDetailPage = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const isAdminPreview = location.pathname.startsWith('/admin/');
  const { data, isLoading, isError } = usePropertyQuery(id);
  const property = data?.data;
  const mediaList = property?.media;

  const photos = useMemo(() => getDisplayPhotos(mediaList ?? []), [mediaList]);
  const videos = useMemo(() => getDisplayVideos(mediaList ?? []), [mediaList]);
  const panoramaMedia = useMemo(() => getPanoramaTourMedia(mediaList ?? []), [mediaList]);
  const allDisplayable = useMemo(() => (mediaList ?? []).filter((m) => canDisplayMediaInBrowser(m.url)), [mediaList]);
  const has3DTour = panoramaMedia.length > 0;
  const tourProperty = property && has3DTour ? buildTourProperty(property, panoramaMedia) : null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => { setActivePhotoIdx(0); setHeroImageFailed(false); setLightboxIdx(null); }, [property?.code]);

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
          <Link to={publicKeys.search.path} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"><ChevronLeft className="h-4 w-4" />Back to search</Link>
        </div>
      </div>
    );
  }

  const activePhoto = photos[activePhotoIdx] ?? photos[0];
  const showPhotoHero = Boolean(activePhoto?.url) && !heroImageFailed;
  const firstVideo = videos[0];
  const hasRenderableMedia = photos.length > 0 || (firstVideo && firstVideo.url && !isPlaceholderStorageUrl(firstVideo.url));
  const anyMediaButOnlyLocal = (property.media?.length ?? 0) > 0 && !hasRenderableMedia && property.media?.some((m) => isPlaceholderStorageUrl(m.url));
  const isVideo = (m: PropertyMedia) => m.type === 'VIDEO' || /\.(mp4|webm|ogg)(\?|$)/i.test(m.url ?? '');

  return (
    <div className="bg-muted/10">
      <div className="container py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <Link to={isAdminPreview ? dashboardKeys.admin.properties.path : publicKeys.search.path} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />{isAdminPreview ? 'Back to property management' : 'Back to search'}
          </Link>

          <div className="grid items-start gap-6 lg:grid-cols-[1.5fr,0.9fr]">
            <section className="self-start overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="relative aspect-[16/10] bg-muted">
                {showPhotoHero ? (
                  <img src={activePhoto!.url} alt={property.title} className="h-full w-full cursor-pointer object-cover" onError={() => setHeroImageFailed(true)} onClick={() => { const idx = allDisplayable.findIndex((m) => m.code === activePhoto!.code); setLightboxIdx(idx >= 0 ? idx : 0); }} />
                ) : firstVideo && !isPlaceholderStorageUrl(firstVideo.url) ? (
                  <video key={firstVideo.code ?? firstVideo.url} src={firstVideo.url} className="h-full w-full object-cover" controls playsInline poster={firstVideo.thumbnailUrl ?? undefined} />
                ) : anyMediaButOnlyLocal ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"><ImageOff className="h-10 w-10 opacity-50" /><p>Media stored locally (Cloudinary not configured).</p></div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo or video available</div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-6 text-white">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">{property.type.replace(/_/g, ' ')}</span>
                    {property.verificationStatus === 'VERIFIED' ? (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white"><CheckCircle2 className="h-3.5 w-3.5" />Verified</span>) : null}
                    {has3DTour ? (<span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white"><Sparkles className="h-3.5 w-3.5" />3D Tour</span>) : null}
                  </div>
                  <h1 className="font-display text-3xl font-bold md:text-4xl">{property.title}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/90"><MapPin className="h-4 w-4 flex-shrink-0" />{property.address}, {property.lga}, {property.state}</p>
                </div>
              </div>
              {photos.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-border p-3">
                  {photos.map((m, idx) => (
                    <button key={m.code ?? idx} type="button" onClick={() => { setActivePhotoIdx(idx); setHeroImageFailed(false); }} className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-background transition-all ${idx === activePhotoIdx ? 'ring-primary' : 'ring-transparent opacity-80 hover:opacity-100'}`}>
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-border bg-card p-6">
                {isAdminPreview ? (<><AdminActions propertyId={id} verificationStatus={property.verificationStatus} /><hr className="my-4 border-border" /></>) : null}
                <p className="text-sm text-muted-foreground">Annual rent</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-foreground">{formatNaira(property.priceAnnually)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatNaira(property.priceMonthly)} monthly equivalent</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <InfoChip icon={BedDouble} label="Rooms" value={`${property._count?.rooms ?? 0}`} />
                  <InfoChip icon={CalendarDays} label="Available" value={formatDate(property.availableFrom)} />
                  <InfoChip icon={ShieldCheck} label="Security" value={property.hasSecurity ? 'Yes' : 'No'} />
                  <InfoChip icon={Zap} label="Generator" value={property.hasGenerator ? 'Yes' : 'No'} />
                </div>
                {!isAdminPreview ? (<div className="mt-6"><ApplyButton propertyId={id} /></div>) : null}
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
                <AmenitiesIncluded amenities={property.amenities ?? []} />
              </div>
            </aside>
          </div>

          {allDisplayable.length > 1 ? (
            <div className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">All media ({allDisplayable.length})</h2>
              <p className="mt-1 text-sm text-muted-foreground">Photos, videos, and 3D media for this listing. Click to expand.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {allDisplayable.map((m, idx) => (
                  <button key={m.code ?? idx} type="button" onClick={() => setLightboxIdx(idx)} className="group relative aspect-video overflow-hidden rounded-xl bg-muted">
                    {isVideo(m) ? (
                      <>{m.thumbnailUrl && canDisplayMediaInBrowser(m.thumbnailUrl) ? (<img src={m.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />) : (<video src={m.url} className="h-full w-full object-cover" muted preload="metadata" />)}<div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="h-8 w-8 text-white drop-shadow-lg" /></div></>
                    ) : (<img src={m.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />)}
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">{m.type === 'TOUR_360' ? '360°' : m.type === 'MODEL_3D' ? '3D' : m.type ?? 'PHOTO'}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {videos.length > 0 ? (
            <div className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold">Videos ({videos.length})</h2>
              <div className="mt-4 space-y-4">
                {videos.map((v, i) => (<div key={v.code ?? i} className="overflow-hidden rounded-2xl bg-muted"><video src={v.url} className="max-h-[70vh] w-full" controls playsInline poster={v.thumbnailUrl ?? undefined} /></div>))}
              </div>
            </div>
          ) : null}

          {tourProperty ? (<div className="mt-2"><PropertyLiveTour property={tourProperty} /></div>) : null}

          {lightboxIdx !== null && allDisplayable[lightboxIdx] ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxIdx(null)}>
              <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30" onClick={() => setLightboxIdx(null)}><X className="h-6 w-6" /></button>
              {lightboxIdx > 0 ? (<button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}><ChevronLeft className="h-6 w-6" /></button>) : null}
              {lightboxIdx < allDisplayable.length - 1 ? (<button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur hover:bg-white/30" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}><ChevronLeft className="h-6 w-6 rotate-180" /></button>) : null}
              <div className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
                {isVideo(allDisplayable[lightboxIdx]) ? (<video src={allDisplayable[lightboxIdx].url} className="max-h-[85vh] w-auto" controls autoPlay playsInline />) : (<img src={allDisplayable[lightboxIdx].url} alt="" className="max-h-[85vh] w-auto object-contain" />)}
              </div>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">{lightboxIdx + 1} / {allDisplayable.length}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const buildTourProperty = (property: PropertyDetail, tourMedia: PropertyMedia[]): Property => {
  const roomNames = ['Living room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Study'];
  const baseHighlights = [
    ...(property.hasSecurity ? ['Security ready'] : []),
    ...(property.hasGenerator ? ['Power backup'] : []),
    ...(property.hasParking ? ['Parking access'] : []),
    ...(property.isFurnished ? ['Furnished'] : ['Flexible furnishing']),
  ];

  const tourStops: PropertyTourStop[] = tourMedia.map((media, index) => {
    const roomLabel = roomNames[index % roomNames.length];
    const previousId = tourMedia[index - 1]?.code || `tour-stop-${index - 1}`;
    const nextId = tourMedia[index + 1]?.code || `tour-stop-${index + 1}`;
    const links: PropertyTourLink[] = [];
    if (index > 0) links.push({ nodeId: previousId, yaw: -1.8, pitch: 0.02 });
    if (index < tourMedia.length - 1) links.push({ nodeId: nextId, yaw: 1.2, pitch: 0.04 });

    const hotspots: PropertyTourHotspot[] = [
      { id: `${media.code || index}-feature-1`, label: roomLabel, yaw: -0.35, pitch: -0.02, note: `This ${roomLabel.toLowerCase()} reflects the listing finish shown in the current inspection scene.` },
      { id: `${media.code || index}-feature-2`, label: property.hasSecurity ? 'Security point' : 'Access point', yaw: 0.65, pitch: 0.08, note: property.hasSecurity ? 'Entry monitoring and secure access can be checked from this angle.' : 'Use this angle to confirm access flow and circulation.' },
    ];

    return {
      id: media.code || `tour-stop-${index}`,
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
      { label: `${stop.roomLabel || stop.label} finish`, status: 'checked', note: `Surface condition and visual finish are visible in scene ${index + 1}.` },
      { label: property.hasGenerator ? 'Power support' : 'Natural lighting', status: property.hasGenerator ? 'available' : 'visible', note: property.hasGenerator ? 'Backup power is listed for this property and can be validated with the tour context.' : 'Use the panorama to confirm daylight entry and room openness.' },
    ],
  }));

  return { ...property, media: property.media as PropertyMedia[], tourStops, roomScans };
};

export default PropertyDetailPage;
