import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { BulkActionsToolbar, Pagination } from "@/components/ui/pagination";
import {
  AlertTriangle,
  Building,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Power,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import type { Business, BusinessApiResponse, BusinessQueryParams } from "../types";

interface BusinessesViewProps {
  dataFetchError: string | null;
  fetchData: () => Promise<void>;
  fetchBusinesses: () => Promise<void>;
  businessQuery: BusinessQueryParams;
  setBusinessQuery: React.Dispatch<React.SetStateAction<BusinessQueryParams>>;
  businessData: BusinessApiResponse | null;
  filteredBusinesses: Business[];
  handleExport: () => Promise<void>;
  exportLoading: boolean;
  onOpenAddBusiness: () => void;
  addBusinessLoading: boolean;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedBusinessIds: Set<string>;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  handleSelectBusiness: (businessId: string) => void;
  businessBulkActions: {
    handleBulkActivate: () => Promise<void>;
    handleBulkDeactivate: () => Promise<void>;
    handleBulkDelete: () => Promise<void>;
  };
  businessLoading: boolean;
  toggleLoading: string | null;
  handleToggleBusinessStatus: (e: React.MouseEvent, business: Business) => Promise<void>;
  handleEditBusiness: (business: Business) => void;
  handleDeleteBusiness: (business: Business) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
}

export default function BusinessesView({
  dataFetchError,
  fetchData,
  fetchBusinesses,
  businessQuery,
  setBusinessQuery,
  businessData,
  filteredBusinesses,
  handleExport,
  exportLoading,
  onOpenAddBusiness,
  addBusinessLoading,
  searchTerm,
  setSearchTerm,
  selectedBusinessIds,
  handleSelectAll,
  handleDeselectAll,
  handleSelectBusiness,
  businessBulkActions,
  businessLoading,
  toggleLoading,
  handleToggleBusinessStatus,
  handleEditBusiness,
  handleDeleteBusiness,
  handlePageChange,
  handleLimitChange,
}: BusinessesViewProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {dataFetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Data Fetching Error</span>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  fetchData();
                  fetchBusinesses();
                }}
                className="rounded-xl"
              >
                Retry
              </Button>
            </div>
          </div>
          <p className="text-red-600 text-sm mt-1">{dataFetchError}</p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manage Businesses</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add, view, edit, and manage all registered businesses
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Select
            value={businessQuery.status}
            onValueChange={(value) => {
              setBusinessQuery((prev) => ({
                ...prev,
                status: value,
                page: 1,
              }));
            }}
          >
            <SelectTrigger className=" rounded-xl bg-white border-gray-200">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <span className="hidden sm:inline">Filter</span>
              <span className="sm:hidden">Status</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({businessData?.pagination.totalItems || filteredBusinesses.length})</SelectItem>
              <SelectItem value="active">Active ({filteredBusinesses.filter((b) => b.isActive).length})</SelectItem>
              <SelectItem value="inactive">Inactive ({filteredBusinesses.filter((b) => !b.isActive).length})</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportLoading}
            className="rounded-xl border-gray-200"
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2" />
            ) : (
              <Download className="h-4 w-4 text-gray-500 mr-2" />
            )}
            <span className="hidden sm:inline">{exportLoading ? "Exporting..." : "Export"}</span>
            <span className="sm:hidden">{exportLoading ? "..." : ""}</span>
          </Button>

          <Button
            onClick={onOpenAddBusiness}
            disabled={addBusinessLoading}
            className="rounded-xl bg-linear-90 from-[#5757FF] to-[#A89CFE] text-white hover:opacity-90 transition-opacity"
          >
            {addBusinessLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">{addBusinessLoading ? "Opening..." : "Add Business"}</span>
            <span className="sm:hidden">{addBusinessLoading ? "..." : "Add"}</span>
          </Button>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search businesses..."
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

      {selectedBusinessIds.size > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <BulkActionsToolbar
            selectedCount={selectedBusinessIds.size}
            totalCount={businessData?.pagination.totalItems || filteredBusinesses.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onBulkActivate={businessBulkActions.handleBulkActivate}
            onBulkDeactivate={businessBulkActions.handleBulkDeactivate}
            onBulkDelete={businessBulkActions.handleBulkDelete}
          />
        </div>
      )}

      <div className="bg-white rounded-md   overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#080322]">
              <TableRow>
                <TableHead className="w-12 text-white font-medium">
                  <Checkbox
                    checked={businessData?.businesses.every((b) => selectedBusinessIds.has(b.id)) || false}
                    onCheckedChange={(checked) => {
                      if (checked) handleSelectAll();
                      else handleDeselectAll();
                    }}
                    className="border-gray-400"
                  />
                </TableHead>
                <TableHead className="w-14 text-white font-medium">SN.</TableHead>
                <TableHead className="text-white font-medium">Business</TableHead>
                <TableHead className="text-white font-medium">Admin Email</TableHead>
                <TableHead className="text-white font-medium">Category</TableHead>
                <TableHead className="text-center text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Date</TableHead>
                <TableHead className="text-center text-white font-medium ">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessLoading
                ? Array.from({ length: businessQuery.limit }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : businessData?.businesses.map((business, index) => (
                    <TableRow key={business.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedBusinessIds.has(business.id)}
                          onCheckedChange={() => handleSelectBusiness(business.id)}
                          className="border-gray-400"
                        />
                      </TableCell>
                      <TableCell className="text-gray-500 font-medium">
                        {(businessData.pagination.page - 1) * businessData.pagination.limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {business.logo ? (
                            <img
                              src={business.logo}
                              alt={`${business.name} logo`}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <Building className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <span className="text-gray-900 font-medium truncate max-w-[200px]">{business.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 truncate">{business.admin.email}</TableCell>
                      <TableCell className="text-gray-600">
                        <Badge
                          variant="outline"
                          className="rounded-lg bg-gray-50 border-gray-200 truncate max-w-[120px]"
                        >
                          {business.category?.name || "None"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                            business.isActive
                              ? "bg-lime-500/10 border-lime-500/30 text-lime-700"
                              : "bg-red-500/10 border-red-500/30 text-red-600"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              business.isActive ? "bg-lime-500" : "bg-red-500"
                            }`}
                          ></span>
                          {business.isActive ? "Active" : "Inactive"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(business.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 rounded-lg ${
                              business.isActive ? "hover:bg-orange-50" : "hover:bg-green-50"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleBusinessStatus(e, business);
                            }}
                            disabled={toggleLoading === business.id}
                            title={business.isActive ? "Suspend Business" : "Activate Business"}
                          >
                            {toggleLoading === business.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                            ) : (
                              <Power
                                className={`h-4 w-4 ${
                                  business.isActive ? "text-orange-500" : "text-green-500"
                                }`}
                              />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                            onClick={() => window.open(`/catalog/${business.slug}`, "_blank")}
                            title="View Business"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                            onClick={() => handleEditBusiness(business)}
                            title="Edit Business"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                            onClick={() => handleDeleteBusiness(business)}
                            title="Delete Business"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {!businessLoading && (!businessData?.businesses || businessData.businesses.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || businessQuery.status !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first business"}
            </p>
            {!searchTerm && businessQuery.status === "all" && (
              <Button
                onClick={onOpenAddBusiness}
                className="bg-linear-90 from-[#5757FF] to-[#A89CFE] text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
            )}
          </div>
        )}

        {businessData && businessData.businesses.length > 0 && (
          <div className="p-2 border-t">
            <Pagination
              currentPage={businessData.pagination.page}
              totalPages={businessData.pagination.totalPages}
              totalItems={businessData.pagination.totalItems}
              itemsPerPage={businessData.pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
