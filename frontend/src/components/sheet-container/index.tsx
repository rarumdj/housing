import { CustomButton } from '@/components/button';
import { cn } from '@/lib/utils';

type SheetContainerProps = {
  title?: string;
  description?: string;
  onCancel?: () => void;
  onContinue?: () => void;
  continueLoading?: boolean;
  cancelButtonText?: string;
  continueButtonText?: string;
  children: React.ReactNode;
};

export const SheetContainer = ({
  title = 'Add your employees',
  description = "Choose how you'd like to upload your team's information.",
  onCancel,
  onContinue,
  continueLoading = false,
  cancelButtonText = 'Cancel',
  continueButtonText = 'Continue',
  children,
}: SheetContainerProps) => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col h-full w-full bg-background overflow-hidden mx-auto max-w-4xl rounded-xl'
      )}
    >
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-accent-foreground">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">{children}</div>

      <div
        className={cn(
          'flex shrink-0 mt-auto flex-row justify-end gap-4 border-t border-border px-6 py-4'
        )}
      >
        {onCancel && (
          <CustomButton
            size="default"
            className="rounded-full px-3"
            variant="outline"
            onClick={onCancel}
          >
            {cancelButtonText}
          </CustomButton>
        )}
        <CustomButton
          size="default"
          className="rounded-full px-3"
          variant="default"
          onClick={onContinue}
          loading={continueLoading}
          disabled={continueLoading}
        >
          {continueButtonText}
        </CustomButton>
      </div>
    </div>
  );
};
