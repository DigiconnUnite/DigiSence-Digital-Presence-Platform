import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/ui/StatusBadge";
import { Activity, AlertTriangle, Building, Eye, FolderTree, Search, SlidersHorizontal, User, UserCheck, XCircle } from "lucide-react";

interface RegistrationRequestsViewProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  registrationInquiries: any[];
  isLoading: boolean;
  dataFetchError: string | null;
  fetchData: () => Promise<void>;
  selectedRegistrationInquiry: any;
  setSelectedRegistrationInquiry: React.Dispatch<React.SetStateAction<any>>;
  showRegistrationInquiryDialog: boolean;
  setShowRegistrationInquiryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateAccountFromInquiryWithSidebar: (inquiry: any) => void;
  handleRejectInquiry: (inquiry: any) => void;
  confirmRejectInquiry: () => Promise<void>;
  creatingAccount: string | null;
  inquiryToReject: any;
  rejectReason: string;
  setRejectReason: React.Dispatch<React.SetStateAction<string>>;
  setInquiryToReject: React.Dispatch<React.SetStateAction<any>>;
  showRejectInquiryDialog: boolean;
  setShowRejectInquiryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  toast: (args: { title: string; description: string; variant?: "destructive" }) => void;
}

export default function RegistrationRequestsView({
  searchTerm,
  setSearchTerm,
  registrationInquiries,
  isLoading,
  dataFetchError,
  fetchData,
  selectedRegistrationInquiry,
  setSelectedRegistrationInquiry,
  showRegistrationInquiryDialog,
  setShowRegistrationInquiryDialog,
  handleCreateAccountFromInquiryWithSidebar,
  handleRejectInquiry,
  confirmRejectInquiry,
  creatingAccount,
  inquiryToReject,
  rejectReason,
  setRejectReason,
  setInquiryToReject,
  showRejectInquiryDialog,
  setShowRejectInquiryDialog,
}: RegistrationRequestsViewProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Registration Requests</h1>
        <p className="text-sm text-gray-600 mt-1">Review and approve business and professional registration requests</p>
      </div>

      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder="Search registration requests..."
            className="pl-10 pr-12 w-full rounded-xl rounded-r-none border-gray-200 bg-white focus-visible:ring-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="button" variant="ghost" className="rounded-none rounded-r-xl border-l-0 border-gray-200 bg-transparent hover:bg-gray-100 h-[42px] px-3">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {dataFetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Data Fetching Error</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => fetchData()} className="rounded-xl">Retry</Button>
            </div>
          </div>
          <p className="text-red-600 text-sm mt-1">{dataFetchError}</p>
        </div>
      )}

      {registrationInquiries.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Registration Requests</h3>
          <p className="text-gray-500">There are currently no business or professional registration requests to review.</p>
        </div>
      )}

      {registrationInquiries.length > 0 && (
        <div className="bg-white rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#080322]">
                <TableRow>
                  <TableHead className="w-14 text-white font-medium">SN.</TableHead>
                  <TableHead className="text-white font-medium">Type</TableHead>
                  <TableHead className="text-white font-medium">Name</TableHead>
                  <TableHead className="text-white font-medium">Business Name</TableHead>
                  <TableHead className="text-white font-medium">Contact</TableHead>
                  <TableHead className="text-white    font-medium">Location</TableHead>
                  <TableHead className="text-center text-white font-medium">Status</TableHead>
                  <TableHead className="text-white font-medium">Date</TableHead>
                  <TableHead className="text-center text-white font-medium ">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrationInquiries.filter((inquiry) => {
                  const matchesSearch =
                    inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    inquiry.location?.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesSearch;
                }).map((inquiry, index) => (
                  <TableRow key={inquiry.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-500 font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant={inquiry.type === "BUSINESS" ? "default" : "secondary"} className="rounded-full">
                        {inquiry.type === "BUSINESS" ? "B" : "P"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">{inquiry.name}</TableCell>
                    <TableCell className="text-gray-600">{inquiry.businessName || "N/A"}</TableCell>
                    <TableCell className="text-gray-600">
                      <div>
                        <div className="text-sm">{inquiry.email}</div>
                        {inquiry.phone && <div className="text-sm text-gray-500">{inquiry.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 w-auto max-w-[150px] truncate ">{inquiry.location || "Not specified"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <StatusBadge
                          status={inquiry.status}
                          variant={inquiry.status === "PENDING" ? "warning" : inquiry.status === "COMPLETED" ? "success" : "error"}
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
                        {inquiry.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-md hover:bg-green-50"
                              onClick={() => handleCreateAccountFromInquiryWithSidebar(inquiry)}
                              disabled={creatingAccount === inquiry.id}
                              title="Create Account"
                            >
                              {creatingAccount === inquiry.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-md hover:bg-red-50"
                              onClick={() => handleRejectInquiry(inquiry)}
                              disabled={creatingAccount === inquiry.id}
                              title="Reject"
                            >
                              {creatingAccount === inquiry.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-md hover:bg-gray-100"
                          onClick={() => {
                            setSelectedRegistrationInquiry(inquiry);
                            setShowRegistrationInquiryDialog(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={showRejectInquiryDialog} onOpenChange={setShowRejectInquiryDialog}>
        <DialogContent className="rounded-2xl max-w-sm p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Reject Registration Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reject request from "{inquiryToReject?.name}"? A notification will be sent.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900 ml-1">{inquiryToReject?.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 ml-1 truncate">{inquiryToReject?.email}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rejectReason" className="text-xs font-medium text-gray-900">Reason (optional)</Label>
            <Textarea id="rejectReason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason..." className="rounded-xl resize-none text-xs h-16" />
          </div>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setShowRejectInquiryDialog(false);
              setInquiryToReject(null);
              setRejectReason("");
            }} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { void confirmRejectInquiry(); }} disabled={creatingAccount === inquiryToReject?.id} className="rounded-xl">
              {creatingAccount === inquiryToReject?.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><XCircle className="h-3 w-3 mr-1" />Reject</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegistrationInquiryDialog} onOpenChange={setShowRegistrationInquiryDialog}>
        <DialogContent className="rounded-2xl max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Registration Request Details
            </DialogTitle>
            <DialogDescription className="text-xs">Full details of the registration request</DialogDescription>
          </DialogHeader>
          {selectedRegistrationInquiry && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Type</span>
                    <p className="font-medium text-gray-900">
                      {selectedRegistrationInquiry.type === 'BUSINESS' ? 'Business' : 'Professional'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Status</span>
                    <p className="font-medium text-gray-900">
                      <StatusBadge
                        status={selectedRegistrationInquiry.status}
                        variant={selectedRegistrationInquiry.status === 'PENDING' ? 'warning' : selectedRegistrationInquiry.status === 'COMPLETED' ? 'success' : selectedRegistrationInquiry.status === 'REJECTED' ? 'error' : 'info'}
                      />
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Name</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Email</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Phone</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Location</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.location || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setShowRegistrationInquiryDialog(false);
              setSelectedRegistrationInquiry(null);
            }} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
