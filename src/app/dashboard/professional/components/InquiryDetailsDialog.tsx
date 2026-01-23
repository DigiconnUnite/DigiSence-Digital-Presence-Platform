"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  createdAt: string;
}

interface InquiryDetailsDialogProps {
  showInquiryDialog: boolean;
  setShowInquiryDialog: (show: boolean) => void;
  selectedInquiry: Inquiry | null;
  setSelectedInquiry: (inquiry: Inquiry | null) => void;
  handleInquiryStatusUpdate: (inquiryId: string, newStatus: string) => void;
}

export default function InquiryDetailsDialog({
  showInquiryDialog,
  setShowInquiryDialog,
  selectedInquiry,
  setSelectedInquiry,
  handleInquiryStatusUpdate,
}: InquiryDetailsDialogProps) {
  return (
    <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
          <DialogDescription>
            Review and respond to this client inquiry
          </DialogDescription>
        </DialogHeader>

        {selectedInquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Client Name</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedInquiry.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedInquiry.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedInquiry.phone || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedInquiry.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Message</Label>
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                {selectedInquiry.message}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Date Received</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedInquiry.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInquiryDialog(false);
                  setSelectedInquiry(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
              {selectedInquiry.status === "NEW" && (
                <Button
                  onClick={() => {
                    handleInquiryStatusUpdate(selectedInquiry.id, "READ");
                    setShowInquiryDialog(false);
                    setSelectedInquiry(null);
                  }}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}