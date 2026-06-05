import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react';
import { cn, formatNaira } from '@/lib/utils';
import { FormInput } from '@/components/forms/form-input';
import FormTextarea from '@/components/forms/form-textarea';
import { FormCurrencyAmount } from '@/components/forms/form-currency-amount';
import { FormSearchSelect } from '@/components/forms/form-search-select';
import { useNigeriaStatesQuery, useNigeriaLgasQuery } from '@/services/locations/queries';
import { CustomButton } from '@/components/button';
import { FieldGroup } from '@/components/ui/field';
import { MediaUploader } from './media-uploader';
import type { PropertyMedia } from '@/types/domain';

const PROPERTY_TYPES = [
  { value: 'STUDIO_APARTMENT', label: 'Studio Apartment' },
  { value: 'FLAT_APARTMENT', label: 'Flat / Apartment' },
  { value: 'DETACHED', label: 'Detached' },
  { value: 'SEMI_DETACHED', label: 'Semi-Detached' },
  { value: 'TERRACE', label: 'Terraces' },
  { value: 'BUNGALOW', label: 'Bungalow' },
  { value: 'MAISONETTE', label: 'Maisonette' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'WHOLE_BUILDING', label: 'Whole Building' },
  { value: 'SELF_CONTAINED', label: 'Self-Contained' },
] as const;

const PROPERTY_AMENITIES = [
  '24hrs Electricity', '24hrs Security', 'Automated Gate', 'Basketball Court', 'Boardroom',
  'Borehole', 'Call to Access/ID pass', 'Car Park', 'CCTV', 'Central water system',
  "Children's playground / Park area", 'Cinema', 'Communal Generator', 'Communal Swimming pool',
  'Concierge Services', 'Coworking space', 'Dedicated Transformer', 'Drainage system',
  'Electric charging station', 'Elevator', 'Estate clubhouse or Event hall', 'Estate intercom',
  'Estate management office', 'Estate Patrol', 'Estate shuttle service', 'Facility manager office',
  'Fitness Room', 'Fitted Kitchen', 'Football pitch', 'Garage', 'Gas Meter', 'Gated Community',
  'Gatehouse', 'Golf Court', 'Good road network', 'Green area / Garden', 'Internet/WiFi', 'Inverter',
  'Laundromat', 'Maintenance Room', 'Mini-mart', 'Prepaid Meter', 'Private swimming pool',
  'Restaurant', 'Rooftop Garden', 'Rooftop Terrace', 'Salon', 'Sauna', 'Security House',
  'Tennis Court', 'Waste disposal & management system', 'Water Meter', 'Water Treatment Plant',
] as const;

const DESCRIPTION_MIN = 60;

const STEPS = ['Details', 'Pricing', 'Amenities', 'Media', 'Review'] as const;

const propertySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(DESCRIPTION_MIN, `Describe the property in at least ${DESCRIPTION_MIN} characters`),
  type: z.string().min(1, 'Property type is required'),
  address: z.string().min(3, 'Address is required'),
  lga: z.string().min(1, 'LGA is required'),
  state: z.string().min(1, 'State is required'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  priceMonthly: z.coerce.number().min(0, 'Must be positive'),
  priceAnnually: z.coerce.number().min(0, 'Must be positive'),
  cautionDeposit: z.coerce.number().min(0, 'Must be positive'),
  legalFee: z.coerce.number().min(0, 'Must be positive').optional().default(0),
  serviceCharge: z.coerce.number().min(0, 'Must be positive').optional().default(0),
  tenantPaysAgencyFee: z.boolean().optional().default(false),
  willingToWorkWithAgents: z.boolean().optional().default(false),
  amenities: z.array(z.string()).optional().default([]),
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

interface YesNoToggleProps {
  label: string;
  hint?: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}

const YesNoToggle = ({ label, hint, value, onChange }: YesNoToggleProps) => (
  <div>
    <p className="mb-2 text-sm font-medium">{label}</p>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Yes', val: true },
        { label: 'No', val: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.val)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            value === opt.val
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/50',
          )}
        >
          {opt.val ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {opt.label}
        </button>
      ))}
    </div>
    {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

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
      legalFee: 0,
      serviceCharge: 0,
      tenantPaysAgencyFee: false,
      willingToWorkWithAgents: false,
      amenities: [],
      ...defaultValues,
    },
  });

  const { control, handleSubmit, watch, setValue } = form;
  const values = watch();

  const { data: statesData } = useNigeriaStatesQuery();
  const { data: lgasData } = useNigeriaLgasQuery(values.state);
  const stateOptions = (statesData?.data ?? []).map((s) => ({ value: s, label: s }));
  const lgaOptions = (lgasData?.data ?? []).map((l) => ({ value: l, label: l }));

  const toggleAmenity = (amenity: string) => {
    const current = values.amenities ?? [];
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setValue('amenities', next, { shouldValidate: true, shouldDirty: true });
  };

  const canProceed = () => {
    if (step === 0) return !!values.title && !!values.type && !!values.address && !!values.state && !!values.lga && (values.description?.length ?? 0) >= DESCRIPTION_MIN;
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

            <div>
              <FormTextarea
                control={control}
                name="description"
                label="Description"
                rows={4}
                placeholder="A well-maintained 4-bedroom duplex in a nice neighbourhood, close to the shopping mall..."
              />
              <p
                className={cn(
                  'mt-1 text-right text-xs',
                  (values.description?.length ?? 0) >= DESCRIPTION_MIN ? 'text-muted-foreground' : 'text-red-500',
                )}
              >
                {values.description?.length ?? 0}/{DESCRIPTION_MIN} min characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSearchSelect
                control={control}
                name="type"
                label="Property Type"
                options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Select type"
                searchPlaceholder="Search type…"
              />
              <FormSearchSelect
                control={control}
                name="state"
                label="State"
                options={stateOptions}
                placeholder="Select state"
                searchPlaceholder="Search state…"
                onValueChange={(next) => {
                  if (next !== values.state) setValue('lga', '', { shouldDirty: true });
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSearchSelect
                control={control}
                name="lga"
                label="LGA"
                options={lgaOptions}
                placeholder={values.state ? 'Select LGA' : 'Select a state first'}
                searchPlaceholder="Search or type LGA…"
                allowCustom
              />
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
              <FormCurrencyAmount control={control} name="priceMonthly" label="Monthly Rent" currency="NGN" />
              <FormCurrencyAmount control={control} name="priceAnnually" label="Annual Rent" currency="NGN" />
            </div>

            <YesNoToggle
              label="Will the tenant pay agency fee?"
              value={values.tenantPaysAgencyFee}
              onChange={(v) => setValue('tenantPaysAgencyFee', v, { shouldDirty: true })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormCurrencyAmount control={control} name="legalFee" label="Legal Fee" currency="NGN" />
              <FormCurrencyAmount control={control} name="cautionDeposit" label="Caution Fee (Security Deposit)" currency="NGN" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormCurrencyAmount control={control} name="serviceCharge" label="Service Charge (Optional)" currency="NGN" />
              <FormInput control={control} name="availableFrom" label="Available From" type="date" />
            </div>

            <YesNoToggle
              label="Are you willing to work with agents?"
              hint="This motivates agents to actively promote your property and drive a faster transaction."
              value={values.willingToWorkWithAgents}
              onChange={(v) => setValue('willingToWorkWithAgents', v, { shouldDirty: true })}
            />
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
                <Controller
                  key={key}
                  control={control}
                  name={key}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      aria-pressed={!!field.value}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-medium transition-colors',
                        field.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted/50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                        )}
                      >
                        {field.value ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      {label}
                    </button>
                  )}
                />
              ))}
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="font-semibold">What's included in the property?</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Select all the amenities and features that best describe your property.
              </p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_AMENITIES.map((amenity) => {
                  const selected = (values.amenities ?? []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted/50',
                      )}
                    >
                      {selected ? <Check className="h-3 w-3" /> : null}
                      {amenity}
                    </button>
                  );
                })}
              </div>
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
                  <p className="text-xs text-muted-foreground">Caution Fee</p>
                  <p className="font-medium">{formatNaira(values.cautionDeposit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Legal Fee</p>
                  <p className="font-medium">{formatNaira(values.legalFee)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Charge</p>
                  <p className="font-medium">{formatNaira(values.serviceCharge)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tenant pays agency fee</p>
                  <p className="font-medium">{values.tenantPaysAgencyFee ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Willing to work with agents</p>
                  <p className="font-medium">{values.willingToWorkWithAgents ? 'Yes' : 'No'}</p>
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
                  {(values.amenities ?? []).map((amenity) => (
                    <span key={amenity} className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">{amenity}</span>
                  ))}
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
