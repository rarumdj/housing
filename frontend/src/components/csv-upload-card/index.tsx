import { useRef } from 'react';
import rankCsvIcon from '@/assets/images/dashboard/rank-csv-icon.svg?url';
import rankFileIcon from '@/assets/images/dashboard/rank-file.svg?url';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { RiCheckboxCircleFill, RiCloseCircleLine } from '@remixicon/react';
import { X } from 'lucide-react';

type CsvUploadCardProps = {
  file: File | null;
  uploadProgress: number;
  isDragging: boolean;
  onDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLLabelElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile?: () => void;
  uploadError?: string | null;
  errorActionLabel?: string;
  onErrorAction?: () => void;
  inputId?: string;
  accept?: string;
  maxSizeLabel?: string;
  className?: string;
};

function formatUploadSize(file: File, uploadProgress: number) {
  const totalKb = Math.max(1, Math.round(file.size / 1024));
  const uploadedKb = Math.round((uploadProgress / 100) * totalKb);

  return `${uploadedKb} KB of ${totalKb} KB`;
}

export function CsvUploadCard({
  file,
  uploadProgress,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onRemoveFile,
  uploadError,
  errorActionLabel = 'Reupload CSV',
  onErrorAction,
  inputId = 'csv-file-input',
  accept = '.csv',
  maxSizeLabel = '10MB',
  className,
}: CsvUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isUploadComplete = uploadProgress === 100;
  const isUploading = uploadProgress > 0 && uploadProgress < 100;
  const hasUploadError = Boolean(uploadError);

  const openFilePicker = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-[260px] items-center rounded-2xl border-2 border-dashed bg-card p-4',
        hasUploadError
          ? 'border-destructive/60 bg-destructive/5'
          : isUploadComplete && file
            ? 'border-primary/40 bg-primary/10'
            : 'border-border',
        className
      )}
    >
      <label
        htmlFor={inputId}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-transparent bg-muted/30 px-6 py-8 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && hasUploadError && 'border-destructive/50 bg-destructive/5',
          !isDragging && file && !isUploadComplete && 'border-primary/30 bg-primary/5',
          !isDragging &&
            isUploadComplete &&
            file &&
            'border-primary/30 bg-primary/10',
          !isDragging && !file && 'hover:border-border hover:bg-muted/50',
          hasUploadError && 'hover:border-destructive/50 hover:bg-destructive/5'
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onFileSelect}
        />

        {file && onRemoveFile && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              onRemoveFile();
            }}
            className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Remove selected file"
          >
            <X className="size-4" />
          </button>
        )}

        <div
          className={cn(
            'grid size-16 place-items-center rounded-2xl',
            isUploadComplete && file ? 'bg-transparent' : 'bg-primary/10'
          )}
        >
          <img
            src={isUploadComplete && file ? rankCsvIcon : rankFileIcon}
            alt="File upload"
            className="size-8"
          />
        </div>

        {!file && (
          <>
            <p className="mt-4 text-sm font-semibold text-foreground">
              Drag your file here or{' '}
              <span className="font-medium text-primary">click to upload</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Accepted formats: {accept} • Max {maxSizeLabel}
            </p>
          </>
        )}

        {file && (
          <div className="mt-4 w-full max-w-[420px]">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span
                className="max-w-[140px] truncate text-sm font-semibold text-foreground sm:max-w-[220px]"
                title={file.name}
              >
                {file.name}
              </span>
              <span>{formatUploadSize(file, uploadProgress)}</span>
              <span className="inline-flex items-center gap-1">
                {isUploadComplete ? (
                  hasUploadError ? (
                    <RiCloseCircleLine className="size-3 text-destructive" />
                  ) : (
                    <RiCheckboxCircleFill className="size-3 text-primary" />
                  )
                ) : (
                  <Spinner className="size-3 animate-spin text-primary" />
                )}
                <span
                  className={cn(
                    hasUploadError
                      ? 'text-destructive'
                      : 'text-primary'
                  )}
                >
                  {isUploadComplete
                    ? hasUploadError
                      ? 'Upload failed'
                      : 'Completed'
                    : 'Uploading...'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-200 ease-out',
                    hasUploadError ? 'bg-destructive' : 'bg-primary'
                  )}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isUploading ? uploadProgress : isUploadComplete ? '100' : '0'}%
              </p>
            </div>

            {hasUploadError && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-left text-xs text-destructive">{uploadError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (onErrorAction) {
                      onErrorAction();
                      return;
                    }
                    openFilePicker();
                  }}
                  className="shrink-0 rounded-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {errorActionLabel}
                </Button>
              </div>
            )}
          </div>
        )}
      </label>
    </div>
  );
}
