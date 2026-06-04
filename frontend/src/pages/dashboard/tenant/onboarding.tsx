import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Pencil, User, Briefcase, CreditCard, Shield, Users, Upload, Trash2, FileText } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import {
  useTenantProfileQuery,
  useCompleteOnboardingMutation,
  useUpdateTenantProfileMutation,
  useUploadTenantDocumentsMutation,
  useDeleteTenantDocumentMutation,
} from '@/services/tenant/queries';
import { useCountriesQuery } from '@/services/locations/queries';
import type { TenantProfilePayload, EmploymentStatus, MaritalStatus, NationalIdType } from '@/types/domain';
import { TextInput } from '@/components/forms/atoms/text-input';
import { PhoneInput } from '@/components/forms/atoms/phone-input';
import { CurrencyAmountInput } from '@/components/forms/atoms/currency-amount-input';
import { SearchSelect } from '@/components/forms/atoms/search-select';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'employment', label: 'Employment', icon: Briefcase },
  { key: 'financial', label: 'Financial', icon: CreditCard },
  { key: 'identity', label: 'Identity', icon: Shield },
  { key: 'nextOfKin', label: 'Next of Kin', icon: Users },
] as const;

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) => {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <TextInput
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
      />
    </div>
  );
};

// Latest allowed date of birth so the tenant is at least 18 years old (YYYY-MM-DD).
const maxDobForAdult = (): string => {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().slice(0, 10);
};

const isAtLeast18 = (dob?: string): boolean => !!dob && dob <= maxDobForAdult();

const Select = ({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  return (
    <div className="space-y-1.5">
      <FieldLabel>
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
        )}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextareaField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
};

const buildFormDefaults = (profile?: Record<string, unknown> | null): TenantProfilePayload => {
  return {
    employmentStatus: (profile?.employmentStatus as EmploymentStatus) ?? undefined,
    employerName: String(profile?.employerName ?? ''),
    monthlyIncome: profile?.monthlyIncome ? Number(profile.monthlyIncome) : undefined,
    maritalStatus: (profile?.maritalStatus as MaritalStatus) ?? undefined,
    dateOfBirth: String(profile?.dateOfBirth ?? ''),
    nationality: String(profile?.nationality ?? 'Nigeria'),
    nationalIdType: (profile?.nationalIdType as NationalIdType) ?? undefined,
    nationalIdNumber: String(profile?.nationalIdNumber ?? ''),
    businessName: String(profile?.businessName ?? ''),
    businessType: String(profile?.businessType ?? ''),
    jobTitle: String(profile?.jobTitle ?? ''),
    annualIncome: profile?.annualIncome ? Number(profile.annualIncome) : undefined,
    bankName: String(profile?.bankName ?? ''),
    accountNumber: String(profile?.accountNumber ?? ''),
    nextOfKinName: String(profile?.nextOfKinName ?? ''),
    nextOfKinPhone: String(profile?.nextOfKinPhone ?? ''),
    nextOfKinRelationship: String(profile?.nextOfKinRelationship ?? ''),
    nextOfKinAddress: String(profile?.nextOfKinAddress ?? ''),
    currentAddress: String(profile?.currentAddress ?? ''),
    reasonForMoving: String(profile?.reasonForMoving ?? ''),
    numberOfOccupants: profile?.numberOfOccupants ? Number(profile.numberOfOccupants) : 1,
    hasPets: Boolean(profile?.hasPets),
    emergencyContactName: String(profile?.emergencyContactName ?? ''),
    emergencyContactPhone: String(profile?.emergencyContactPhone ?? ''),
  };
};

