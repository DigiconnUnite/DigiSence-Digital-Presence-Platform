"use client";

import React from "react";
import ProfileInfoCard from "./ProfileInfoCard";

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

interface BasicProfileTabProps {
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

const BasicProfileTab: React.FC<BasicProfileTabProps> = (props) => {
  return (
    <div className="space-y-6">
      <ProfileInfoCard {...props} />
    </div>
  );
};

export default BasicProfileTab;