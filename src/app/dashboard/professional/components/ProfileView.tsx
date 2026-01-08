"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProfileInfoCard from "./ProfileInfoCard";
import BasicProfileTab from "./BasicProfileTab";
import SkillsTab from "./SkillsTab";
import ExperienceTab from "./ExperienceTab";
import EducationTab from "./EducationTab";
import ServicesTab from "./ServicesTab";
import PortfolioTab from "./PortfolioTab";
import ContactTab from "./ContactTab";

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

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  gap: string;
  fontFamily: string;
  fontSize: string;
  cardStyle: string;
  buttonStyle: string;
  backgroundTheme: string;
  cardClass: string;
}

interface ProfileViewProps {
  professional: Professional;
  themeSettings: ThemeSettings;
  isMobile: boolean;
  activeProfileTab: string;
  setActiveProfileTab: React.Dispatch<React.SetStateAction<string>>;
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
  setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingHeadline: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingAboutMe: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingEmail: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingPhone: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingFacebook: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingTwitter: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingInstagram: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingLinkedin: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingName: React.Dispatch<React.SetStateAction<string>>;
  setEditingHeadline: React.Dispatch<React.SetStateAction<string>>;
  setEditingAboutMe: React.Dispatch<React.SetStateAction<string>>;
  setEditingEmail: React.Dispatch<React.SetStateAction<string>>;
  setEditingPhone: React.Dispatch<React.SetStateAction<string>>;
  setEditingLocation: React.Dispatch<React.SetStateAction<string>>;
  setEditingFacebook: React.Dispatch<React.SetStateAction<string>>;
  setEditingTwitter: React.Dispatch<React.SetStateAction<string>>;
  setEditingInstagram: React.Dispatch<React.SetStateAction<string>>;
  setEditingLinkedin: React.Dispatch<React.SetStateAction<string>>;
  handleFieldUpdate: (field: string, value: string) => void;
  setShowBannerModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowProfilePictureModal: React.Dispatch<React.SetStateAction<boolean>>;
  // Add other props as needed for tabs
}

export default function ProfileView({
  professional,
  themeSettings,
  isMobile,
  activeProfileTab,
  setActiveProfileTab,
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
}: ProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
            Professional Profile
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage your professional information and portfolio
          </p>
        </div>
        <div className="flex gap-3">
          <Button className={themeSettings.buttonStyle}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tab-based Navigation */}
      <Tabs
        value={activeProfileTab}
        onValueChange={setActiveProfileTab}
        className="w-full"
      >
        <div className="flex items-center">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'}`}>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            {!isMobile && <TabsTrigger value="education">Education</TabsTrigger>}
            {!isMobile && <TabsTrigger value="services">Services</TabsTrigger>}
            {!isMobile && <TabsTrigger value="portfolio">Portfolio</TabsTrigger>}
          </TabsList>
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">More</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveProfileTab("education")}>Education</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveProfileTab("services")}>Services</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveProfileTab("portfolio")}>Portfolio</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Basic Profile Information Tab */}
        <TabsContent value="basic" className="mt-4">
          <div className="space-y-6">
            <ProfileInfoCard
              professional={professional}
              themeSettings={themeSettings}
              isEditingName={isEditingName}
              isEditingHeadline={isEditingHeadline}
              isEditingAboutMe={isEditingAboutMe}
              isEditingEmail={isEditingEmail}
              isEditingPhone={isEditingPhone}
              isEditingLocation={isEditingLocation}
              isEditingFacebook={isEditingFacebook}
              isEditingTwitter={isEditingTwitter}
              isEditingInstagram={isEditingInstagram}
              isEditingLinkedin={isEditingLinkedin}
              editingName={editingName}
              editingHeadline={editingHeadline}
              editingAboutMe={editingAboutMe}
              editingEmail={editingEmail}
              editingPhone={editingPhone}
              editingLocation={editingLocation}
              editingFacebook={editingFacebook}
              editingTwitter={editingTwitter}
              editingInstagram={editingInstagram}
              editingLinkedin={editingLinkedin}
              nameInputRef={nameInputRef}
              headlineInputRef={headlineInputRef}
              aboutMeInputRef={aboutMeInputRef}
              emailInputRef={emailInputRef}
              phoneInputRef={phoneInputRef}
              locationInputRef={locationInputRef}
              facebookInputRef={facebookInputRef}
              twitterInputRef={twitterInputRef}
              instagramInputRef={instagramInputRef}
              linkedinInputRef={linkedinInputRef}
              setIsEditingName={setIsEditingName}
              setIsEditingHeadline={setIsEditingHeadline}
              setIsEditingAboutMe={setIsEditingAboutMe}
              setIsEditingEmail={setIsEditingEmail}
              setIsEditingPhone={setIsEditingPhone}
              setIsEditingLocation={setIsEditingLocation}
              setIsEditingFacebook={setIsEditingFacebook}
              setIsEditingTwitter={setIsEditingTwitter}
              setIsEditingInstagram={setIsEditingInstagram}
              setIsEditingLinkedin={setIsEditingLinkedin}
              setEditingName={setEditingName}
              setEditingHeadline={setEditingHeadline}
              setEditingAboutMe={setEditingAboutMe}
              setEditingEmail={setEditingEmail}
              setEditingPhone={setEditingPhone}
              setEditingLocation={setEditingLocation}
              setEditingFacebook={setEditingFacebook}
              setEditingTwitter={setEditingTwitter}
              setEditingInstagram={setEditingInstagram}
              setEditingLinkedin={setEditingLinkedin}
              handleFieldUpdate={handleFieldUpdate}
              setShowBannerModal={setShowBannerModal}
              setShowProfilePictureModal={setShowProfilePictureModal}
            />
          </div>
        </TabsContent>

        {/* Skills & Expertise Tab */}
        <TabsContent value="skills" className="mt-4">
          <SkillsTab />
        </TabsContent>

        {/* Work Experience Tab */}
        <TabsContent value="experience" className="mt-4">
          <ExperienceTab />
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-4">
          <EducationTab />
        </TabsContent>

        {/* Services Offered Tab */}
        <TabsContent value="services" className="mt-4">
          <ServicesTab />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTab />
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="mt-6">
          <ContactTab professional={professional} />
        </TabsContent>
      </Tabs>
    </div>
  );
}