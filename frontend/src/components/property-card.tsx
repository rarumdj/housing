import { Link } from 'react-router-dom';
import { BedDouble, CheckCircle, MapPin, Video } from 'lucide-react';
import { publicKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import type { PropertySummary } from '@/types/domain';

const typeLabels: Record<string, string> = {
  SELF_CONTAINED: 'Self Con',
  ONE_BEDROOM: '1 Bed',
  TWO_BEDROOM: '2 Bed',
  THREE_BEDROOM: '3 Bed',
  FOUR_BEDROOM_PLUS: '4+ Bed',
  DUPLEX: 'Duplex',
  BUNGALOW: 'Bungalow',
  FLAT: 'Flat',
  MINI_FLAT: 'Mini Flat',
};

type PropertyCardProps = {
  property: PropertySummary;
  className?: string;
};

export const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const cover = property.media?.[0];
  const isVerified = property.verificationStatus === 'VERIFIED';
  const has3D = property.media?.some((media) => media.type === 'MODEL_3D' || media.type === 'TOUR_360');

  return (
    <Link
      to={publicKeys.property.build(property.code)}
      className={cn(
        'group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-black/5',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {(() => {
          if (!cover) {
            return (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-muted-foreground">No photo yet</span>
              </div>
            );
          }
          const isVideo = cover.type === 'VIDEO';
          const posterSrc = isVideo ? cover.thumbnailUrl : cover.url;
          if (posterSrc) {
            return (
              <img
                src={posterSrc}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            );
          }
          if (isVideo) {
            return <video src={cover.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />;
          }
          return (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm text-muted-foreground">No photo yet</span>
            </div>
          );
        })()}

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-lg bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {typeLabels[property.type] ?? property.type}
          </span>
          {isVerified ? (
            <span className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          ) : null}
          {has3D ? (
            <span className="flex items-center gap-1 rounded-lg bg-orange-500/90 px-2 py-1 text-xs font-medium text-white">
              <Video className="h-3 w-3" />
              3D
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">{property.title}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {property.lga}, {property.state}
          </span>
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="font-display text-xl font-bold">{formatNaira(property.priceAnnually)}</p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
          {(property._count?.rooms ?? 0) > 0 ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BedDouble className="h-4 w-4" />
              <span>{property._count?.rooms} rooms</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
