import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Loader2,
  MessageSquare,
  Phone,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import {
  useCompleteOnboardingMutation,
  useConnectPayoutMutation,
  useDeleteDocumentMutation,
  useLandlordOnboardingQuery,
  useSaveOnboardingMutation,
  useSendPhoneOtpMutation,
  useUploadDocumentsMutation,
  useVerifyPhoneOtpMutation,
} from '@/services/landlord/queries';
import { useAuthManager } from '@/hooks/auth/use-auth-manager';
import { useCountriesQuery, useStatesQuery } from '@/services/locations/queries';
import { SearchSelect } from '@/components/forms/atoms/search-select';
import type {
  ContactMethod,
  LandlordIdType,
  LandlordOnboardingPayload,
  LandlordOnboardingProfile,
  LandlordOperationType,
  LandlordOwnershipType,
  PaymentProvider,
  PayoutPreference,
} from '@/types/domain';
import { TextInput } from '@/components/forms/atoms/text-input';
import { FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { key: 'identity', label: 'Identity', icon: Shield },
  { key: 'portfolio', label: 'Property Info', icon: Building2 },
  { key: 'business', label: 'Business', icon: CreditCard },
  { key: 'contact', label: 'Contact', icon: MessageSquare },
] as const;

const PROPERTY_TYPE_OPTIONS = [
  'Apartment',
  'Single Family Home',
  'Duplex',
  'Townhouse',
  'Commercial Property',
  'Office Space',
  'Warehouse',
  'Student Housing',
  'Vacation Rental',
];

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

// Latest allowed date of birth so the landlord is at least 18 years old (YYYY-MM-DD).
const maxDobForAdult = (): string => {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().slice(0, 10);
};

const isAtLeast18 = (dob: string): boolean => {
  if (!dob) return false;
  return dob <= maxDobForAdult();
};

const STEP_ORDER: string[] = SECTIONS.map((s) => s.key);

const resumeSection = (profile?: LandlordOnboardingProfile | null): number => {
  if (!profile || profile.onboardingStatus === 'COMPLETED') return 0;

  // Prefer the furthest saved step (each "Next" persists the section just left).
  const savedIdx = STEP_ORDER.indexOf(profile.onboardingStep ?? '');
  if (savedIdx >= 0) return Math.min(savedIdx + 1, SECTIONS.length - 1);

  // Fallback: first incomplete required section from the data itself.
  const data = profile.onboardingData ?? {};
  const identityDone = !!(
    profile.dateOfBirth &&
    profile.idType &&
    profile.idNumber &&
    profile.residentialAddress &&
    profile.city &&
    profile.state
  );
  if (!identityDone) return 0;
  const portfolioDone = !!(data.portfolioSize && profile.ownershipType);
  if (!portfolioDone) return 1;
  if (!profile.contactMethod) return 3;
  return 0;
};

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
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
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

const OptionCards = <T extends string,>({
  value,
  onChange,
  options,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
}) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-xl border-2 p-4 text-left transition-all',
            value === o.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
          )}
        >
          <p className="font-medium">{o.label}</p>
          {o.desc ? <p className="mt-0.5 text-xs text-muted-foreground">{o.desc}</p> : null}
        </button>
      ))}
    </div>
  );
};

interface FormState {
  // identity
  dateOfBirth: string;
  idType: LandlordIdType | '';
  idNumber: string;
  residentialAddress: string;
  city: string;
  state: string;
  country: string;
  // portfolio
  portfolioSize: string;
  propertyTypes: string[];
  ownershipType: LandlordOwnershipType | '';
  // business
  operationType: LandlordOperationType | '';
  businessName: string;
  cacNumber: string;
  tin: string;
  payoutPreference: PayoutPreference | '';
  // contact
  contactMethods: ContactMethod[];
}

const seed = (profile?: LandlordOnboardingProfile | null): FormState => {
  const data = profile?.onboardingData ?? {};
  return {
    dateOfBirth: profile?.dateOfBirth ?? '',
    idType: profile?.idType ?? '',
    idNumber: profile?.idNumber ?? '',
    residentialAddress: profile?.residentialAddress ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    country: profile?.country ?? 'Nigeria',
    portfolioSize: data.portfolioSize ?? '',
    propertyTypes: data.propertyTypes ?? [],
    ownershipType: profile?.ownershipType ?? '',
    operationType: profile?.operationType ?? '',
    businessName: profile?.businessName ?? '',
    cacNumber: profile?.cacNumber ?? '',
    tin: profile?.tin ?? '',
    payoutPreference: profile?.payoutPreference ?? '',
    contactMethods:
      (data.contactMethods as ContactMethod[] | undefined) ??
      (profile?.contactMethod ? [profile.contactMethod] : []),
  };
};

