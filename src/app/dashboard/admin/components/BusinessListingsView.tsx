import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsToolbar } from "@/components/ui/pagination";
import StatusBadge from "@/components/ui/StatusBadge";
import { Activity, Building, Edit, Eye, RefreshCw, Search, SlidersHorizontal, User } from "lucide-react";

interface BusinessListingsViewProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  businessListingInquiries: any[];
  selectedBusinessListings: Set<string>;
  setSelectedBusinessListings: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchData: () => Promise<void>;
  setSelectedBusinessListingInquiry: React.Dispatch<React.SetStateAction<any>>;
  setShowBusinessListingInquiryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  businessListingBulkToast: (description: string) => void;
}

export default function BusinessListingsView({
  searchTerm,
  setSearchTerm,
  businessListingInquiries,
  selectedBusinessListings,
  setSelectedBusinessListings,
  fetchData,
  setSelectedBusinessListingInquiry,
  setShowBusinessListingInquiryDialog,
  businessListingBulkToast,
}: BusinessListingsViewProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Business Listing Inquiries</h1>
        <p className="text-sm text-gray-600 mt-1">Manage business listing requests and digital presence enhancement inquiries</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchData()} className="rounded-xl border-gray-200">
            <RefreshCw className="h-4 w-4 text-gray-500 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search business listings..."
            className="pl-10 pr-12 w-full rounded-xl rounded-r-none border-gray-200 bg-white focus-visible:ring-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="button" variant="ghost" className="rounded-none rounded-r-xl border-l-0 border-gray-200 bg-transparent hover:bg-gray-100 h-[42px] px-3">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {selectedBusinessListings.size > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <BulkActionsToolbar
            selectedCount={selectedBusinessListings.size}
            totalCount={businessListingInquiries.length}
            onSelectAll={() => setSelectedBusinessListings(new Set(businessListingInquiries.map((i) => i.id)))}
            onDeselectAll={() => setSelectedBusinessListings(new Set())}
            onBulkActivate={() => businessListingBulkToast("Bulk activate not implemented for listings")}
            onBulkDeactivate={() => businessListingBulkToast("Bulk deactivate not implemented for listings")}
            onBulkDelete={() => businessListingBulkToast("Bulk delete not implemented for listings")}
          />
        </div>
      )}

      {businessListingInquiries.length > 0 ? (
        <div className="bg-white rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#080322]">
                <TableRow>
                  <TableHead className="w-12 text-white font-medium">
                    <Checkbox
                      checked={businessListingInquiries.length > 0 && selectedBusinessListings.size === businessListingInquiries.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBusinessListings(new Set(businessListingInquiries.map((i) => i.id)));
                        } else {
                          setSelectedBusinessListings(new Set());
                        }
                      }}
                      className="border-gray-400"
                    />
                  </TableHead>
                  <TableHead className="w-14 text-white font-medium">SN.</TableHead>
                  <TableHead className="text-white font-medium">Business</TableHead>
                  <TableHead className="text-white font-medium">Contact</TableHead>
                  <TableHead className="text-white font-medium">Requirements</TableHead>
                  <TableHead className="text-white font-medium">Inquiry Type</TableHead>
                  <TableHead className="text-center text-white font-medium">Status</TableHead>
                  <TableHead className="text-white font-medium">Assigned To</TableHead>
                  <TableHead className="text-white font-medium">Date</TableHead>
                  <TableHead className="text-center text-white font-medium ">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessListingInquiries
                  .filter((inquiry) => {
                    const matchesSearch =
                      inquiry.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inquiry.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inquiry.requirements?.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesSearch;
                  })
                  .map((inquiry, index) => (
                    <TableRow key={inquiry.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedBusinessListings.has(inquiry.id)}
                          onCheckedChange={() => {
                            setSelectedBusinessListings((prev) => {
                              const newSet = new Set(prev);
                              if (newSet.has(inquiry.id)) newSet.delete(inquiry.id);
                              else newSet.add(inquiry.id);
                              return newSet;
                            });
                          }}
                          className="border-gray-400"
                        />
                      </TableCell>
                      <TableCell className="text-gray-500 font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{inquiry.businessName}</div>
                          {inquiry.businessDescription && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">{inquiry.businessDescription}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{inquiry.contactName}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                          {inquiry.phone && <div className="text-sm text-gray-500">{inquiry.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">{inquiry.requirements}</TableCell>
                      <TableCell className="text-gray-600">{inquiry.inquiryType || "Not specified"}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <StatusBadge
                            status={inquiry.status}
                            variant={
                              inquiry.status === "PENDING"
                                ? "warning"
                                : inquiry.status === "REVIEWING" || inquiry.status === "UNDER_REVIEW"
                                  ? "info"
                                  : inquiry.status === "APPROVED"
                                    ? "success"
                                    : inquiry.status === "REJECTED"
                                      ? "error"
                                      : "neutral"
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{inquiry.assignedUser?.name || "Unassigned"}</TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
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
                            className="h-8 w-8 p-0 rounded-md hover:bg-gray-100"
                            onClick={() => {
                              setSelectedBusinessListingInquiry(inquiry);
                              setShowBusinessListingInquiryDialog(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-md hover:bg-gray-100"
                            onClick={() => {
                              setSelectedBusinessListingInquiry(inquiry);
                              setShowBusinessListingInquiryDialog(true);
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Listings Found</h3>
          <p className="text-gray-500">There are currently no business listing inquiries to review.</p>
        </div>
      )}
    </div>
  );
}
