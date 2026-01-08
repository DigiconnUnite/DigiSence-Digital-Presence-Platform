"use client";

import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Edit,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  X,
} from "lucide-react";
import { getOptimizedImageUrl, handleImageError, isValidImageUrl } from '@/lib/image-utils';
import { useToast } from "@/hooks/use-toast";

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

interface ProfileInfoCardProps {
  professional: Professional;
  themeSettings: any;
  isEditingName: boolean;
  isEditingHeadline: boolean;
  isEditingAboutMe: boolean;
  isEditingEmail: boolean;
  isEditingPhone: boolean;
  isEditingLocation: boolean;
  isEditingFacebook: boolean;
  isEditingTwitter: boolean;
  isEditingInstagram: boolean;
  isEditingLinkedin: boolean;
  editingName: string;
  editingHeadline: string;
  editingAboutMe: string;
  editingEmail: string;
  editingPhone: string;
  editingLocation: string;
  editingFacebook: string;
  editingTwitter: string;
  editingInstagram: string;
  editingLinkedin: string;
  nameInputRef: React.RefObject<HTMLInputElement>;
  headlineInputRef: React.RefObject<HTMLInputElement>;
  aboutMeInputRef: React.RefObject<HTMLTextAreaElement>;
  emailInputRef: React.RefObject<HTMLInputElement>;
  phoneInputRef: React.RefObject<HTMLInputElement>;
  locationInputRef: React.RefObject<HTMLInputElement>;
  facebookInputRef: React.RefObject<HTMLInputElement>;
  twitterInputRef: React.RefObject<HTMLInputElement>;
  instagramInputRef: React.RefObject<HTMLInputElement>;
  linkedinInputRef: React.RefObject<HTMLInputElement>;
  setIsEditingName: (value: boolean) => void;
  setIsEditingHeadline: (value: boolean) => void;
  setIsEditingAboutMe: (value: boolean) => void;
  setIsEditingEmail: (value: boolean) => void;
  setIsEditingPhone: (value: boolean) => void;
  setIsEditingLocation: (value: boolean) => void;
  setIsEditingFacebook: (value: boolean) => void;
  setIsEditingTwitter: (value: boolean) => void;
  setIsEditingInstagram: (value: boolean) => void;
  setIsEditingLinkedin: (value: boolean) => void;
  setEditingName: (value: string) => void;
  setEditingHeadline: (value: string) => void;
  setEditingAboutMe: (value: string) => void;
  setEditingEmail: (value: string) => void;
  setEditingPhone: (value: string) => void;
  setEditingLocation: (value: string) => void;
  setEditingFacebook: (value: string) => void;
  setEditingTwitter: (value: string) => void;
  setEditingInstagram: (value: string) => void;
  setEditingLinkedin: (value: string) => void;
  handleFieldUpdate: (field: string, value: string) => void;
  setShowBannerModal: (value: boolean) => void;
  setShowProfilePictureModal: (value: boolean) => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  professional,
  themeSettings,
  isEditingName,
  isEditingHeadline,
  isEditingAboutMe,
  isEditingEmail,
  isEditingPhone,
  isEditingLocation,
  isEditingFacebook,
  isEditingTwitter,
  isEditingInstagram,
  isEditingLinkedin,
  editingName,
  editingHeadline,
  editingAboutMe,
  editingEmail,
  editingPhone,
  editingLocation,
  editingFacebook,
  editingTwitter,
  editingInstagram,
  editingLinkedin,
  nameInputRef,
  headlineInputRef,
  aboutMeInputRef,
  emailInputRef,
  phoneInputRef,
  locationInputRef,
  facebookInputRef,
  twitterInputRef,
  instagramInputRef,
  linkedinInputRef,
  setIsEditingName,
  setIsEditingHeadline,
  setIsEditingAboutMe,
  setIsEditingEmail,
  setIsEditingPhone,
  setIsEditingLocation,
  setIsEditingFacebook,
  setIsEditingTwitter,
  setIsEditingInstagram,
  setIsEditingLinkedin,
  setEditingName,
  setEditingHeadline,
  setEditingAboutMe,
  setEditingEmail,
  setEditingPhone,
  setEditingLocation,
  setEditingFacebook,
  setEditingTwitter,
  setEditingInstagram,
  setEditingLinkedin,
  handleFieldUpdate,
  setShowBannerModal,
  setShowProfilePictureModal,
}) => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Banner Image
            </Label>
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowBannerModal(true)}
            >
              <div className="w-full aspect-3/1 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                {professional.banner && isValidImageUrl(professional.banner) ? (
                  <img
                    src={professional.banner}
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <Edit className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              {/* Small edit icon in top corner */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Edit className="h-3 w-3 text-gray-700" />
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Recommended dimensions: 1200x300px • Click to edit
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="shrink-0 flex flex-col items-center space-y-2 mt-6 md:mt-0">
              <div
                className="relative group cursor-pointer"
                onClick={() => setShowProfilePictureModal(true)}
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {professional.profilePicture && isValidImageUrl(professional.profilePicture) ? (
                    <img
                      src={professional.profilePicture}
                      alt={professional.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* Small edit icon in top corner */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Edit className="h-3 w-3 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Professional Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Name
                    </p>
                    {isEditingName ? (
                      <Input
                        key="name-input"
                        ref={nameInputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-md text-gray-900 font-medium ">
                        {professional.name || "Not provided"}
                      </p>
                    )}
                  </div>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleFieldUpdate("name", editingName);
                          // Update professional state immediately
                          setProfessional(prev => prev ? { ...prev, name: editingName } : null);
                          setIsEditingName(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingName(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${themeSettings.borderRadius} shrink-0`}
                      onClick={() => {
                        setEditingName(professional.name || "");
                        setIsEditingName(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Professional Headline */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Edit className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Headline
                    </p>
                    {isEditingHeadline ? (
                      <Input
                        key="headline-input"
                        ref={headlineInputRef}
                        value={editingHeadline}
                        onChange={(e) => setEditingHeadline(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-md text-amber-600 font-medium">
                        {professional.professionalHeadline ||
                          "Not provided"}
                      </p>
                    )}
                  </div>
                  {isEditingHeadline ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleFieldUpdate(
                            "professionalHeadline",
                            editingHeadline
                          );
                          // Update professional state immediately
                          setProfessional(prev => prev ? { ...prev, professionalHeadline: editingHeadline } : null);
                          setIsEditingHeadline(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingHeadline(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${themeSettings.borderRadius} shrink-0`}
                      onClick={() => {
                        setEditingHeadline(
                          professional.professionalHeadline || ""
                        );
                        setIsEditingHeadline(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    {isEditingEmail ? (
                      <Input
                        key="email-input"
                        ref={emailInputRef}
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        type="email"
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-md text-gray-900 font-medium">
                        {professional.email || "Not provided"}
                      </p>
                    )}
                  </div>
                  {isEditingEmail ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleFieldUpdate("email", editingEmail);
                          // Update professional state immediately
                          setProfessional(prev => prev ? { ...prev, email: editingEmail } : null);
                          setIsEditingEmail(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingEmail(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${themeSettings.borderRadius} shrink-0`}
                      onClick={() => {
                        setEditingEmail(professional.email || "");
                        setIsEditingEmail(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    {isEditingPhone ? (
                      <Input
                        key="phone-input"
                        ref={phoneInputRef}
                        value={editingPhone}
                        onChange={(e) => setEditingPhone(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-md text-gray-900 font-medium">
                        {professional.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  {isEditingPhone ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleFieldUpdate("phone", editingPhone);
                          // Update professional state immediately
                          setProfessional(prev => prev ? { ...prev, phone: editingPhone } : null);
                          setIsEditingPhone(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingPhone(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${themeSettings.borderRadius} shrink-0`}
                      onClick={() => {
                        setEditingPhone(professional.phone || "");
                        setIsEditingPhone(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Location
                    </p>
                    {isEditingLocation ? (
                      <Input
                        key="location-input"
                        ref={locationInputRef}
                        value={editingLocation}
                        onChange={(e) => setEditingLocation(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-md text-gray-900 font-medium">
                        {professional.location || "Not provided"}
                      </p>
                    )}
                  </div>
                  {isEditingLocation ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleFieldUpdate("location", editingLocation);
                          // Update professional state immediately
                          setProfessional(prev => prev ? { ...prev, location: editingLocation } : null);
                          setIsEditingLocation(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingLocation(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${themeSettings.borderRadius} shrink-0`}
                      onClick={() => {
                        setEditingLocation(professional.location || "");
                        setIsEditingLocation(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Me - Fifth */}
          <div className="space-y-2">
            <div className="flex px-2 w-full justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              About Me
              </Label>
              {isEditingAboutMe ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await handleFieldUpdate("aboutMe", editingAboutMe);
                      // Update professional state immediately
                      setProfessional(prev => prev ? { ...prev, aboutMe: editingAboutMe } : null);
                      setIsEditingAboutMe(false);
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingAboutMe(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className={themeSettings.borderRadius}
                  onClick={() => {
                    setEditingAboutMe(professional.aboutMe || "");
                    setIsEditingAboutMe(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>

            {isEditingAboutMe ? (
              <Textarea
                key="about-me-input"
                ref={aboutMeInputRef}
                value={editingAboutMe}
                onChange={(e) => setEditingAboutMe(e.target.value)}
                placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                className={` rounded-lg border-gray-200 min-h-[120px] leading-relaxed`}
                autoFocus
              />
            ) : (
              <Textarea
                value={professional.aboutMe || ""}
                readOnly
                placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                  className={`rounded-lg bg-gray-50 border-gray-200 min-h-[120px] leading-relaxed`}
              />
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {professional.aboutMe
                  ? `${professional.aboutMe.length} characters`
                  : "0 characters"}
              </span>

            </div>
          </div>
        </div>

        {/* Right Column - Resume Upload & Social Media Links */}
        <div className="space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Resume/CV
            </Label>
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              {/* Current Resume Display */}
              {professional?.resume ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Current Resume
                      </p>
                      <p className="text-sm line-clamp-1 text-gray-500">
                        {professional.resume.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={themeSettings.borderRadius}
                      onClick={() => {
                        if (professional.resume) {
                          const link = document.createElement('a');
                          link.href = professional.resume as string;
                          link.download = (professional.resume as string).split('/').pop() || 'resume.pdf';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${themeSettings.borderRadius} text-red-600 hover:text-red-700 hover:bg-red-50`}
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/professionals/${professional.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ resume: null }),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            setProfessional(data.professional);
                            toast({
                              title: "Success",
                              description: "Resume removed successfully!",
                            });
                          } else {
                            const error = await response.json();
                            toast({
                              title: "Error",
                              description: `Failed to remove resume: ${error.error}`,
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error("Remove resume error:", error);
                          toast({
                            title: "Error",
                            description: "Failed to remove resume. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No resume uploaded yet</p>
                </div>
              )}

              {/* Resume Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Upload Resume (PDF only, max 5MB)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf"
                    id="resume-upload-inline"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Validate file type
                      if (file.type !== 'application/pdf') {
                        toast({
                          title: "Invalid File Type",
                          description: "Please upload a PDF file only.",
                          variant: "destructive",
                        });
                        return;
                      }

                      // Validate file size (5MB max)
                      const maxSize = 5 * 1024 * 1024; // 5MB
                      if (file.size > maxSize) {
                        toast({
                          title: "File Too Large",
                          description: "Maximum file size is 5MB.",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'resume');

                        const response = await fetch('/api/professionals/upload', {
                          method: 'POST',
                          body: formData,
                        });

                        if (response.ok) {
                          const data = await response.json();

                          // Update professional with new resume URL
                          const updateResponse = await fetch(`/api/professionals/${professional.id}`, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ resume: data.url }),
                          });

                          if (updateResponse.ok) {
                            const updateData = await updateResponse.json();
                            setProfessional(updateData.professional);

                            toast({
                              title: "Success",
                              description: "Resume uploaded successfully!",
                            });
                          } else {
                            const error = await updateResponse.json();
                            toast({
                              title: "Error",
                              description: `Failed to update profile: ${error.error}`,
                              variant: "destructive",
                            });
                          }
                        } else {
                          const error = await response.json();
                          toast({
                            title: "Upload Error",
                            description: error.error || "Failed to upload resume.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error("Upload error:", error);
                        toast({
                          title: "Error",
                          description: "Failed to upload resume. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        // Reset file input
                        const input = document.getElementById('resume-upload-inline') as HTMLInputElement;
                        if (input) input.value = '';
                      }
                    }}
                  />
                  <Label
                    htmlFor="resume-upload-inline"
                    className={`flex-1 cursor-pointer ${themeSettings.borderRadius} border-2 border-dashed border-gray-300 hover:border-amber-300 hover:bg-amber-50 transition-colors flex items-center justify-center py-6`}
                  >
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF files only (max 5MB)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 space-y-1">
                    <p className="font-medium">Upload Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>File format: PDF only</li>
                      <li>Maximum file size: 5MB</li>

                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Social Media Links
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Facebook className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Facebook
                  </p>
                  {isEditingFacebook ? (
                    <Input
                      key="facebook-input"
                      ref={facebookInputRef}
                      value={editingFacebook}
                      onChange={(e) => setEditingFacebook(e.target.value)}
                      placeholder="https://facebook.com/username"
                      className="mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {professional.facebook ? (
                        <a
                          href={professional.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  )}
                </div>
                {isEditingFacebook ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleFieldUpdate("facebook", editingFacebook);
                        // Update professional state immediately
                        setProfessional(prev => prev ? { ...prev, facebook: editingFacebook } : null);
                        setIsEditingFacebook(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingFacebook(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${themeSettings.borderRadius} shrink-0`}
                    onClick={() => {
                      setEditingFacebook(professional.facebook || "");
                      setIsEditingFacebook(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Twitter
                  </p>
                  {isEditingTwitter ? (
                    <Input
                      key="twitter-input"
                      ref={twitterInputRef}
                      value={editingTwitter}
                      onChange={(e) => setEditingTwitter(e.target.value)}
                      placeholder="https://twitter.com/username"
                      className="mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {professional.twitter ? (
                        <a
                          href={professional.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  )}
                </div>
                {isEditingTwitter ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleFieldUpdate("twitter", editingTwitter);
                        // Update professional state immediately
                        setProfessional(prev => prev ? { ...prev, twitter: editingTwitter } : null);
                        setIsEditingTwitter(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingTwitter(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${themeSettings.borderRadius} shrink-0`}
                    onClick={() => {
                      setEditingTwitter(professional.twitter || "");
                      setIsEditingTwitter(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Instagram className="h-5 w-5 text-pink-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Instagram
                  </p>
                  {isEditingInstagram ? (
                    <Input
                      key="instagram-input"
                      ref={instagramInputRef}
                      value={editingInstagram}
                      onChange={(e) => setEditingInstagram(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className="mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {professional.instagram ? (
                        <a
                          href={professional.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  )}
                </div>
                {isEditingInstagram ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleFieldUpdate("instagram", editingInstagram);
                        // Update professional state immediately
                        setProfessional(prev => prev ? { ...prev, instagram: editingInstagram } : null);
                        setIsEditingInstagram(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingInstagram(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${themeSettings.borderRadius} shrink-0`}
                    onClick={() => {
                      setEditingInstagram(professional.instagram || "");
                      setIsEditingInstagram(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    LinkedIn
                  </p>
                  {isEditingLinkedin ? (
                    <Input
                      key="linkedin-input"
                      ref={linkedinInputRef}
                      value={editingLinkedin}
                      onChange={(e) => setEditingLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {professional.linkedin ? (
                        <a
                          href={professional.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  )}
                </div>
                {isEditingLinkedin ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        await handleFieldUpdate("linkedin", editingLinkedin);
                        // Update professional state immediately
                        setProfessional(prev => prev ? { ...prev, linkedin: editingLinkedin } : null);
                        setIsEditingLinkedin(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingLinkedin(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${themeSettings.borderRadius} shrink-0`}
                    onClick={() => {
                      setEditingLinkedin(professional.linkedin || "");
                      setIsEditingLinkedin(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;