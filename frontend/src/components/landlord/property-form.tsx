import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { MediaUploader } from './media-uploader';
import type { PropertyMedia } from '@/types/domain';

const PROPERTY_TYPES = [
  { value: 'SELF_CONTAINED', label: 'Self Contained' },
  { value: 'ONE_BEDROOM', label: 'One Bedroom' },
  { value: 'TWO_BEDROOM', label: 'Two Bedroom' },
  { value: 'THREE_BEDROOM', label: 'Three Bedroom' },
  { value: 'FOUR_BEDROOM_PLUS', label: 'Four Bedroom+' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'BUNGALOW', label: 'Bungalow' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'MINI_FLAT', label: 'Mini Flat' },
] as const;

const STEPS = ['Details', 'Pricing', 'Amenities', 'Media', 'Review'] as const;

const propertySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Provide a detailed description'),
  type: z.string().min(1, 'Property type is required'),
  address: z.string().min(3, 'Address is required'),
  lga: z.string().min(1, 'LGA is required'),
  state: z.string().min(1, 'State is required'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  priceMonthly: z.coerce.number().min(0, 'Must be positive'),
  priceAnnually: z.coerce.number().min(0, 'Must be positive'),
  cautionDeposit: z.coerce.number().min(0, 'Must be positive'),
  availableFrom: z.string().min(1, 'Select a date'),
  isFurnished: z.boolean().optional().default(false),
  isSemiFurnished: z.boolean().optional().default(false),
  hasGenerator: z.boolean().optional().default(false),
  hasParking: z.boolean().optional().default(false),
  hasSecurity: z.boolean().optional().default(false),
  hasElevator: z.boolean().optional().default(false),
  hasPool: z.boolean().optional().default(false),
  totalRooms: z.coerce.number().int().min(0).optional().default(0),
  floorLevel: z.coerce.number().int().optional().nullable(),
  buildingFloors: z.coerce.number().int().optional().nullable(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormValues>;
  existingMedia?: PropertyMedia[];
  propertyId?: string;
  onSubmit: (data: PropertyFormValues) => Promise<void>;
  onPublish?: () => Promise<void>;
  onUploadMedia?: (files: File[]) => Promise<void>;
  onDeleteMedia?: (mediaId: string) => void;
  onSetCoverMedia?: (mediaId: string) => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
  mode?: 'create' | 'edit';
}

export function PropertyForm({
  defaultValues,
  existingMedia = [],
  onSubmit,
  onPublish,
  onUploadMedia,
  onDeleteMedia,
  onSetCoverMedia,
  isSubmitting,
  isUploading,
  mode = 'create',
}: PropertyFormProps) {
  const [step, setStep] = useState(0);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      lat: 6.5244,
      lng: 3.3792,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch } = form;
  const values = watch();

  const canProceed = () => {
    if (step === 0) return !!values.title && !!values.type && !!values.address && !!values.state && !!values.lga;
    if (step === 1) return values.priceAnnually > 0 && !!values.availableFrom;
    return true;
  };

  const inputClass = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
  const labelClass = 'mb-1.5 block text-sm font-medium';
  const errorClass = 'mt-1 text-xs text-destructive';

  return (
    <div>
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i <= step && setStep(i)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              i === step ? 'bg-primary text-primary-foreground' :
              i < step ? 'bg-primary/10 text-primary' :
              'bg-muted text-muted-foreground',
            )}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : null}
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Basic Details</h2>

            <div>
              <label className={labelClass}>Title</label>
              <input {...register('title')} placeholder="e.g. Modern 2-Bedroom Apartment in Lekki" className={inputClass} />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea {...register('description')} rows={4} placeholder="Describe the property..." className={cn(inputClass, 'resize-none')} />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Property Type</label>
                <select {...register('type')} className={inputClass}>
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p className={errorClass}>{errors.type.message}</p>}
              </div>

              <div>
                <label className={labelClass}>State</label>
                <input {...register('state')} placeholder="e.g. Lagos" className={inputClass} />
                {errors.state && <p className={errorClass}>{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>LGA</label>
                <input {...register('lga')} placeholder="e.g. Eti-Osa" className={inputClass} />
                {errors.lga && <p className={errorClass}>{errors.lga.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input {...register('address')} placeholder="Full street address" className={inputClass} />
                {errors.address && <p className={errorClass}>{errors.address.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Latitude</label>
                <input {...register('lat')} type="number" step="any" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input {...register('lng')} type="number" step="any" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Pricing</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Monthly Rent (NGN)</label>
                <input {...register('priceMonthly')} type="number" min={0} className={inputClass} />
                {errors.priceMonthly && <p className={errorClass}>{errors.priceMonthly.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Annual Rent (NGN)</label>
                <input {...register('priceAnnually')} type="number" min={0} className={inputClass} />
                {errors.priceAnnually && <p className={errorClass}>{errors.priceAnnually.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Caution Deposit (NGN)</label>
                <input {...register('cautionDeposit')} type="number" min={0} className={inputClass} />
                {errors.cautionDeposit && <p className={errorClass}>{errors.cautionDeposit.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Available From</label>
                <input {...register('availableFrom')} type="date" className={inputClass} />
                {errors.availableFrom && <p className={errorClass}>{errors.availableFrom.message}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Amenities & Specifications</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Total Rooms</label>
                <input {...register('totalRooms')} type="number" min={0} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Floor Level</label>
                <input {...register('floorLevel')} type="number" min={0} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Building Floors</label>
                <input {...register('buildingFloors')} type="number" min={0} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                { key: 'isFurnished', label: 'Furnished' },
                { key: 'isSemiFurnished', label: 'Semi-Furnished' },
                { key: 'hasGenerator', label: 'Generator' },
                { key: 'hasParking', label: 'Parking' },
                { key: 'hasSecurity', label: 'Security' },
                { key: 'hasElevator', label: 'Elevator' },
                { key: 'hasPool', label: 'Pool' },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50">
                  <input type="checkbox" {...register(key)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Photos & Videos</h2>
            <p className="text-sm text-muted-foreground">
              Upload photos and videos of your property. Videos can be played by tenants for remote inspection. The first photo will be set as the cover.
            </p>
            {onUploadMedia ? (
              <MediaUploader
                existingMedia={existingMedia}
                onUpload={onUploadMedia}
                onDelete={onDeleteMedia}
                onSetCover={onSetCoverMedia}
                uploading={isUploading}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Save the property first to upload media.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Review</h2>

            <div className="space-y-4 rounded-xl border border-border p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{values.title || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{PROPERTY_TYPES.find((t) => t.value === values.type)?.label || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{values.address}, {values.lga}, {values.state}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annual Rent</p>
                  <p className="font-medium">{formatNaira(values.priceAnnually)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium">{formatNaira(values.priceMonthly)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Caution Deposit</p>
                  <p className="font-medium">{formatNaira(values.cautionDeposit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available From</p>
                  <p className="font-medium">{values.availableFrom || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rooms</p>
                  <p className="font-medium">{values.totalRooms || 0}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">Amenities</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {values.isFurnished && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Furnished</span>}
                  {values.isSemiFurnished && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Semi-Furnished</span>}
                  {values.hasGenerator && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Generator</span>}
                  {values.hasParking && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Parking</span>}
                  {values.hasSecurity && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Security</span>}
                  {values.hasElevator && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Elevator</span>}
                  {values.hasPool && <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">Pool</span>}
                </div>
              </div>

              {existingMedia.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">{existingMedia.length} media file(s) uploaded</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-muted px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === 'create' ? 'Save as Draft' : 'Save Changes'}
              </button>
              {onPublish && (
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isSubmitting || existingMedia.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Publish Property
                </button>
              )}
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
