import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextInput } from './atoms/text-input';
import type { InputProps } from './atoms/variants';

type SearchFieldProps = InputProps & {
  wrapperClassName?: string;
};

export const SearchField = ({ className, wrapperClassName, ...props }: SearchFieldProps) => {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <TextInput className={cn('pl-10', className)} {...props} />
    </div>
  );
};
