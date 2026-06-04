import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { dashboardKeys } from '@/routes/keys';
import { cn, formatNaira } from '@/lib/utils';
import { useAdminFeesQuery, useCreateFeeMutation, useUpdateFeeMutation, useDeleteFeeMutation } from '@/services/admin/queries';
import type { PlatformFee } from '@/types/domain';
import { TextInput } from '@/components/forms/atoms/text-input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { CustomButton } from '@/components/button';

const SAMPLE_RENT = 5000000;

interface FeeFormState {
  name: string;
  slug: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: string;
  description: string;
}

const emptyForm: FeeFormState = { name: '', slug: '', type: 'PERCENTAGE', value: '', description: '' };

const AdminFeesPage = () => {
  const { data, isLoading } = useAdminFeesQuery();
  const createMutation = useCreateFeeMutation();
  const updateMutation = useUpdateFeeMutation();
  const deleteMutation = useDeleteFeeMutation();

  const fees = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeeFormState>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (fee: PlatformFee) => {
    setForm({ name: fee.name, slug: fee.slug, type: fee.type, value: String(fee.value), description: fee.description ?? '' });
    setEditingId(fee.code);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, slug: form.slug, type: form.type, value: Number(form.value), description: form.description };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleToggle = (fee: PlatformFee) => {
    updateMutation.mutate({ id: fee.code, isActive: !fee.isActive });
  };

  const calcAmount = (fee: PlatformFee) =>
    fee.type === 'PERCENTAGE' ? Math.round(SAMPLE_RENT * fee.value / 100) : fee.value;

  const totalSampleFees = fees.filter((f) => f.isActive).reduce((s, f) => s + calcAmount(f), 0);

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-4xl py-8">
        <Link to={dashboardKeys.admin.home.path} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Platform Fees</h1>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Fee
          </button>
        </div>

        {/* Sample calculation */}
        <div className="mb-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
          <h3 className="mb-2 text-sm font-bold text-primary">Fee Preview (sample rent: {formatNaira(SAMPLE_RENT)}/yr)</h3>
          <div className="space-y-1 text-sm">
            {fees.filter((f) => f.isActive).map((f) => (
              <div key={f.code} className="flex justify-between">
                <span>{f.name} ({f.type === 'PERCENTAGE' ? `${f.value}%` : 'Flat'})</span>
                <span className="font-medium">{formatNaira(calcAmount(f))}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-primary/20 pt-1 font-bold">
              <span>Total Fees</span>
              <span>{formatNaira(totalSampleFees)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tenant pays (rent + deposit + fees)</span>
              <span>{formatNaira(SAMPLE_RENT + totalSampleFees)}</span>
            </div>
          </div>
        </div>

        {/* Fee Form Modal */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editingId ? 'Edit Fee' : 'New Fee'}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <FieldLabel>Name</FieldLabel>
                    <TextInput
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Agency Fee"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Slug</FieldLabel>
                    <TextInput
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })
                      }
                      placeholder="e.g. agency_fee"
                      required
                      disabled={!!editingId}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <FieldLabel>Type</FieldLabel>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as 'PERCENTAGE' | 'FLAT' })}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount (NGN)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Value {form.type === 'PERCENTAGE' ? '(%)' : '(NGN)'}</FieldLabel>
                    <TextInput
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      min={0}
                      step={form.type === 'PERCENTAGE' ? '0.1' : '1'}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Description</FieldLabel>
                  <TextInput
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <CustomButton
                  type="submit"
                  variant="primary"
                  loading={createMutation.isPending || updateMutation.isPending}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Save Changes' : 'Create Fee'}
                </CustomButton>
              </FieldGroup>
            </form>
          </div>
        )}

        {/* Fee List */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : fees.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">No fees configured. Add your first platform fee.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => (
              <div key={fee.code} className={cn('flex items-center gap-4 rounded-2xl border bg-background p-5 transition-colors', fee.isActive ? 'border-border' : 'border-dashed border-muted opacity-60')}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{fee.name}</p>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{fee.slug}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{fee.description || 'No description'}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {fee.type === 'PERCENTAGE' ? `${fee.value}%` : formatNaira(fee.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{fee.type === 'PERCENTAGE' ? 'of annual rent' : 'flat amount'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(fee)}
                    className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', fee.isActive ? 'bg-primary' : 'bg-muted')}
                  >
                    <span className={cn('inline-block h-4 w-4 rounded-full bg-white transition-transform', fee.isActive ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                  <button onClick={() => openEdit(fee)} className="rounded-lg p-2 hover:bg-muted"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => deleteMutation.mutate(fee.code)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeesPage;
