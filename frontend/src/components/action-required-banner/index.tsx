import { RiCloseLine, RiErrorWarningLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

type ActionRequiredBannerProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** When true, renders a dismiss control (requires `onDismiss`). */
  showDismissButton?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

export const ActionRequiredBanner = ({
  message,
  actionLabel = "Action required",
  onAction,
  showDismissButton = false,
  onDismiss,
  dismissLabel = "Dismiss",
  className,
}: ActionRequiredBannerProps) => {
  const dismissControl =
    showDismissButton && onDismiss ? (
      <button
        type="button"
        onClick={onDismiss}
        aria-label={dismissLabel}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RiCloseLine className="size-4" aria-hidden />
      </button>
    ) : null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3",
        className,
      )}>
      <div className="flex min-w-0 flex-1 items-center gap-3 text-foreground">
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground/10 text-foreground">
          <RiErrorWarningLine className="size-3" />
        </span>
        <p className="truncate text-sm font-normal">{message}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 text-sm font-normal text-foreground underline underline-offset-2 hover:text-foreground/80">
            {actionLabel}
          </button>
        )}
        {dismissControl}
      </div>
    </div>
  );
};
