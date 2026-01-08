"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedImageUrl, handleImageError, isValidImageUrl } from '@/lib/image-utils';

interface Professional {
  id: string;
  banner?: string;
}

interface ThemeSettings {
  borderRadius: string;
}

interface BannerUploadModalProps {
  showBannerModal: boolean;
  setShowBannerModal: (show: boolean) => void;
  professional: Professional | null;
  setBannerUrl: (url: string) => void;
  themeSettings: ThemeSettings;
}

export default function BannerUploadModal({
  showBannerModal,
  setShowBannerModal,
  professional,
  setBannerUrl,
  themeSettings,
}: BannerUploadModalProps) {
  const { toast } = useToast();

  return (
    <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Banner Image</DialogTitle>
          <DialogDescription>
            Upload and crop your banner image. Recommended dimensions:
            1200x300px
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ImageUpload
            accept="image/*"
            aspectRatio={4 / 1}
            uploadUrl="/api/professionals/upload"
            uploadType="banner"
            onUpload={(url) => {
              setBannerUrl(url);
              setShowBannerModal(false);
              toast({
                title: "Success",
                description: "Banner image updated successfully!",
              });
            }}
            onError={(error) =>
              toast({
                title: "Upload Error",
                description: error,
                variant: "destructive",
              })
            }
          />

          {professional?.banner && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Current Banner</h4>
              <div className="relative">
                <img
                  src={professional.banner && isValidImageUrl(professional.banner) ? getOptimizedImageUrl(professional.banner, { width: 800, height: 200, quality: 85, format: "auto", crop: "fill", gravity: "center" }) : professional.banner}
                  alt="Current banner"
                  className="w-full h-32 object-cover rounded-xl border"
                  onError={handleImageError}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBannerModal(false)}
              className={`flex-1 ${themeSettings.borderRadius}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}