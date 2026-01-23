"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Facebook, Twitter, Instagram, Linkedin, GlobeIcon } from "lucide-react";

interface Professional {
  id: string;
  name: string;
  slug: string;
  professionName: string | null;
  professionalHeadline: string | null;
  aboutMe: string | null;
  profilePicture: string | null;
  banner: string | null;
  resume: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

interface EditProfileFormProps {
  professional: Professional;
  handleUpdateProfessional: (e: React.FormEvent<HTMLFormElement>) => void;
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
  setProfilePictureUrl: React.Dispatch<React.SetStateAction<string>>;
  bannerUrl: string;
  setBannerUrl: React.Dispatch<React.SetStateAction<string>>;
  professionalServices: any[];
  setProfessionalServices: React.Dispatch<React.SetStateAction<any[]>>;
  professionalPortfolio: any[];
  setProfessionalPortfolio: React.Dispatch<React.SetStateAction<any[]>>;
  isLoading: boolean;
}

export default function EditProfileForm({
  professional,
  handleUpdateProfessional,
  professionalSocialMedia,
  setProfessionalSocialMedia,
  profilePictureUrl,
  setProfilePictureUrl,
  bannerUrl,
  setBannerUrl,
  professionalServices,
  setProfessionalServices,
  professionalPortfolio,
  setProfessionalPortfolio,
  isLoading,
}: EditProfileFormProps) {
  return (
    <form onSubmit={handleUpdateProfessional} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GlobeIcon className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Professional Name</Label>
              <Input
                name="name"
                defaultValue={professional.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Professional Headline</Label>
              <Input
                name="professionalHeadline"
                defaultValue={professional.professionalHeadline || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>About Me</Label>
              <Textarea
                name="aboutMe"
                defaultValue={professional.aboutMe || ""}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                {/* ImageUpload component would go here */}
                {profilePictureUrl && (
                  <p className="text-sm text-gray-600">
                    Current: {profilePictureUrl}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                {/* ImageUpload component would go here */}
                {bannerUrl && (
                  <p className="text-sm text-gray-600">Current: {bannerUrl}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  defaultValue={professional.location || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  name="phone"
                  defaultValue={professional.phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  defaultValue={professional.website || ""}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  defaultValue={professional.email || ""}
                  type="email"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
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
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Offered */}
      <Card>
        <CardContent className="p-6">
          {/* ArrayFieldManager for services would go here */}
          <div>Services section - to be implemented</div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardContent className="p-6">
          {/* ArrayFieldManager for portfolio would go here */}
          <div>Portfolio section - to be implemented</div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}