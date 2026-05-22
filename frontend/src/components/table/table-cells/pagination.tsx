import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from '@untitledui/icons';

export type PaginateProps = {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  handlePaginate?: (page: number) => void;
  setPageSize?: (size: number) => void;
  pageSize?: number;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | { type: 'ellipsis'; position: 'start' | 'end' })[] {
  const pages: (number | { type: 'ellipsis'; position: 'start' | 'end' })[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (currentPage <= 4) {
    for (let i = 2; i <= 4; i++) pages.push(i);
    if (totalPages > 5) pages.push({ type: 'ellipsis', position: 'end' });
  } else if (currentPage >= totalPages - 3) {
    pages.push({ type: 'ellipsis', position: 'start' });
    for (let i = totalPages - 3; i <= totalPages - 1; i++) pages.push(i);
  } else {
    pages.push({ type: 'ellipsis', position: 'start' });
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
    pages.push({ type: 'ellipsis', position: 'end' });
  }

  if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);
  return pages;
}

const Pagination = (meta: PaginateProps) => {
  const {
    currentPage = 1,
    hasNextPage = false,
    hasPreviousPage = false,
    perPage = 20,
    total = 0,
    handlePaginate,
    setPageSize,
    pageSize = 10,
  } = meta;

  const totalPages = Math.ceil(Number(total) / Number(perPage)) || 1;

  const handleEllipsisClick = (position: 'start' | 'end') => {
    if (!handlePaginate) return;
    const targetPage =
      position === 'start'
        ? Math.floor((4 + currentPage) / 2)
        : Math.floor((currentPage + totalPages) / 2);
    handlePaginate(Math.max(1, Math.min(targetPage, totalPages)));
  };

  const pages = getPageNumbers(currentPage, totalPages);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasPreviousPage) handlePaginate?.(currentPage - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasNextPage) handlePaginate?.(currentPage + 1);
  };

  const baseLinkClass =
    'text-sm font-medium text-accent-foreground transition-colors hover:text-accent-foreground';
  const inactiveHover = 'hover:bg-muted rounded-full';

  return (
    <div className="mt-5 flex w-full flex-wrap items-center justify-between gap-4">
      <PaginationNav className="mx-0 w-auto justify-start">
        <PaginationContent className="flex items-center gap-2">
          {pages.map((page, index) =>
            typeof page === 'object' ? (
              <PaginationItem key={`ellipsis-${page.position}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleEllipsisClick(page.position)}
                  className={cn(
                    'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm text-foreground transition-colors hover:bg-muted',
                    baseLinkClass
                  )}
                  aria-label="More pages"
                >
                  <PaginationEllipsis className="size-8 text-accent-foreground [&_svg]:size-4 [&_svg]:text-current" />
                </button>
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  size="icon"
                  isActive={page === currentPage}
                  className={cn(
                    'size-8 text-sm font-medium text-accent-foreground transition-colors',
                    page === currentPage
                      ? 'rounded-full border border-border bg-muted hover:bg-muted/80 hover:text-foreground'
                      : cn(
                          'rounded-full border border-transparent bg-transparent hover:bg-muted hover:text-foreground',
                          baseLinkClass,
                          inactiveHover
                        )
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePaginate?.(page);
                  }}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem className="ml-3">
            <PaginationLink
              href="#"
              size="icon"
              className={cn(
                'size-8 rounded-full border-0 bg-transparent text-accent-foreground transition-colors hover:bg-muted hover:text-accent-foreground',
                baseLinkClass,
                inactiveHover,
                !hasPreviousPage && 'pointer-events-none opacity-50'
              )}
              onClick={handlePrev}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="size-4 text-accent-foreground" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="icon"
              className={cn(
                'size-8 rounded-full border-0 bg-transparent text-accent-foreground transition-colors hover:bg-muted hover:text-accent-foreground',
                baseLinkClass,
                inactiveHover,
                !hasNextPage && 'pointer-events-none opacity-50'
              )}
              onClick={handleNext}
              aria-label="Go to next page"
            >
              <ChevronRight className="size-4 text-accent-foreground" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </PaginationNav>

      {setPageSize && (
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger
            className="h-9 w-fit min-w-[180px] rounded-lg border-0 bg-muted/50 px-3 py-2 text-sm text-accent-foreground shadow-none hover:bg-muted/80 **:data-[slot=select-value]:line-clamp-none **:data-[slot=select-value]:backgroundspace-nowrap"
            data-testid="pagination-page-size"
          >
            <SelectValue placeholder="Showing 10 entries">
              Showing {pageSize} entries
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                Showing {size} entries
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export { Pagination };
