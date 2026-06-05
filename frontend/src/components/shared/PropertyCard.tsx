import { Link } from 'react-router-dom';
import { MapPin, BedDouble, CheckCircle, Video } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  SELF_CONTAINED:'Self Con', ONE_BEDROOM:'1 Bed', TWO_BEDROOM:'2 Bed',
  THREE_BEDROOM:'3 Bed', FOUR_BEDROOM_PLUS:'4+ Bed', DUPLEX:'Duplex',
  BUNGALOW:'Bungalow', FLAT:'Flat', MINI_FLAT:'Mini Flat',
};

interface Property {
  id?: string; code: string; title: string; address: string; lga: string; state: string;
  priceAnnually: number; type: string;
  media: Array<{ url: string; isCover?: boolean; type?: string; thumbnailUrl?: string }>;
  _count?: { rooms: number };
  verificationStatus: string;
}

export const PropertyCard = ({ property, className }: { property: Property; className?: string }) => {
  const cover = property.media?.[0];
  const isVerified = property.verificationStatus === 'VERIFIED';
  const has3D = property.media?.some((m) => m.type === 'MODEL_3D' || m.type === 'TOUR_360');

  return (
    <Link to={`/property/${property.code}`}
      className={cn('group block rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-200', className)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {(() => {
          if (!cover) {
            return <div className="w-full h-full flex items-center justify-center"><span className="text-muted-foreground text-sm">No photo yet</span></div>;
          }
          const isVideo = cover.type === 'VIDEO';
          const posterSrc = isVideo ? cover.thumbnailUrl : cover.url;
          if (posterSrc) {
            return <img src={posterSrc} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
          }
          if (isVideo) {
            return <video src={cover.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />;
          }
          return <div className="w-full h-full flex items-center justify-center"><span className="text-muted-foreground text-sm">No photo yet</span></div>;
        })()}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-xs font-medium">{TYPE_LABELS[property.type] ?? property.type}</span>
          {isVerified && <span className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Verified</span>}
          {has3D && <span className="px-2 py-1 rounded-lg bg-orange-500/90 text-white text-xs font-medium flex items-center gap-1"><Video className="w-3 h-3"/>3D</span>}
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{property.title}</p>
        <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0"/><span className="truncate">{property.lga}, {property.state}</span>
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div>
            <p className="text-xl font-bold font-display">{formatNaira(property.priceAnnually)}</p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
          {(property._count?.rooms ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BedDouble className="w-4 h-4"/><span>{property._count?.rooms} rooms</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
