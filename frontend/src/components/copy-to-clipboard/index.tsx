import { copyToClipboard, shortenString } from '@/lib/utils';
import { Copy } from 'lucide-react';

const CopyToClipboard = ({
  value,
  truncateLength,
}: {
  value: string;
  truncateLength?: undefined | number;
}) => {
  return (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      {truncateLength ? shortenString(value || '-', truncateLength) : value}
      {value && !['-', 'NA', 'N/A'].includes(value.trim().toUpperCase()) && (
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(value);
          }}
        >
          <Copy className="size-3.5" />
        </button>
      )}
    </span>
  );
};

export default CopyToClipboard;
