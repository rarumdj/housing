import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Star, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyMedia } from '@/types/domain';

interface MediaUploaderProps {
  existingMedia?: PropertyMedia[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete?: (mediaId: string) => void;
  onSetCover?: (mediaId: string) => void;
  uploading?: boolean;
}

export function MediaUploader({ existingMedia = [], onUpload, onDelete, onSetCover, uploading }: MediaUploaderProps) {
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const newPreviews = accepted.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);

      try {
        await onUpload(accepted);
        setPreviews((prev) => prev.filter((p) => !newPreviews.includes(p)));
      } catch {
        setPreviews((prev) => prev.filter((p) => !newPreviews.includes(p)));
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm'],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: true,
  });

  const isVideo = (url: string, type?: string) =>
    type === 'VIDEO' || url.match(/\.(mp4|webm)(\?|$)/i);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop photos or videos'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WebP, MP4, WebM up to 100MB — images auto-convert to 360° tour scenes
        </p>
      </div>

      {(existingMedia.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existingMedia.map((media) => (
            <div key={media.id} className="group relative overflow-hidden rounded-xl border border-border">
              {isVideo(media.url, media.type) ? (
                <div className="relative aspect-video bg-muted">
                  <video src={media.url} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video">
                  <img src={media.url} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {media.isCover && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Cover
                  </span>
                )}
                {!media.isCover && onSetCover && media.id && (
                  <button
                    type="button"
                    onClick={() => onSetCover(media.id!)}
                    className="rounded bg-background/80 p-1 text-xs hover:bg-background"
                    title="Set as cover"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="flex-1" />
                {onDelete && media.id && (
                  <button
                    type="button"
                    onClick={() => onDelete(media.id!)}
                    className="rounded bg-destructive/80 p-1 text-destructive-foreground hover:bg-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 px-2 py-1">
                <span className="text-[10px] font-medium uppercase text-white">
                  {media.type === 'TOUR_360' ? '360° Tour' : media.type === 'MODEL_3D' ? '3D Model' : media.type}
                </span>
              </div>
            </div>
          ))}

          {previews.map((preview, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-dashed border-primary/50">
              <div className="aspect-video">
                {preview.file.type.startsWith('video/')
                  ? <video src={preview.url} className="h-full w-full object-cover opacity-50" />
                  : <img src={preview.url} alt="" className="h-full w-full object-cover opacity-50" />
                }
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
