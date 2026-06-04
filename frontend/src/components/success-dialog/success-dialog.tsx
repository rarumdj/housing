import type { ReactNode } from 'react';
import { CustomButton } from '@/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

type SuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  imageSrc: string;
  imageAlt?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const SuccessDialog = ({
  open,
  onOpenChange,
  title,
  description,
  imageSrc,
  imageAlt = 'Success',
  actionLabel = 'Done',
  onAction,
}: SuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-full rounded-2xl border-none p-10 text-center"
      >
        <img src={imageSrc} alt={imageAlt} className="mx-auto h-24 w-24 object-contain" />
        <DialogTitle className="text-accent-foreground text-2xl font-bold">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-muted-foreground mt-1 flex flex-col items-center justify-center gap-2 text-sm">
            {description}
          </DialogDescription>
        )}
        <div className="mt-4 flex justify-center">
          <CustomButton
            type="button"
            size="default"
            className="rounded-full bg-brand-base px-10 text-background hover:bg-brand-600"
            onClick={onAction}
          >
            {actionLabel}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
