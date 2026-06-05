import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldOff, Loader2, Mail, Phone, Calendar, X, FileText, CheckCircle2 } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import { useAdminUserDetailQuery, useVerifyUserMutation, useToggleActiveMutation } from '@/services/admin/queries';

const verificationBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  SUBMITTED: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const AWAITING = ['PENDING', 'UNDER_REVIEW', 'SUBMITTED'];

const humanize = (value?: unknown): string | undefined =>
  value === undefined || value === null || value === '' ? undefined : String(value).replace(/_/g, ' ');

const money = (value?: unknown): string | undefined =>
  value === undefined || value === null || value === '' ? undefined : formatNaira(Number(value));

const yesNo = (value?: unknown): string | undefined =>
  value === undefined || value === null ? undefined : value ? 'Yes' : 'No';

const StatusChip = ({ ok, okLabel, offLabel }: { ok: boolean; okLabel: string; offLabel: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
      ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
    )}
  >
    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
    {ok ? okLabel : offLabel}
  </span>
);

const Row = ({ label, value }: { label: string; value?: unknown }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value === undefined || value === null || value === '' ? '—' : String(value)}</span>
  </div>
);

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useAdminUserDetailQuery(id!);
  const verifyMutation = useVerifyUserMutation();
  const toggleMutation = useToggleActiveMutation();

  const [declineOpen, setDeclineOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const user = data?.data as Record<string, unknown> | undefined;

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">User not found</p></div>;

  const role = String(user.role);
  const landlord = user.landlord as Record<string, unknown> | null;
  const tenant = user.tenant as Record<string, unknown> | null;
  const vStatus = role === 'LANDLORD'
    ? String(landlord?.verificationStatus ?? 'PENDING')
    : role === 'TENANT'
      ? String(tenant?.kycStatus ?? 'PENDING')
      : 'N/A';
  const reviewNote = role === 'LANDLORD' ? landlord?.verificationNote : tenant?.kycNote;
  const isAwaiting = role !== 'ADMIN' && AWAITING.includes(vStatus);

  const approve = () =>
    verifyMutation.mutate({ id: id!, status: 'VERIFIED' });

  const confirmDecline = () => {
    if (!note.trim()) {
      setError('Please provide a reason so the user knows why.');
      return;
    }
    verifyMutation.mutate(
      { id: id!, status: 'REJECTED', reason: note.trim() },
      {
        onSuccess: () => {
          setDeclineOpen(false);
          setNote('');
          setError('');
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setError(msg || 'Failed to decline');
        },
      },
    );
  };

  const docs = (landlord?.verificationDocs as Array<{ label: string; url: string }> | undefined) ?? [];

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-4xl py-8">
        <button onClick={() => navigate(dashboardKeys.admin.users.path)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>

        {/* Profile Header */}
        <div className="mb-6 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {String(user.firstName).charAt(0)}{String(user.lastName).charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{String(user.firstName)} {String(user.lastName)}</h1>
                <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-medium">{role}</span>
                {vStatus !== 'N/A' && (
                  <span className={cn('rounded-lg px-2.5 py-0.5 text-xs font-medium', verificationBadge[vStatus] ?? 'bg-muted')}>
                    {vStatus.replace('_', ' ')}
                  </span>
                )}
                {!user.isActive && <span className="rounded-lg bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Deactivated</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{String(user.email)}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{String(user.phone)}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {new Date(String(user.createdAt)).toLocaleDateString()}</span>
              </div>

              {/* Account statuses */}
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusChip ok={Boolean(user.isActive)} okLabel="Active" offLabel="Deactivated" />
                <StatusChip ok={Boolean(user.isEmailVerified)} okLabel="Email verified" offLabel="Email not verified" />
                <StatusChip ok={Boolean(user.isPhoneVerified)} okLabel="Phone verified" offLabel="Phone not verified" />
              </div>
            </div>
          </div>

          {/* Existing decline note */}
          {vStatus === 'REJECTED' && reviewNote ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <span className="font-semibold">Decline reason:</span> {String(reviewNote)}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {isAwaiting && (
              <>
                <button
                  onClick={approve}
                  disabled={verifyMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => { setDeclineOpen(true); setError(''); }}
                  disabled={verifyMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Decline
                </button>
              </>
            )}
            {role !== 'ADMIN' && (
              <button
                onClick={() => toggleMutation.mutate(id!)}
                disabled={toggleMutation.isPending}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {user.isActive ? <><ShieldOff className="h-4 w-4" /> Deactivate</> : <><Shield className="h-4 w-4" /> Activate</>}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Landlord Details */}
          {role === 'LANDLORD' && landlord && (
            <div className="rounded-2xl border border-border bg-background p-6 lg:col-span-2">
              <h3 className="mb-4 font-bold">Landlord Details</h3>
              <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <Row label="Business Name" value={landlord.businessName} />
                <Row label="Operation Type" value={humanize(landlord.operationType)} />
                <Row label="CAC Number" value={landlord.cacNumber} />
                <Row label="Tax ID (TIN)" value={landlord.tin} />
                <Row label="Date of Birth" value={landlord.dateOfBirth} />
                <Row label="ID Type" value={humanize(landlord.idType)} />
                <Row label="ID Number" value={landlord.idNumber} />
                <Row label="Ownership Type" value={humanize(landlord.ownershipType)} />
                <Row label="Residential Address" value={landlord.residentialAddress} />
                <Row label="City" value={landlord.city} />
                <Row label="State" value={landlord.state} />
                <Row label="Country" value={landlord.country} />
                <Row label="Payout Provider" value={landlord.payoutProvider} />
                <Row label="Total Properties" value={landlord.totalProperties ?? 0} />
                <Row label="Onboarding" value={landlord.onboardingStatus} />
              </div>

              {/* Bank / payout account */}
              {(() => {
                const bank = landlord.bankAccount as Record<string, unknown> | null;
                if (!bank || Object.keys(bank).length === 0) return null;
                return (
                  <div className="mt-5 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-bold">Payout Bank Account</h4>
                    <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                      <Row label="Account Holder" value={bank.accountName} />
                      <Row label="Account Number" value={bank.accountNumber} />
                      <Row label="Bank" value={bank.bankName} />
                      <Row label="Bank Code" value={bank.bankCode} />
                    </div>
                  </div>
                );
              })()}

              {/* Onboarding responses */}
              {(() => {
                const od = landlord.onboardingData as Record<string, unknown> | null;
                if (!od || Object.keys(od).length === 0) return null;
                const propertyTypes = Array.isArray(od.propertyTypes) ? (od.propertyTypes as string[]) : [];
                const contactMethods = Array.isArray(od.contactMethods) ? (od.contactMethods as string[]) : [];
                const labelFor = (m: string) =>
                  ({ IN_APP: 'In-app messaging', EMAIL: 'Email', PHONE: 'Phone call', SMS: 'SMS' } as Record<string, string>)[m] ?? m;
                return (
                  <div className="mt-5 border-t border-border pt-4">
                    <h4 className="mb-3 text-sm font-bold">Onboarding Responses</h4>
                    <div className="space-y-3 text-sm">
                      {od.portfolioSize ? <Row label="Portfolio Size" value={`${od.portfolioSize} ${String(od.portfolioSize) === '1' ? 'property' : 'properties'}`} /> : null}
                      {propertyTypes.length > 0 ? (
                        <div>
                          <p className="mb-1.5 text-muted-foreground">Property Types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {propertyTypes.map((t) => (
                              <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{t}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {contactMethods.length > 0 ? (
                        <div>
                          <p className="mb-1.5 text-muted-foreground">Preferred Contact</p>
                          <div className="flex flex-wrap gap-1.5">
                            {contactMethods.map((m) => (
                              <span key={m} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{labelFor(m)}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })()}

              {docs.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="mb-2 text-sm font-bold">Verification Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {docs.map((d, i) => (
                      <a
                        key={`${d.url}-${i}`}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        <FileText className="h-3.5 w-3.5" /> {d.label || `Document ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(landlord.properties) && landlord.properties.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="mb-2 text-sm font-bold">Properties</h4>
                  <div className="space-y-2">
                    {(landlord.properties as Array<Record<string, unknown>>).slice(0, 8).map((p) => (
                      <div key={String(p.code)} className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-medium">{String(p.title)}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{String(p.status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tenant Details */}
          {role === 'TENANT' && tenant && (
            <div className="rounded-2xl border border-border bg-background p-6 lg:col-span-2">
              <h3 className="mb-4 font-bold">Tenant Details</h3>
              <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <Row label="KYC Status" value={humanize(tenant.kycStatus)} />
                <Row label="Screening Band" value={humanize(tenant.screeningBand)} />
                <Row label="Screening Score" value={tenant.screeningScore} />
                <Row label="Date of Birth" value={tenant.dateOfBirth} />
                <Row label="Nationality" value={tenant.nationality} />
                <Row label="Marital Status" value={humanize(tenant.maritalStatus)} />
                <Row label="Onboarded" value={yesNo(tenant.isOnboarded)} />
              </div>

              {/* Employment & income */}
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-bold">Employment & Income</h4>
                <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row label="Employment Status" value={humanize(tenant.employmentStatus)} />
                  <Row label="Employer" value={tenant.employerName} />
                  <Row label="Job Title" value={tenant.jobTitle} />
                  <Row label="Business Name" value={tenant.businessName} />
                  <Row label="Business Type" value={humanize(tenant.businessType)} />
                  <Row label="Monthly Income" value={money(tenant.monthlyIncome)} />
                  <Row label="Annual Income" value={money(tenant.annualIncome)} />
                </div>
              </div>

              {/* Identity */}
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-bold">Identity</h4>
                <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row label="ID Type" value={humanize(tenant.nationalIdType)} />
                  <Row label="ID Number" value={tenant.nationalIdNumber} />
                </div>
              </div>

              {/* Address & household */}
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-bold">Address & Household</h4>
                <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row label="Current Address" value={tenant.currentAddress} />
                  <Row label="Reason for Moving" value={tenant.reasonForMoving} />
                  <Row label="Number of Occupants" value={tenant.numberOfOccupants} />
                  <Row label="Has Pets" value={yesNo(tenant.hasPets)} />
                </div>
              </div>

              {/* Next of kin & emergency */}
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-bold">Next of Kin & Emergency</h4>
                <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row label="Next of Kin" value={tenant.nextOfKinName} />
                  <Row label="Next of Kin Phone" value={tenant.nextOfKinPhone} />
                  <Row label="Relationship" value={humanize(tenant.nextOfKinRelationship)} />
                  <Row label="Next of Kin Address" value={tenant.nextOfKinAddress} />
                  <Row label="Emergency Contact" value={tenant.emergencyContactName} />
                  <Row label="Emergency Phone" value={tenant.emergencyContactPhone} />
                </div>
              </div>

              {/* Banking */}
              {(() => {
                const hasBank = tenant.bankConnected || tenant.bankName || tenant.accountNumber;
                if (!hasBank) return null;
                return (
                  <div className="mt-5 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-bold">Banking</h4>
                    <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                      <Row label="Bank Connected" value={yesNo(tenant.bankConnected)} />
                      <Row label="Bank" value={tenant.bankName} />
                      <Row label="Account Number" value={tenant.accountNumber} />
                    </div>
                  </div>
                );
              })()}

              {/* KYC documents */}
              {(() => {
                const kycDocs = (tenant.kycDocs as Array<{ label?: string; url: string }> | undefined) ?? [];
                if (kycDocs.length === 0) return null;
                return (
                  <div className="mt-5 border-t border-border pt-4">
                    <h4 className="mb-2 text-sm font-bold">KYC Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {kycDocs.map((d, i) => (
                        <a
                          key={`${d.url}-${i}`}
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <FileText className="h-3.5 w-3.5" /> {d.label || `Document ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {Array.isArray(tenant.bookings) && tenant.bookings.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="mb-2 text-sm font-bold">Bookings</h4>
                  <div className="space-y-2">
                    {(tenant.bookings as Array<Record<string, unknown>>).slice(0, 8).map((b) => (
                      <div key={String(b.code)} className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
                        <span className="font-medium">Booking {String(b.code)}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{String(b.status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Decline modal */}
      {declineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeclineOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Decline {role === 'LANDLORD' ? 'verification' : 'KYC'}</h3>
              <button onClick={() => setDeclineOpen(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              Add a reason. The {role.toLowerCase()} will see this so they can fix and resubmit.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              autoFocus
              placeholder="e.g. ID document is blurry — please re-upload a clear photo."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeclineOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                disabled={verifyMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetailPage;
