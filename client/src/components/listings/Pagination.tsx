"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage = 12,
  onPageChange,
}) => {
  if (totalPages <= 1 && totalCount <= itemsPerPage) {
    return null;
  }

  // Generate pagination items with ellipses (e.g. 1, 2, 3, 4, '...', 15)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-12 select-none">
      {/* Circular Numbered Navigation Row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition
            ${
              currentPage === 1
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-800 hover:bg-neutral-100 cursor-pointer"
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Page Buttons */}
        {pages.map((p, idx) => {
          if (typeof p === "string") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-neutral-500"
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs transition cursor-pointer
                ${
                  isActive
                    ? "bg-neutral-900 text-white font-bold shadow-sm"
                    : "text-neutral-800 hover:bg-neutral-100 font-semibold"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition
            ${
              currentPage === totalPages
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-800 hover:bg-neutral-100 cursor-pointer"
            }
          `}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Summary caption */}
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-600 font-medium">
          {totalCount > 0 ? (
            <>
              {startItem} – {endItem} of {totalCount > 100 ? `${totalCount}+` : totalCount} places to stay
            </>
          ) : (
            "0 places to stay"
          )}
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Additional fees apply. Taxes may be added.
        </p>
      </div>
    </div>
  );
};

export default Pagination;
