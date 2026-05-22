import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Pencil, User, Briefcase, CreditCard, Shield, Users } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { useTenantProfileQuery, useCompleteOnboardingMutation, useUpdateTenantProfileMutation } from '@/services/tenant/queries';
import type { TenantProfilePayload, EmploymentStatus, MaritalStatus, NationalIdType } from '@/types/domain';
import { TextInput } from '@/components/forms/atoms/text-input';
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

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
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
      />
    </div>
  );
}

function Select({
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
}) {
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
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
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
}

function buildFormDefaults(profile?: Record<string, unknown> | null): TenantProfilePayload {
  return {
    employmentStatus: (profile?.employmentStatus as EmploymentStatus) ?? undefined,
    employerName: String(profile?.employerName ?? ''),
    monthlyIncome: profile?.monthlyIncome ? Number(profile.monthlyIncome) : undefined,
    maritalStatus: (profile?.maritalStatus as MaritalStatus) ?? undefined,
    dateOfBirth: String(profile?.dateOfBirth ?? ''),
    nationality: String(profile?.nationality ?? 'Nigerian'),
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
}

export default function TenantOnboardingPage() {
  const navigate = useNavigate();
  const { data: profileData, isLoading } = useTenantProfileQuery();
  const profile = profileData?.data;
  const isAlreadyOnboarded = !!profile?.isOnboarded;

  const onboardingMutation = useCompleteOnboardingMutation();
  const updateMutation = useUpdateTenantProfileMutation();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [formSeeded, setFormSeeded] = useState(false);
  const [form, setForm] = useState<TenantProfilePayload>(buildFormDefaults());

  // Seed form once profile data arrives
  useEffect(() => {
    if (profile && !formSeeded) {
      setForm(buildFormDefaults(profile as unknown as Record<string, unknown>));
      setFormSeeded(true);
    }
  }, [profile, formSeeded]);

  const set = <K extends keyof TenantProfilePayload>(key: K, val: TenantProfilePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const canNext = (): boolean => {
    if (step === 0) return !!(form.maritalStatus && form.currentAddress && form.dateOfBirth);
    if (step === 1) return !!form.employmentStatus;
    if (step === 3) return !!(form.nationalIdType && form.nationalIdNumber);
    if (step === 4) return !!(form.nextOfKinName && form.nextOfKinPhone && form.nextOfKinRelationship);
    return true;
  };

  const mutation = isAlreadyOnboarded ? updateMutation : onboardingMutation;

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
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(i)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                  i === step
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : i < step
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
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
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={form.dateOfBirth ?? ''}
                    onChange={(v) => set('dateOfBirth', v)}
                    required
                  />
                  <Input
                    label="Nationality"
                    value={form.nationality ?? ''}
                    onChange={(v) => set('nationality', v)}
                    placeholder="Nigerian"
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
                  <Input
                    label="Monthly Income (NGN)"
                    type="number"
                    value={String(form.monthlyIncome ?? '')}
                    onChange={(v) => set('monthlyIncome', Number(v) || undefined)}
                    placeholder="0"
                  />
                  <Input
                    label="Annual Income (NGN)"
                    type="number"
                    value={String(form.annualIncome ?? '')}
                    onChange={(v) => set('annualIncome', Number(v) || undefined)}
                    placeholder="0"
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
                  <Input
                    label="Next of Kin Phone"
                    value={form.nextOfKinPhone ?? ''}
                    onChange={(v) => set('nextOfKinPhone', v)}
                    placeholder="08012345678"
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
                  <Input
                    label="Contact Phone"
                    value={form.emergencyContactPhone ?? ''}
                    onChange={(v) => set('emergencyContactPhone', v)}
                    placeholder="08012345678"
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
                  disabled={!canNext()}
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
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
}
