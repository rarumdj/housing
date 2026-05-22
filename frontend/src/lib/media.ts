import type { PropertyMedia } from "@/types/domain";

/** Stored when Cloudinary (or similar) is not configured — not loadable in the browser. */
export function isPlaceholderStorageUrl(
  url: string | undefined | null,
): boolean {
  return typeof url === "string" && url.startsWith("local://");
}

export function canDisplayMediaInBrowser(
  url: string | undefined | null,
): boolean {
  if (!url || typeof url !== "string") return false;
  if (isPlaceholderStorageUrl(url)) return false;
  if (url.startsWith("/uploads/")) return true;
  return (
    /^https?:\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  );
}

export function isVideoMedia(m: PropertyMedia): boolean {
  return m.type === "VIDEO" || /\.(mp4|webm|ogg)(\?|$)/i.test(m.url ?? "");
}

function mediaOrder(a: PropertyMedia, b: PropertyMedia): number {
  const cover = Number(!!b.isCover) - Number(!!a.isCover);
  if (cover !== 0) return cover;
  const ai = typeof a.orderIndex === "number" ? a.orderIndex : 0;
  const bi = typeof b.orderIndex === "number" ? b.orderIndex : 0;
  return ai - bi;
}

/** Images safe to use in <img> (PHOTO + TOUR_360 + MODEL_3D, excludes video and non-loadable URLs). */
export function getDisplayPhotos(
  media: PropertyMedia[] | undefined,
): PropertyMedia[] {
  if (!media?.length) return [];
  return media
    .filter((m) => {
      if (isVideoMedia(m)) return false;
      if (!canDisplayMediaInBrowser(m.url)) return false;
      return (
        m.type === "PHOTO" || m.type === "TOUR_360" || m.type === "MODEL_3D"
      );
    })
    .sort(mediaOrder);
}

export function getDisplayVideos(
  media: PropertyMedia[] | undefined,
): PropertyMedia[] {
  if (!media?.length) return [];
  return media
    .filter((m) => isVideoMedia(m) && canDisplayMediaInBrowser(m.url))
    .sort(mediaOrder);
}

/** Panorama / 360 assets for Photo Sphere Viewer. */
export function getPanoramaTourMedia(
  media: PropertyMedia[] | undefined,
): PropertyMedia[] {
  if (!media?.length) return [];
  return media
    .filter((m) => {
      if (!canDisplayMediaInBrowser(m.url)) return false;
      if (m.type !== "TOUR_360" && m.type !== "MODEL_3D") return false;
      if (isVideoMedia(m)) return false;
      return true;
    })
    .sort(mediaOrder);
}

/** First image suitable for list thumbnails (admin cards, search). */
export function pickListThumbnail(media: PropertyMedia[] | undefined): {
  url: string | null;
  kind: "photo" | "video" | "none";
} {
  const photos = getDisplayPhotos(media);
  if (photos.length > 0) {
    const cover = photos.find((p) => p.isCover) ?? photos[0];
    return { url: cover.url, kind: "photo" };
  }
  const videos = getDisplayVideos(media);
  const v = videos[0];
  if (v?.thumbnailUrl && canDisplayMediaInBrowser(v.thumbnailUrl)) {
    return { url: v.thumbnailUrl, kind: "video" };
  }
  if (v?.url) {
    return {
      url: canDisplayMediaInBrowser(v.url) ? v.url : null,
      kind: "video",
    };
  }
  return { url: null, kind: "none" };
}
