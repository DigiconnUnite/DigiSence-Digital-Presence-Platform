import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsToolbar, Pagination } from "@/components/ui/pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import { Eye, Filter, Mail, Search, SlidersHorizontal, Trash2, User, MessageSquare } from "lucide-react";
import type { BusinessQueryParams } from "../types";

interface InquiriesViewProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  inquiries: any[];
  selectedInquiries: Set<string>;
  handleSelectAllInquiries: () => void;
  handleDeselectAllInquiries: () => void;
  handleInquiryBulkActivate: () => Promise<void>;
  handleInquiryBulkSuspend: () => Promise<void>;
  handleInquiryBulkDelete: () => void;
  handleViewInquiry: (inquiry: any) => void;
  handleReplyInquiry: (inquiry: any) => void;
  handleDeleteInquiry: (inquiry: any) => void;
  inquiryQuery: BusinessQueryParams;
  setInquiryQuery: React.Dispatch<React.SetStateAction<BusinessQueryParams>>;
  inquiryPagination: { page: number; limit: number; totalItems: number; totalPages: number } | null;
}

export default function InquiriesView({
  searchTerm,
  setSearchTerm,
  inquiries,
  selectedInquiries,
  handleSelectAllInquiries,
  handleDeselectAllInquiries,
  handleInquiryBulkActivate,
  handleInquiryBulkSuspend,
  handleInquiryBulkDelete,
  handleViewInquiry,
  handleReplyInquiry,
  handleDeleteInquiry,
  inquiryQuery,
  setInquiryQuery,
  inquiryPagination,
}: InquiriesViewProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Contact Inquiries Management</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage customer inquiries</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setInquiryQuery((prev) => ({ ...prev, page: 1 }))}
            className="rounded-xl border-gray-200"
          >
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Status</span>
          </Button>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search inquiries..."
            className="pl-10 pr-12 w-full rounded-xl rounded-r-none border-gray-200 bg-white focus-visible:ring-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            className="rounded-none rounded-r-xl border-l-0 border-gray-200 bg-transparent hover:bg-gray-100 h-[42px] px-3"
          >
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {selectedInquiries.size > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <BulkActionsToolbar
            selectedCount={selectedInquiries.size}
            totalCount={inquiries.length}
            onSelectAll={handleSelectAllInquiries}
            onDeselectAll={handleDeselectAllInquiries}
            onBulkActivate={handleInquiryBulkActivate}
            onBulkDeactivate={handleInquiryBulkSuspend}
            onBulkDelete={handleInquiryBulkDelete}
          />
        </div>
      )}

      <div className="bg-white rounded-md  overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080322]">
              <TableRow>
                <TableHead className="w-14 text-white font-medium">SN.</TableHead>
                <TableHead className="text-white font-medium">Customer</TableHead>
                <TableHead className="text-white font-medium">Business</TableHead>
                <TableHead className="text-white font-medium">Message</TableHead>
                <TableHead className="text-center text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Date</TableHead>
                <TableHead className="text-center text-white font-medium ">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries
                .filter((inquiry) => {
                  const matchesSearch =
                    inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesSearch;
                })
                .map((inquiry, index) => (
                  <TableRow key={inquiry.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-500 font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{inquiry.business?.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{inquiry.message}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <StatusBadge
                          status={inquiry.status}
                          variant={inquiry.status === "PENDING" ? "warning" : inquiry.status === "REPLIED" ? "success" : "neutral"}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100" onClick={() => handleViewInquiry(inquiry)} title="View Details">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100" onClick={() => handleReplyInquiry(inquiry)} title="Reply">
                          <Mail className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50" onClick={() => handleDeleteInquiry(inquiry)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {inquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search" : "There are no customer inquiries yet"}
            </p>
          </div>
        )}

        {inquiries.length > 0 && (
          <div className="p-2 border-t">
            <Pagination
              currentPage={inquiryPagination?.page || 1}
              totalPages={inquiryPagination?.totalPages || 1}
              totalItems={inquiries.length}
              itemsPerPage={inquiryPagination?.limit || 10}
              onPageChange={(page) => setInquiryQuery((prev) => ({ ...prev, page }))}
              onItemsPerPageChange={(limit) => setInquiryQuery((prev) => ({ ...prev, limit, page: 1 }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
