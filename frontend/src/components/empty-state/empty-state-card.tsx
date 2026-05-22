import type { ReactNode } from 'react';
import emptyStateImage from '@/assets/images/dashboard/empty-state.svg?url';
import { CustomButton } from '@/components/button';
import { cn } from '@/lib/utils';

type EmptyStateCardProps = {
  title: string;
  description: string;
  buttonName?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  className?: string;
};

export function EmptyStateCard({
  title,
  description,
  buttonName = '',
  buttonIcon,
  onButtonClick,
  className,
}: EmptyStateCardProps) {
  return (
    <section
      className={cn(
        'flex min-h-[560px] w-full items-center justify-center px-6 py-10 animate-page-reveal',
        className
      )}
    >
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        <img
          src={emptyStateImage}
          alt=""
          aria-hidden="true"
          className="mb-8 h-auto w-45 select-none object-contain animate-reveal-soft"
        />
        <h2 className="text-2xl font-semibold leading-7 tracking-[-0.02em] text-foreground animate-reveal-soft reveal-delay-1">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-96 text-sm leading-5 animate-reveal-soft reveal-delay-2">
          {description}
        </p>
        {buttonName && (
          <CustomButton
            type="button"
            variant="primary"
            size="lg"
            icon={buttonIcon}
            onClick={onButtonClick}
            className="mt-6 h-9 min-w-45 rounded-full px-5 text-sm font-medium leading-5 animate-reveal-soft reveal-delay-3"
          >
            {buttonName}
          </CustomButton>
        )}
      </div>
    </section>
  );
}
