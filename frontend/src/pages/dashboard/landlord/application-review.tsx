import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase, Calendar, Check, ChevronLeft, CreditCard, Download,
  FileText, Loader2, MapPin, Phone, Mail, Shield, User, Users, X,
} from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { useApplicationDetailQuery, useAcceptBookingMutation, useDeclineBookingMutation } from '@/services/bookings/queries';
import { formatDate, formatNaira } from '@/lib/utils';

const statusBadge: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  DECLINED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: typeof User }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" /> : <div className="w-4" />}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{String(value)}</p>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 font-display text-base font-bold">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
};

const ApplicationReviewPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useApplicationDetailQuery(id);
  const acceptMutation = useAcceptBookingMutation();
  const declineMutation = useDeclineBookingMutation();
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const application = data?.data;
  const tenant = application?.tenant;
  const tenantUser = tenant?.user;
  const property = application?.property;
  const lease = application?.lease;

  const handleAccept = () => {
    acceptMutation.mutate(id, {
      onSuccess: () => {
        setActionDone('accepted');
        setTimeout(() => navigate(dashboardKeys.landlord.home.path), 2000);
      },
    });
  };

  const handleDecline = () => {
    declineMutation.mutate(
      { id, reason: declineReason },
      {
        onSuccess: () => {
          setActionDone('declined');
          setTimeout(() => navigate(dashboardKeys.landlord.home.path), 2000);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="font-display text-2xl font-bold">Application not found</h2>
          <Link to={dashboardKeys.landlord.home.path} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPending = ['APPLIED', 'UNDER_REVIEW'].includes(application.status);

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container py-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to={dashboardKeys.landlord.home.path}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to dashboard
          </Link>

          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold">Application Review</h1>
              <p className="mt-1 text-muted-foreground">{property?.title} — {property?.address}</p>
            </div>
            <span className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${statusBadge[application.status] ?? 'bg-muted text-muted-foreground'}`}>
              {application.status.replace(/_/g, ' ')}
            </span>
          </div>

          {actionDone && (
            <div className={`mb-6 rounded-2xl p-4 text-sm font-medium ${actionDone === 'accepted' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'}`}>
              Application {actionDone}. {actionDone === 'accepted' ? 'Tenancy agreement has been generated.' : ''} Redirecting…
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr,0.8fr]">
            {/* Left — Tenant Profile */}
            <div className="space-y-4">
              {/* Tenant Identity */}
              <SectionCard title="Tenant Information">
                <div className="flex items-center gap-4 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">
                      {tenantUser?.firstName} {tenantUser?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tenantUser?.email}
                    </p>
                  </div>
                </div>
                <InfoRow label="Phone" value={tenantUser?.phone} icon={Phone} />
                <InfoRow label="Email" value={tenantUser?.email} icon={Mail} />
                <InfoRow label="Marital Status" value={tenant?.maritalStatus?.replace(/_/g, ' ')} icon={User} />
                <InfoRow label="Date of Birth" value={tenant?.dateOfBirth ? formatDate(tenant.dateOfBirth) : undefined} icon={Calendar} />
                <InfoRow label="Nationality" value={tenant?.nationality} />
                <InfoRow label="Current Address" value={tenant?.currentAddress} icon={MapPin} />
                <InfoRow label="Number of Occupants" value={tenant?.numberOfOccupants} icon={Users} />
                <InfoRow label="Has Pets" value={tenant?.hasPets ? 'Yes' : 'No'} />
                <InfoRow label="Reason for Moving" value={tenant?.reasonForMoving} />
              </SectionCard>

              {/* Employment */}
              <SectionCard title="Employment & Business">
                <InfoRow label="Employment Status" value={tenant?.employmentStatus?.replace(/_/g, ' ')} icon={Briefcase} />
                <InfoRow label="Job Title" value={tenant?.jobTitle} />
                <InfoRow label="Employer" value={tenant?.employerName} />
                <InfoRow label="Business Name" value={tenant?.businessName} />
                <InfoRow label="Business Type" value={tenant?.businessType} />
              </SectionCard>

              {/* Financial */}
              <SectionCard title="Financial Information">
                <InfoRow label="Monthly Income" value={tenant?.monthlyIncome ? formatNaira(tenant.monthlyIncome) : undefined} icon={CreditCard} />
                <InfoRow label="Annual Income" value={tenant?.annualIncome ? formatNaira(tenant.annualIncome) : undefined} />
                <InfoRow label="Bank" value={tenant?.bankName} />
                <InfoRow label="Account Number" value={tenant?.accountNumber} />
                <InfoRow label="Screening Band" value={tenant?.screeningBand} />
              </SectionCard>

              {/* Identity */}
              <SectionCard title="Identity Verification">
                <InfoRow label="ID Type" value={tenant?.nationalIdType?.replace(/_/g, ' ')} icon={Shield} />
                <InfoRow label="ID Number" value={tenant?.nationalIdNumber} />
                <InfoRow label="KYC Status" value={tenant?.kycStatus} />
              </SectionCard>

              {/* Next of Kin */}
              <SectionCard title="Next of Kin / Emergency">
                <InfoRow label="Next of Kin" value={tenant?.nextOfKinName} icon={Users} />
                <InfoRow label="Phone" value={tenant?.nextOfKinPhone} icon={Phone} />
                <InfoRow label="Relationship" value={tenant?.nextOfKinRelationship} />
                <InfoRow label="Address" value={tenant?.nextOfKinAddress} icon={MapPin} />
                <InfoRow label="Emergency Contact" value={tenant?.emergencyContactName} />
                <InfoRow label="Emergency Phone" value={tenant?.emergencyContactPhone} icon={Phone} />
              </SectionCard>
            </div>

            {/* Right — Property + Actions */}
            <div className="space-y-4">
              {/* Property summary */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 font-display text-base font-bold">Property</h3>
                <p className="font-medium">{property?.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[property?.address, property?.lga, property?.state].filter(Boolean).join(', ')}
                </p>
                {property?.priceAnnually ? (
                  <p className="mt-3 text-lg font-bold text-primary">{formatNaira(property.priceAnnually)}/year</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {property?.type?.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Application message */}
              {application.message ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-2 font-display text-base font-bold">Application Message</h3>
                  <p className="text-sm text-muted-foreground">{application.message}</p>
                </div>
              ) : null}

              {/* Agreement download */}
              {lease?.agreementUrl ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-emerald-800 dark:text-emerald-200">
                    <FileText className="h-5 w-5" />
                    Tenancy Agreement
                  </h3>
                  <p className="mb-3 text-xs text-emerald-700 dark:text-emerald-300">
                    Generated on {lease.agreementGeneratedAt ? formatDate(lease.agreementGeneratedAt) : 'acceptance'}
                  </p>
                  <a
                    href={lease.agreementUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4" /> Download Agreement PDF
                  </a>
                </div>
              ) : null}

              {/* Actions */}
              {isPending && !actionDone ? (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-3 font-display text-base font-bold">Decision</h3>

                  {showDeclineForm ? (
                    <div className="space-y-3">
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Reason for declining (optional)"
                        rows={3}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDecline}
                          disabled={declineMutation.isPending}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          {declineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => setShowDeclineForm(false)}
                          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Accepting will generate a tenancy agreement with both parties' details.
                      </p>
                      <button
                        onClick={handleAccept}
                        disabled={acceptMutation.isPending}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve Application
                      </button>
                      <button
                        onClick={() => setShowDeclineForm(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <X className="h-4 w-4" /> Decline Application
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Decline reason */}
              {application.declineReason ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
                  <h3 className="mb-1 text-sm font-bold text-red-800 dark:text-red-200">Decline Reason</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{application.declineReason}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationReviewPage;
