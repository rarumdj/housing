import { cn } from '@/lib/utils';
import type React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface IconTextProps {
  icon: React.ReactNode;
  text?: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'default' | 'sm' | 'lg';
}

const IconText = ({
  icon,
  text,
  className,
  fallbackClassName,
  size = 'sm',
}: IconTextProps) => {
  return (
    <>
      <Avatar
        size={size}
        className={cn(
          'rounded-md after:rounded-md after:border-brand-200 dark:after:border-brand-800/80',
          className
        )}
      >
        <AvatarFallback
          className={cn(
            'rounded-md bg-brand-100 text-brand-700',
            'dark:bg-brand-800 dark:text-brand-50 dark:ring-1 dark:ring-brand-600/35',
            '[&_svg]:shrink-0',
            fallbackClassName
          )}
        >
          {icon}
        </AvatarFallback>
      </Avatar>
      {text && <span>{text}</span>}
    </>
  );
};

export default IconText;
