"use client";

import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = "",
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible page range
      let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
      
      // Adjust start if needed
      if (end === totalPages - 1) {
        start = Math.max(2, end - maxVisiblePages + 1);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }
      
      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className={`flex flex-row items-center  justify-between gap-4 ${className}`}>
      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show</span>
          <select
            value={itemsPerPage}
            
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>
      )}

      {/* Pagination info */}
      <div className="text-sm hidden sm:flex text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg bg-none"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 py-1 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={currentPage === page ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 p-0 rounded-lg ${
                    currentPage === page
                      ? "border-2 text-gray-800 bg-none"
                      : ""
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  className = "",
}: BulkActionsProps) {
  const allSelected = selectedCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Select checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someSelected;
              }
            }}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} selected
          </span>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkActivate}
          disabled={selectedCount === 0}
          className="rounded-lg text-green-600 hover:bg-green-50"
        >
          Activate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDeactivate}
          disabled={selectedCount === 0}
          className="rounded-lg text-amber-600 hover:bg-amber-50"
        >
          Suspend
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          disabled={selectedCount === 0}
          className="rounded-lg text-red-600 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
