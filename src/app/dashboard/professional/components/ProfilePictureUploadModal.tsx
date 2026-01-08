"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedImageUrl, handleImageError, isValidImageUrl } from '@/lib/image-utils';

interface Professional {
  id: string;
  profilePicture?: string;
}

interface ThemeSettings {
  borderRadius: string;
}

interface ProfilePictureUploadModalProps {
  showProfilePictureModal: boolean;
  setShowProfilePictureModal: (show: boolean) => void;
  professional: Professional | null;
  setProfilePictureUrl: (url: string) => void;
  themeSettings: ThemeSettings;
}

export default function ProfilePictureUploadModal({
  showProfilePictureModal,
  setShowProfilePictureModal,
  professional,
  setProfilePictureUrl,
  themeSettings,
}: ProfilePictureUploadModalProps) {
  const { toast } = useToast();

  return (
    <Dialog open={showProfilePictureModal} onOpenChange={setShowProfilePictureModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>
            Upload and crop your profile picture. Recommended dimensions:
            400x400px (square)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <ImageUpload
            accept="image/*"
            aspectRatio={1}
            uploadUrl="/api/professionals/upload"
            uploadType="profile"
            onUpload={(url) => {
              setProfilePictureUrl(url);
              setShowProfilePictureModal(false);
              toast({
                title: "Success",
                description: "Profile picture updated successfully!",
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

          {professional?.profilePicture && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Current Profile Picture
              </h4>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={professional.profilePicture && isValidImageUrl(professional.profilePicture) ? getOptimizedImageUrl(professional.profilePicture, { width: 128, height: 128, quality: 85, format: "auto", crop: "fill", gravity: "center" }) : professional.profilePicture}
                    alt="Current profile picture"
                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                    onError={handleImageError}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowProfilePictureModal(false)}
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