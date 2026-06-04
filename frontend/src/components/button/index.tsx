import { Button as UIButton } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type CustomButtonProps = ComponentProps<typeof UIButton> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    icon?: React.ReactNode;
    iconPlacement?: 'left' | 'right';
  };

const CustomButton = ({
  className,
  variant,
  size = 'default',
  loading = false,
  icon,
  iconPlacement = 'left',
  children,
  disabled,
  ...props
}: CustomButtonProps) => {
  return (
    <UIButton
      variant={variant}
      size={size}
      className={cn('rounded-full px-3', className)}
      disabled={loading || disabled}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {/* Left Icon (or Spinner if loading and placement is left) */}
        {iconPlacement === 'left' && (loading || icon) && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {loading ? <Spinner className="size-4" /> : icon}
          </span>
        )}

        {/* Children (Text) */}
        {children && <span>{children}</span>}

        {/* Right Icon (or Spinner if loading and placement is right) */}
        {iconPlacement === 'right' && (loading || icon) && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {loading ? <Spinner className="size-4" /> : icon}
          </span>
        )}
      </span>
    </UIButton>
  );
};

export { CustomButton };
