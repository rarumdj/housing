import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { FormInput } from '@/components/forms/form-input';
import FormTextarea from '@/components/forms/form-textarea';
import { FormSelect } from '@/components/forms/form-select';
import FormCheckbox from '@/components/forms/form-checkbox';
import { CustomButton } from '@/components/button';
import { FieldGroup } from '@/components/ui/field';
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

export const PropertyForm = ({
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
}: PropertyFormProps) => {
  const [step, setStep] = useState(0);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      lat: 6.5244,
      lng: 3.3792,
      ...defaultValues,
    },
  });

  const { control, handleSubmit, watch } = form;
  const values = watch();

  const canProceed = () => {
    if (step === 0) return !!values.title && !!values.type && !!values.address && !!values.state && !!values.lga;
    if (step === 1) return values.priceAnnually > 0 && !!values.availableFrom;
    return true;
  };

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
          <FieldGroup className="gap-5">
            <h2 className="text-lg font-bold">Basic Details</h2>

            <FormInput
              control={control}
              name="title"
              label="Title"
              placeholder="e.g. Modern 2-Bedroom Apartment in Lekki"
            />

            <FormTextarea
              control={control}
              name="description"
              label="Description"
              rows={4}
              placeholder="Describe the property..."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={control}
                name="type"
                label="Property Type"
                placeholder="Select type"
                options={PROPERTY_TYPES.map((t) => ({
                  value: t.value,
                  label: t.label,
                  searchLabel: t.label,
                }))}
              />
              <FormInput control={control} name="state" label="State" placeholder="e.g. Lagos" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput control={control} name="lga" label="LGA" placeholder="e.g. Eti-Osa" />
              <FormInput control={control} name="address" label="Address" placeholder="Full street address" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput control={control} name="lat" label="Latitude" type="number" step="any" />
              <FormInput control={control} name="lng" label="Longitude" type="number" step="any" />
            </div>
          </FieldGroup>
        )}

        {step === 1 && (
          <FieldGroup className="gap-5">
            <h2 className="text-lg font-bold">Pricing</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput control={control} name="priceMonthly" label="Monthly Rent (NGN)" type="number" min={0} />
              <FormInput control={control} name="priceAnnually" label="Annual Rent (NGN)" type="number" min={0} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput control={control} name="cautionDeposit" label="Caution Deposit (NGN)" type="number" min={0} />
              <FormInput control={control} name="availableFrom" label="Available From" type="date" />
            </div>
          </FieldGroup>
        )}

        {step === 2 && (
          <FieldGroup className="gap-5">
            <h2 className="text-lg font-bold">Amenities & Specifications</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput control={control} name="totalRooms" label="Total Rooms" type="number" min={0} />
              <FormInput control={control} name="floorLevel" label="Floor Level" type="number" min={0} />
              <FormInput control={control} name="buildingFloors" label="Building Floors" type="number" min={0} />
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
                <div
                  key={key}
                  className="rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <FormCheckbox control={control} name={key} label={label} />
                </div>
              ))}
            </div>
          </FieldGroup>
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
};