const toPayload = (form: FormState, step: string): LandlordOnboardingPayload => {
  return {
    step,
    dateOfBirth: form.dateOfBirth || undefined,
    idType: form.idType || undefined,
    idNumber: form.idNumber || undefined,
    residentialAddress: form.residentialAddress || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    country: form.country || undefined,
    ownershipType: form.ownershipType || undefined,
    operationType: form.operationType || undefined,
    businessName: form.businessName || undefined,
    cacNumber: form.cacNumber || undefined,
    tin: form.tin || undefined,
    contactMethod: form.contactMethods[0] || undefined,
    payoutPreference: form.payoutPreference || undefined,
    data: {
      portfolioSize: form.portfolioSize || undefined,
      propertyTypes: form.propertyTypes,
      contactMethods: form.contactMethods,
    },
  };
};

const PhoneVerification = ({ verified }: { verified: boolean }) => {
  const { user, updateUser } = useAuthManager();
  const sendOtp = useSendPhoneOtpMutation();
  const verifyOtp = useVerifyPhoneOtpMutation();
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
        <CheckCircle2 className="h-4 w-4" /> Phone number verified
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Phone className="h-4 w-4 text-primary" /> Verify your phone number
      </div>
      {!sendOtp.isSuccess ? (
        <button
          type="button"
          onClick={() => sendOtp.mutate(undefined, { onSuccess: (r) => setDevCode(r.data?.devCode ?? null) })}
          disabled={sendOtp.isPending}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {sendOtp.isPending ? 'Sending…' : 'Send code via SMS'}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <TextInput value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" />
            <button
              type="button"
              onClick={() => {
                setError('');
                verifyOtp.mutate(code, {
                  onSuccess: () => {
                    if (user) updateUser({ ...user, isPhoneVerified: true });
                  },
                  onError: (err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                    setError(msg || 'Invalid code');
                  },
                });
              }}
              disabled={verifyOtp.isPending || code.length < 4}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Verify
            </button>
          </div>
          {devCode ? <p className="text-xs text-muted-foreground">Dev code: <span className="font-mono">{devCode}</span></p> : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      )}
    </div>
  );
};