const PhoneField = ({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <FieldLabel>
      {label} {required ? <span className="text-destructive">*</span> : null}
    </FieldLabel>
    <PhoneInput
      value={value || undefined}
      onChange={(v) => onChange(v || '')}
      defaultCountry="NG"
      placeholder="08012345678"
    />
  </div>
);

interface KycDoc {
  label: string;
  url: string;
  uploadedAt?: string;
}

const IdDocumentUpload = ({ documents }: { documents: KycDoc[] }) => {
  const upload = useUploadTenantDocumentsMutation();
  const remove = useDeleteTenantDocumentMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [reupload, setReupload] = useState(false);

  const hasDocs = documents.length > 0;
  const isImage = (url: string) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

  return (
    <div className="rounded-xl border border-dashed border-border p-4">
      <FieldLabel>Upload your ID (front/back, optional selfie)</FieldLabel>

      {hasDocs ? (
        <ul className="mt-3 space-y-2">
          {documents.map((doc, index) => (
            <li key={`${doc.url}-${index}`} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {isImage(doc.url) ? (
                  <img src={doc.url} alt={doc.label} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.label}</p>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-primary underline-offset-4 hover:underline">
                  View document
                </a>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <button
                type="button"
                onClick={() => remove.mutate(doc.url)}
                disabled={remove.isPending}
                aria-label={`Delete ${doc.label}`}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!hasDocs || reupload ? (
        <>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-3 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />
          {files.length > 0 ? (
            <button
              type="button"
              onClick={() => upload.mutate({ files, labels: files.map((f) => f.name) }, { onSuccess: () => { setFiles([]); setReupload(false); } })}
              disabled={upload.isPending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Upload className="h-4 w-4" /> {upload.isPending ? 'Uploading…' : `Upload ${files.length} file(s)`}
            </button>
          ) : null}
          {reupload ? (
            <button
              type="button"
              onClick={() => { setReupload(false); setFiles([]); }}
              className="ml-2 mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          ) : null}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setReupload(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Upload className="h-4 w-4" /> Upload more / re-upload
        </button>
      )}
    </div>
  );
};

const TenantOnboardingPage = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading } = useTenantProfileQuery();
  const profile = profileData?.data;
  const isAlreadyOnboarded = !!profile?.isOnboarded;

  const onboardingMutation = useCompleteOnboardingMutation();
  const updateMutation = useUpdateTenantProfileMutation();

  const [step, setStep] = useState(0);
  const [incomeCurrency, setIncomeCurrency] = useState('NGN');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [formSeeded, setFormSeeded] = useState(false);
  const [form, setForm] = useState<TenantProfilePayload>(buildFormDefaults());

  const isStepComplete = (i: number, f: TenantProfilePayload): boolean => {
    if (i === 0) return !!(f.maritalStatus && f.currentAddress && isAtLeast18(f.dateOfBirth));
    if (i === 1) return !!f.employmentStatus;
    if (i === 3) return !!(f.nationalIdType && f.nationalIdNumber);
    if (i === 4) return !!(f.nextOfKinName && f.nextOfKinPhone && f.nextOfKinRelationship);
    return true;
  };

  // For resume only: an optional step (Financial) counts as "done" once it has
  // any data, so we don't jump past it to a later step.
  const isStepResumeComplete = (i: number, f: TenantProfilePayload): boolean => {
    if (i === 2) return !!(f.monthlyIncome || f.annualIncome || f.bankName || f.accountNumber);
    return isStepComplete(i, f);
  };

  // Seed form once profile data arrives, and resume at the next incomplete step.
  useEffect(() => {
    if (profile && !formSeeded) {
      const seeded = buildFormDefaults(profile as unknown as Record<string, unknown>);
      setForm(seeded);
      if (!profile.isOnboarded) {
        const firstIncomplete = STEPS.findIndex((_, i) => !isStepResumeComplete(i, seeded));
        setStep(firstIncomplete === -1 ? 0 : firstIncomplete);
      }
      setFormSeeded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, formSeeded]);

  const set = <K extends keyof TenantProfilePayload>(key: K, val: TenantProfilePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const { data: countriesData } = useCountriesQuery();
  const countryOptions = (countriesData?.data ?? []).map((c) => ({ value: c.name, label: c.name, flag: c.flag }));

  const canNext = (): boolean => isStepComplete(step, form);

  const mutation = isAlreadyOnboarded ? updateMutation : onboardingMutation;

  // Persist the current step before advancing — the next step is only shown
  // once the partial update succeeds, so progress is saved and prefills on return.
  const goNext = () => {
    setError('');
    updateMutation.mutate(form, {
      onSuccess: () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'Could not save your progress. Please try again.');
      },
    });
  };

  const handleSubmit = () => {
    setError('');
    setSaved(false);
    mutation.mutate(form, {
      onSuccess: () => {
        if (isAlreadyOnboarded) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          navigate(dashboardKeys.tenant.home.path);
        }
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'Failed to save profile');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">
                {isAlreadyOnboarded ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {isAlreadyOnboarded
                  ? 'Update your details below. These are shared with landlords when you apply.'
                  : 'Fill in your details so landlords can review your application when you apply.'}
              </p>
            </div>
            {isAlreadyOnboarded ? (
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Onboarded
              </span>
            ) : null}
          </div>

          {/* Success toast */}
          {saved ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              <Check className="h-4 w-4" /> Profile updated successfully.
            </div>
          ) : null}

          {/* Step indicator */}
          <div className="mt-8 flex items-center gap-1">
            {STEPS.map((s, i) => {
              // Allow navigating to already-reached steps; lock steps ahead unless onboarded.
              const reachable = i <= step || isAlreadyOnboarded;
              return (
                <button
                  key={s.key}
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && setStep(i)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                    i === step
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : i < step
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : `bg-muted text-muted-foreground ${reachable ? '' : 'cursor-not-allowed'}`
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold">Personal Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Marital Status"
                    value={form.maritalStatus ?? ''}
                    onChange={(v) => set('maritalStatus', v as MaritalStatus)}
                    options={[
                      { value: 'SINGLE', label: 'Single' },
                      { value: 'MARRIED', label: 'Married' },
                      { value: 'DIVORCED', label: 'Divorced' },
                      { value: 'WIDOWED', label: 'Widowed' },
                      { value: 'SEPARATED', label: 'Separated' },
                    ]}
                    required
                  />
                  <div>
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={form.dateOfBirth ?? ''}
                      onChange={(v) => set('dateOfBirth', v)}
                      max={maxDobForAdult()}
                      required
                    />
                    {form.dateOfBirth && !isAtLeast18(form.dateOfBirth) ? (
                      <p className="mt-1 text-xs text-destructive">You must be at least 18 years old.</p>
                    ) : null}
                  </div>
                  <SearchSelect
                    label="Nationality"
                    value={form.nationality ?? ''}
                    onChange={(v) => set('nationality', v)}
                    options={countryOptions}
                    searchPlaceholder="Search country…"
                  />
                  <Input
                    label="Number of Occupants"
                    type="number"
                    value={String(form.numberOfOccupants ?? 1)}
                    onChange={(v) => set('numberOfOccupants', Number(v) || 1)}
                  />
                </div>
                <TextareaField
                  label="Current Address"
                  value={form.currentAddress ?? ''}
                  onChange={(v) => set('currentAddress', v)}
                  placeholder="Your current residential address"
                />
                <TextareaField
                  label="Reason for Moving"
                  value={form.reasonForMoving ?? ''}
                  onChange={(v) => set('reasonForMoving', v)}
                  placeholder="Why are you looking for a new place?"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.hasPets ?? false}
                    onChange={(e) => set('hasPets', e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm">I have pets</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold">Employment Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Employment Status"
                    value={form.employmentStatus ?? ''}
                    onChange={(v) => set('employmentStatus', v as EmploymentStatus)}
                    options={[
                      { value: 'EMPLOYED', label: 'Employed' },
                      { value: 'SELF_EMPLOYED', label: 'Self Employed' },
                      { value: 'UNEMPLOYED', label: 'Unemployed' },
                      { value: 'STUDENT', label: 'Student' },
                      { value: 'RETIRED', label: 'Retired' },
                    ]}
                    required
                  />
                  <Input
                    label="Job Title"
                    value={form.jobTitle ?? ''}
                    onChange={(v) => set('jobTitle', v)}
                    placeholder="Software Engineer"
                  />
                  <Input
                    label="Employer Name"
                    value={form.employerName ?? ''}
                    onChange={(v) => set('employerName', v)}
                    placeholder="Company name"
                  />
                  <Input
                    label="Business Name"
                    value={form.businessName ?? ''}
                    onChange={(v) => set('businessName', v)}
                    placeholder="If self-employed"
                  />
                  <Input
                    label="Business Type"
                    value={form.businessType ?? ''}
                    onChange={(v) => set('businessType', v)}
                    placeholder="e.g. Technology, Retail"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold">Financial Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CurrencyAmountInput
                    label="Monthly Income"
                    value={form.monthlyIncome}
                    onChange={(v) => set('monthlyIncome', v)}
                    currency={incomeCurrency}
                    onCurrencyChange={setIncomeCurrency}
                  />
                  <CurrencyAmountInput
                    label="Annual Income"
                    value={form.annualIncome}
                    onChange={(v) => set('annualIncome', v)}
                    currency={incomeCurrency}
                    onCurrencyChange={setIncomeCurrency}
                  />
                  <Input
                    label="Bank Name"
                    value={form.bankName ?? ''}
                    onChange={(v) => set('bankName', v)}
                    placeholder="e.g. GTBank, Access Bank"
                  />
                  <Input
                    label="Account Number"
                    value={form.accountNumber ?? ''}
                    onChange={(v) => set('accountNumber', v)}
                    placeholder="10-digit account number"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold">Identity Verification</h2>
                <p className="text-sm text-muted-foreground">
                  Provide a government-issued ID for verification.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="ID Type"
                    value={form.nationalIdType ?? ''}
                    onChange={(v) => set('nationalIdType', v as NationalIdType)}
                    options={[
                      { value: 'NIN', label: 'National ID (NIN)' },
                      { value: 'PASSPORT', label: 'International Passport' },
                      { value: 'DRIVERS_LICENSE', label: "Driver's License" },
                      { value: 'VOTERS_CARD', label: "Voter's Card" },
                    ]}
                    required
                  />
                  <Input
                    label="ID Number"
                    value={form.nationalIdNumber ?? ''}
                    onChange={(v) => set('nationalIdNumber', v)}
                    placeholder="Enter your ID number"
                    required
                  />
                </div>
                <IdDocumentUpload documents={(profile as { kycDocs?: KycDoc[] } | undefined)?.kycDocs ?? []} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-bold">Next of Kin / Emergency Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Next of Kin Name"
                    value={form.nextOfKinName ?? ''}
                    onChange={(v) => set('nextOfKinName', v)}
                    placeholder="Full name"
                    required
                  />
                  <PhoneField
                    label="Next of Kin Phone"
                    value={form.nextOfKinPhone ?? ''}
                    onChange={(v) => set('nextOfKinPhone', v)}
                    required
                  />
                  <Select
                    label="Relationship"
                    value={form.nextOfKinRelationship ?? ''}
                    onChange={(v) => set('nextOfKinRelationship', v)}
                    options={[
                      { value: 'PARENT', label: 'Parent' },
                      { value: 'SPOUSE', label: 'Spouse' },
                      { value: 'SIBLING', label: 'Sibling' },
                      { value: 'CHILD', label: 'Child' },
                      { value: 'FRIEND', label: 'Friend' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                    required
                  />
                </div>
                <TextareaField
                  label="Next of Kin Address"
                  value={form.nextOfKinAddress ?? ''}
                  onChange={(v) => set('nextOfKinAddress', v)}
                  placeholder="Next of kin residential address"
                />

                <hr className="border-border" />
                <h3 className="text-sm font-semibold text-muted-foreground">Emergency Contact (optional)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Contact Name"
                    value={form.emergencyContactName ?? ''}
                    onChange={(v) => set('emergencyContactName', v)}
                    placeholder="Emergency contact name"
                  />
                  <PhoneField
                    label="Contact Phone"
                    value={form.emergencyContactPhone ?? ''}
                    onChange={(v) => set('emergencyContactPhone', v)}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canNext() || updateMutation.isPending}
                  onClick={goNext}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <>Saving… <Loader2 className="h-4 w-4 animate-spin" /></>
                  ) : (
                    <>Next <ChevronRight className="h-4 w-4" /></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canNext() || mutation.isPending}
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isAlreadyOnboarded ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isAlreadyOnboarded ? 'Save Changes' : 'Complete Onboarding'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantOnboardingPage;
