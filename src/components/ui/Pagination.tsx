'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevNext = true,
  showFirstLast = false,
  className = '',
}: PaginationProps) {
  // Generate page numbers to display
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages);

  const siblingsStart = Math.max(
    Math.min(
      currentPage - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(
      currentPage + siblingCount,
      boundaryCount + siblingCount * 2 + 2
    ),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  const itemList = [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['start-ellipsis']
      : boundaryCount + 1 < totalPages - boundaryCount
      ? [boundaryCount + 1]
      : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < totalPages - boundaryCount - 1
      ? ['end-ellipsis']
      : totalPages - boundaryCount > boundaryCount
      ? [totalPages - boundaryCount]
      : []),
    ...endPages,
  ];

  const items = itemList.map((item, index) => {
    if (typeof item === 'number') {
      return {
        key: index,
        onClick: () => onPageChange(item),
        disabled: item === currentPage,
        active: item === currentPage,
        page: item,
        type: 'page' as const,
      };
    } else {
      return {
        key: index,
        onClick: () => {},
        disabled: true,
        active: false,
        page: null,
        type: 'ellipsis' as const,
      };
    }
  });

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Pagination">
      {/* First Page Button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 min-w-[2.5rem]"
          aria-label="Go to first page"
        >
          «
        </Button>
      )}

      {/* Previous Page Button */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 min-w-[2.5rem]"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page Numbers */}
      {items.map((item) => {
        if (item.type === 'ellipsis') {
          return (
            <span
              key={item.key}
              className="px-2.5 py-1.5 text-gray-500 dark:text-gray-400"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        return (
          <Button
            key={item.key}
            variant={item.active ? 'primary' : 'outline'}
            size="sm"
            onClick={item.onClick}
            disabled={item.disabled}
            className="px-2.5 py-1.5 min-w-[2.5rem]"
            aria-label={item.active ? `Current page, page ${item.page}` : `Go to page ${item.page}`}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.page}
          </Button>
        );
      })}

      {/* Next Page Button */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 min-w-[2.5rem]"
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Last Page Button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 min-w-[2.5rem]"
          aria-label="Go to last page"
        >
          »
        </Button>
      )}
    </nav>
  );
}

// Simple pagination variant for mobile
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: Omit<PaginationProps, 'siblingCount' | 'boundaryCount' | 'showPrevNext' | 'showFirstLast'>) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        icon={ChevronLeft}
        iconPosition="left"
        className="text-sm"
      >
        Previous
      </Button>
      
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        icon={ChevronRight}
        iconPosition="right"
        className="text-sm"
      >
        Next
      </Button>
    </div>
  );
}