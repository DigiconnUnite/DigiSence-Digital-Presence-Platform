import { useCallback } from "react";

interface UseBusinessListingActionsOptions {
  setBusinessListingInquiries: React.Dispatch<React.SetStateAction<any[]>>;
  setShowBusinessListingInquiryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBusinessListingInquiry: React.Dispatch<React.SetStateAction<any>>;
  toast: (args: { title: string; description: string; variant?: "destructive" }) => void;
}

export function useBusinessListingActions({
  setBusinessListingInquiries,
  setShowBusinessListingInquiryDialog,
  setSelectedBusinessListingInquiry,
  toast,
}: UseBusinessListingActionsOptions) {
  const handleUpdateBusinessListingInquiry = useCallback(
    async (inquiryId: string, updates: any) => {
      try {
        const response = await fetch(`/api/business-listing-inquiries/${inquiryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const data = await response.json();
          setBusinessListingInquiries((prev) =>
            prev.map((inquiry) => (inquiry.id === inquiryId ? data.inquiry : inquiry))
          );
          toast({ title: "Success", description: "Inquiry updated successfully!" });
          setShowBusinessListingInquiryDialog(false);
          setSelectedBusinessListingInquiry(null);
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to update inquiry: ${error.error || "Unknown error"}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update inquiry. Please try again.",
          variant: "destructive",
        });
      }
    },
    [setBusinessListingInquiries, setSelectedBusinessListingInquiry, setShowBusinessListingInquiryDialog, toast]
  );

  return { handleUpdateBusinessListingInquiry };
}
