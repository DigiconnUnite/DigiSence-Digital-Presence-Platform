"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, GlobeIcon, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

interface CreateProfileViewProps {
  isCreatingProfile: boolean;
  setIsCreatingProfile: (value: boolean) => void;
  handleCreateProfessional: (e: React.FormEvent<HTMLFormElement>) => void;
  professionalSocialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  setProfessionalSocialMedia: React.Dispatch<React.SetStateAction<{
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  }>>;
  profilePictureUrl: string;
  setProfilePictureUrl: (url: string) => void;
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
  isLoading: boolean;
  themeSettings: any;
}

const CreateProfileView: React.FC<CreateProfileViewProps> = ({
  isCreatingProfile,
  setIsCreatingProfile,
  handleCreateProfessional,
  professionalSocialMedia,
  setProfessionalSocialMedia,
  profilePictureUrl,
  setProfilePictureUrl,
  bannerUrl,
  setBannerUrl,
  isLoading,
  themeSettings,
}) => {
  return (
    <div className="space-y-6">
      {/* Create Profile Prompt */}
      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Professional Profile Found
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't created your professional profile yet. Create one to
              showcase your services and attract clients.
            </p>
            <Button
              onClick={() => setIsCreatingProfile(true)}
              className={themeSettings.buttonStyle}
            >
              Create Professional Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {isCreatingProfile && (
        <form onSubmit={handleCreateProfessional} className="space-y-6">
          {/* Basic Information */}
          <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Professional Name *</Label>
                  <Input
                    name="name"
                    required
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Professional Headline</Label>
                  <Input
                    name="professionalHeadline"
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="space-y-2">
                  <Label>About Me</Label>
                  <Textarea
                    name="aboutMe"
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <ImageUpload
                      onUpload={setProfilePictureUrl}
                      className="max-w-md"
                      uploadUrl="/api/professionals/upload"
                      uploadType="profile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <ImageUpload
                      onUpload={setBannerUrl}
                      className="max-w-md"
                      uploadUrl="/api/professionals/upload"
                      uploadType="banner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      name="location"
                      className={themeSettings.borderRadius}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      className={themeSettings.borderRadius}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      name="website"
                      className={themeSettings.borderRadius}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      className={themeSettings.borderRadius}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeIcon className="h-5 w-5 mr-2" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-amber-600" />
                    Facebook
                  </Label>
                  <Input
                    value={professionalSocialMedia.facebook}
                    onChange={(e) =>
                      setProfessionalSocialMedia((prev) => ({
                        ...prev,
                        facebook: e.target.value,
                      }))
                    }
                    placeholder="https://facebook.com/username"
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Twitter className="h-4 w-4 mr-2 text-amber-400" />
                    Twitter
                  </Label>
                  <Input
                    value={professionalSocialMedia.twitter}
                    onChange={(e) =>
                      setProfessionalSocialMedia((prev) => ({
                        ...prev,
                        twitter: e.target.value,
                      }))
                    }
                    placeholder="https://twitter.com/username"
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    value={professionalSocialMedia.instagram}
                    onChange={(e) =>
                      setProfessionalSocialMedia((prev) => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                    placeholder="https://instagram.com/username"
                    className={themeSettings.borderRadius}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-2 text-amber-700" />
                    LinkedIn
                  </Label>
                  <Input
                    value={professionalSocialMedia.linkedin}
                    onChange={(e) =>
                      setProfessionalSocialMedia((prev) => ({
                        ...prev,
                        linkedin: e.target.value,
                      }))
                    }
                    placeholder="https://linkedin.com/in/username"
                    className={themeSettings.borderRadius}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex-1 ${themeSettings.buttonStyle}`}
            >
              {isLoading ? "Creating..." : "Create Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreatingProfile(false)}
              className={`flex-1 ${themeSettings.borderRadius}`}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateProfileView;