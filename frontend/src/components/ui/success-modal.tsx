import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomButton } from '@/components/button';
import rankSuccess from '@/assets/images/dashboard/rank-success.svg?url';

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  onDone?: () => void;
  doneButtonText?: string;
  showCloseButton?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onDone,
  doneButtonText = 'Done',
  showCloseButton = false,
}) => {
  const handleDone = () => {
    onDone?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className="max-w-full rounded-2xl border-none p-10 text-center"
      >
        <img
          src={rankSuccess}
          alt="Success"
          className="mx-auto h-24 w-24 object-contain"
        />
        <DialogTitle className="text-2xl font-bold text-[#2B2E33]">{title}</DialogTitle>
        <DialogDescription className="mt-3 text-sm text-muted-foreground">
          {description}
        </DialogDescription>
        <div className="mt-8 flex justify-center">
          <CustomButton
            type="button"
            size="lg"
            className="rounded-full bg-brand-base px-10 text-background hover:bg-brand-600"
            onClick={handleDone}
          >
            {doneButtonText}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