const DocumentUpload = ({
  documents,
}: {
  documents: NonNullable<LandlordOnboardingProfile['verificationDocs']>;
}) => {
  const upload = useUploadDocumentsMutation();
  const remove = useDeleteDocumentMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [reupload, setReupload] = useState(false);

  const hasDocs = documents.length > 0;
  const isImage = (url: string) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

  const submit = () =>
    upload.mutate(
      { files, labels: files.map((f) => f.name) },
      {
        onSuccess: () => {
          setFiles([]);
          setReupload(false);
        },
      },
    );

  return (
    <div className="rounded-xl border border-dashed border-border p-4">
      <FieldLabel>Government ID & selfie (optional now, required for verification)</FieldLabel>

      {hasDocs ? (
        <ul className="mt-3 space-y-2">
          {documents.map((doc, index) => (
            <li
              key={`${doc.url}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {isImage(doc.url) ? (
                  <img src={doc.url} alt={doc.label} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.label}</p>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
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
              onClick={submit}
              disabled={upload.isPending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Upload className="h-4 w-4" /> {upload.isPending ? 'Uploading…' : `Upload ${files.length} file(s)`}
            </button>
          ) : null}
          {reupload ? (
            <button
              type="button"
              onClick={() => {
                setReupload(false);
                setFiles([]);
              }}
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
          <Upload className="h-4 w-4" /> Re-upload documents
        </button>
      )}
    </div>
  );
};

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'GTBank' },
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank' },
  { code: '033', name: 'UBA' },
  { code: '232', name: 'Sterling Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '050', name: 'Ecobank' },
];

const PayoutConnect = ({ profile }: { profile?: LandlordOnboardingProfile | null }) => {
  const connect = useConnectPayoutMutation();
  const [provider, setProvider] = useState<PaymentProvider>(
    (profile?.payoutProvider as PaymentProvider) ?? 'paystack',
  );
  const [accountName, setAccountName] = useState(profile?.bankAccount?.accountName ?? '');
  const [accountNumber, setAccountNumber] = useState(profile?.bankAccount?.accountNumber ?? '');
  const [bankCode, setBankCode] = useState(profile?.bankAccount?.bankCode ?? '');

  const connected = !!profile?.payoutSubaccountCode;

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Payout account</FieldLabel>
        {connected ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        {(['paystack', 'flutterwave'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              provider === p ? 'border-primary bg-primary/5 text-primary' : 'border-border',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Input label="Account holder name" value={accountName} onChange={setAccountName} placeholder="As shown on your bank account" />
        <Input label="Account number" value={accountNumber} onChange={setAccountNumber} placeholder="10-digit account number" />
        <Select
          label="Bank"
          value={bankCode}
          onChange={setBankCode}
          options={NIGERIAN_BANKS.map((b) => ({ value: b.code, label: b.name }))}
        />
      </div>

      <button
        type="button"
        disabled={connect.isPending || !accountName || !accountNumber || !bankCode}
        onClick={() =>
          connect.mutate({
            provider,
            accountName,
            accountNumber,
            bankCode,
            bankName: NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name,
          })
        }
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {connect.isPending ? 'Connecting…' : connected ? 'Update payout account' : 'Connect payout account'}
      </button>
    </div>
  );
};

const LandlordOnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthManager();
  const { data, isLoading } = useLandlordOnboardingQuery();
  const profile = data?.data;

  const saveMutation = useSaveOnboardingMutation();
  const completeMutation = useCompleteOnboardingMutation();

  const [section, setSection] = useState(0);
  const [form, setForm] = useState<FormState>(seed());
  const [seeded, setSeeded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && !seeded) {
      setForm(seed(profile));
      setSection(resumeSection(profile));
      setSeeded(true);
    }
  }, [profile, seeded]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const { data: countriesData } = useCountriesQuery();
  const countries = countriesData?.data ?? [];
  const countryIso = countries.find((c) => c.name === form.country)?.iso;
  const { data: statesData } = useStatesQuery(countryIso);
  const states = statesData?.data ?? [];

  const onCountryChange = (name: string) =>
    setForm((prev) => ({ ...prev, country: name, state: '' }));

  const toggleType = (t: string) =>
    setForm((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(t)
        ? prev.propertyTypes.filter((x) => x !== t)
        : [...prev.propertyTypes, t],
    }));

  const toggleContactMethod = (m: ContactMethod) =>
    setForm((prev) => ({
      ...prev,
      contactMethods: prev.contactMethods.includes(m)
        ? prev.contactMethods.filter((x) => x !== m)
        : [...prev.contactMethods, m],
    }));

  const phoneVerified = !!user?.isPhoneVerified;

  const canNext = useMemo(() => {
    if (section === 0)
      return !!(
        form.dateOfBirth &&
        isAtLeast18(form.dateOfBirth) &&
        form.idType &&
        form.idNumber &&
        form.residentialAddress &&
        form.city &&
        form.state
      );
    if (section === 1) return !!(form.portfolioSize && form.ownershipType);
    return true;
  }, [section, form]);

  const goNext = () => {
    setError('');
    // Persist the current step before advancing — the next screen is only
    // shown once the partial update succeeds.
    saveMutation.mutate(toPayload(form, SECTIONS[section].key), {
      onSuccess: () => setSection((s) => Math.min(s + 1, SECTIONS.length - 1)),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'Could not save your progress. Please try again.');
      },
    });
  };

  const goBack = () => setSection((s) => Math.max(s - 1, 0));

  const handleComplete = () => {
    setError('');
    if (form.contactMethods.length === 0) {
      setError('Please choose at least one preferred contact method.');
      return;
    }
    completeMutation.mutate(toPayload(form, 'contact'), {
      onSuccess: () => navigate(dashboardKeys.landlord.home.path),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'Failed to complete onboarding');
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
          <h1 className="font-display text-3xl font-bold">Landlord Onboarding</h1>
          <p className="mt-1 text-muted-foreground">
            Complete these steps to start listing your properties on HouseHunt.
          </p>

          {/* Section indicator */}
          <div className="mt-8 flex items-center gap-1">
            {SECTIONS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                disabled={i > section}
                onClick={() => i <= section && setSection(i)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-medium transition-all ${
                  i === section
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : i < section
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'cursor-not-allowed bg-muted text-muted-foreground'
                }`}
              >
                {i < section ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {/* SECTION 1 — IDENTITY */}
            {section === 0 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Basic information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Date of birth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(v) => set('dateOfBirth', v)}
                      max={maxDobForAdult()}
                      required
                    />
                  </div>
                  {form.dateOfBirth && !isAtLeast18(form.dateOfBirth) ? (
                    <p className="text-xs text-destructive">You must be at least 18 years old.</p>
                  ) : null}
                  <PhoneVerification verified={phoneVerified} />
                </div>

                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Government ID</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="ID type"
                      value={form.idType}
                      onChange={(v) => set('idType', v as LandlordIdType)}
                      options={[
                        { value: 'DRIVERS_LICENSE', label: "Driver's License" },
                        { value: 'PASSPORT', label: 'Passport' },
                        { value: 'NATIONAL_ID', label: 'National ID' },
                      ]}
                      required
                    />
                    <Input
                      label="ID number"
                      value={form.idNumber}
                      onChange={(v) => set('idNumber', v)}
                      placeholder="e.g. ABC123456789"
                      required
                    />
                  </div>
                  {form.idType ? <DocumentUpload documents={profile?.verificationDocs ?? []} /> : null}
                </div>

                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Address</h2>
                  <Input
                    label="Residential address"
                    value={form.residentialAddress}
                    onChange={(v) => set('residentialAddress', v)}
                    placeholder="House number, street, area"
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="City" value={form.city} onChange={(v) => set('city', v)} placeholder="e.g. Ikeja" required />
                    <SearchSelect
                      label="State"
                      value={form.state}
                      onChange={(v) => set('state', v)}
                      options={states.map((s) => ({ value: s.name, label: s.name }))}
                      searchPlaceholder="Search state…"
                      placeholder={countryIso ? 'Select…' : 'Select a country first'}
                      required
                    />
                    <SearchSelect
                      label="Country"
                      value={form.country}
                      onChange={onCountryChange}
                      options={countries.map((c) => ({ value: c.name, label: c.name, flag: c.flag }))}
                      searchPlaceholder="Search country…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2 — PORTFOLIO */}
            {section === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold">How many properties do you manage?</h2>
                  <OptionCards
                    value={form.portfolioSize as string}
                    onChange={(v) => set('portfolioSize', v)}
                    options={[
                      { value: '1', label: '1 Property' },
                      { value: '2-5', label: '2–5 Properties' },
                      { value: '6-20', label: '6–20 Properties' },
                      { value: '20+', label: '20+ Properties' },
                    ]}
                  />
                </div>

                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold">Property types</h2>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleType(t)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          form.propertyTypes.includes(t)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/40',
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold">Are you the owner?</h2>
                  <OptionCards
                    value={form.ownershipType}
                    onChange={(v) => set('ownershipType', v as LandlordOwnershipType)}
                    options={[
                      { value: 'OWNER', label: 'Property Owner' },
                      { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
                      { value: 'AGENCY', label: 'Agency / Broker' },
                      { value: 'REPRESENTATIVE', label: 'Representative' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* SECTION 3 — BUSINESS */}
            {section === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Business profile</h2>
                  <Select
                    label="How do you operate?"
                    value={form.operationType}
                    onChange={(v) => set('operationType', v as LandlordOperationType)}
                    options={[
                      { value: 'INDIVIDUAL', label: 'Individual Landlord' },
                      { value: 'PROPERTY_MANAGEMENT_COMPANY', label: 'Property Management Company' },
                      { value: 'REAL_ESTATE_AGENCY', label: 'Real Estate Agency' },
                    ]}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Business name (optional)"
                      value={form.businessName}
                      onChange={(v) => set('businessName', v)}
                      placeholder="e.g. Maic Properties Ltd"
                    />
                    <Input
                      label="CAC registration number (optional)"
                      value={form.cacNumber}
                      onChange={(v) => set('cacNumber', v)}
                      placeholder="e.g. RC1234567"
                    />
                    <Input
                      label="Tax identification number (optional)"
                      value={form.tin}
                      onChange={(v) => set('tin', v)}
                      placeholder="e.g. 12345678-0001"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Payment setup</h2>
                  <PayoutConnect profile={profile} />
                </div>

                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold">Payout preference</h2>
                  <p className="text-sm text-muted-foreground">
                    How quickly should escrowed rent be released to your payout account after a tenant moves in?
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Payout schedule"
                      value={form.payoutPreference}
                      onChange={(v) => set('payoutPreference', v as PayoutPreference)}
                      options={[
                        { value: 'INSTANT', label: 'Instant payout' },
                        { value: 'DAILY', label: 'Daily payout' },
                        { value: 'WEEKLY', label: 'Weekly payout' },
                        { value: 'MONTHLY', label: 'Monthly payout' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4 — CONTACT */}
            {section === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold">Preferred contact method</h2>
                <p className="text-sm text-muted-foreground">
                  How should tenants reach you? Select all that apply.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    { value: 'IN_APP', label: 'In-App Messaging' },
                    { value: 'EMAIL', label: 'Email' },
                    { value: 'PHONE', label: 'Phone Call' },
                    { value: 'SMS', label: 'SMS' },
                  ] as { value: ContactMethod; label: string }[]).map((o) => {
                    const selected = form.contactMethods.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleContactMethod(o.value)}
                        className={cn(
                          'flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all',
                          selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                        )}
                      >
                        <span className="font-medium">{o.label}</span>
                        {selected ? <Check className="h-4 w-4 text-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-border pt-6">
              {section > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
              ) : (
                <div />
              )}

              {section < SECTIONS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canNext || saveMutation.isPending}
                  onClick={goNext}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <>
                      Saving… <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={completeMutation.isPending}
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {completeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Complete onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordOnboardingPage;
