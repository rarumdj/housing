import { cn } from '@/lib/utils';
import { Loading01 } from '@untitledui/icons';

const Spinner = ({ className, ...props }: React.ComponentProps<'svg'>) => {
  return (
    <Loading01
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
};

export { Spinner };
