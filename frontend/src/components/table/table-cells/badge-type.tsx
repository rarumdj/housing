import React from 'react';
import { Badge } from '../../ui/badge';
import { cn } from '@/lib/utils';

/** Cream / tan pill used for pending & submitted states (reference table design). */
const submittedPillClass =
  'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-100';

const getBadgeVariants = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'inactive':
    case 'draft':
    case 'disabled':
    case 'not started':
    case 'deactivated':
    case 'n/a':
      return 'border-border/70 bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground';
    case 'processing':
    case 'pending':
    case 'partial payment':
    case 'submitted':
    case 'under_review':
      return submittedPillClass;
    case 'success':
    case 'successful':
    case 'available':
    case 'enabled':
    case 'approved':
    case 'completed':
    case 'paid':
    case 'verified':
    case 'active':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100';
    case 'failed':
    case 'required':
    case 'rejected':
    case 'expired':
    case 'deleted':
    case 'overdue':
    case 'conflicted':
    case 'invalid phone number':
    case 'invalid date':
    case 'duplicate employee number':
    case 'duplicate employee id':
    case 'duplicate phone number':
      return 'border-red-200 bg-red-50 text-red-800 dark:border-destructive/35 dark:bg-destructive/20 dark:text-destructive-foreground';
    case 'missing required data':
      return submittedPillClass;
    default:
      return 'border-border/70 bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground';
  }
};

// 17a34a
const BadgeType = React.memo(({ value }: { value: string }) => {
  if (!value) return <div />;

  return (
    <div className="w-fit">
      <Badge
        variant="outline"
        className={cn(
          getBadgeVariants(value),
          'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide'
        )}
      >
        {value}
      </Badge>
    </div>
  );
});
export default BadgeType;
