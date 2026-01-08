"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Eye, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "./ReusableComponents";

interface InquiriesViewProps {
  inquiries: any[];
  stats: {
    totalInquiries: number;
    newInquiries: number;
    profileViews: number;
  };
  handleInquiryStatusUpdate: (inquiryId: string, newStatus: string) => void;
  themeSettings: any;
}

const InquiriesView: React.FC<InquiriesViewProps> = ({
  inquiries,
  stats,
  handleInquiryStatusUpdate,
  themeSettings,
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);

  return (
    <div className={`space-y-6 pb-20 md:pb-0 animate-fadeIn ${themeSettings.gap}`}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Client Inquiries
        </h1>
        <p className="text-xl text-gray-600">
          Manage inquiries from potential clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          subtitle="All time"
          icon={<MessageSquare className="h-4 w-4 text-gray-400" />}
        />
        <StatCard
          title="New Inquiries"
          value={stats.newInquiries}
          subtitle="Requires attention"
          icon={<AlertTriangle className="h-4 w-4 text-gray-400" />}
        />
        <StatCard
          title="Response Rate"
          value={`${stats.totalInquiries > 0
              ? Math.round(
                ((stats.totalInquiries - stats.newInquiries) /
                  stats.totalInquiries) *
                100
              )
              : 0
            }%`}
          subtitle="Inquiries handled"
          icon={<TrendingUp className="h-4 w-4 text-gray-400" />}
        />
      </div>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <Table>
              <TableHeader className="bg-amber-100">
                <TableRow>
                  <TableHead className="text-gray-900">Client</TableHead>
                  <TableHead className="text-gray-900">Message</TableHead>
                  <TableHead className="text-gray-900">Status</TableHead>
                  <TableHead className="text-gray-900">Date</TableHead>
                  <TableHead className="text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry: any) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="text-gray-900">
                      <div>
                        <div className="font-medium">{inquiry.name}</div>
                        <div className="text-sm text-gray-500">
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="text-sm text-gray-500">
                            {inquiry.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 max-w-xs truncate">
                      {inquiry.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={themeSettings.borderRadius}
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowInquiryDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {inquiry.status === "NEW" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={themeSettings.borderRadius}
                            onClick={() =>
                              handleInquiryStatusUpdate(
                                inquiry.id,
                                "READ"
                              )
                            }
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {inquiries.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No inquiries yet
              </h3>
              <p className="text-gray-600">
                Inquiries from potential clients will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Details Dialog */}
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
                    <Badge variant="outline" className="rounded-full">
                      {selectedInquiry.status}
                    </Badge>
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
    </div>
  );
};

export default InquiriesView;