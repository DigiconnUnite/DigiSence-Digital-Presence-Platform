import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Save,
  Loader2,
  User,
  FileText,
  Clock,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  X,
  Plus,
  Hash,
  Check,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactImageCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useToast } from "@/hooks/use-toast";

interface BusinessInfoCardProps {
  businessName: string;
  adminName: string;
  description: string;
  logoUrl?: string;
  onEdit?: () => void;
  onLogoUpload?: (url: string) => void;
  gstNumber?: string;
  openingHours?: { day: string; open: string; close: string }[];
  address?: string;
  mobile?: string;
  email?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({
  businessName,
  adminName,
  description,
  logoUrl,
  onEdit,
  onLogoUpload,
  gstNumber,
  openingHours,
  address,
  mobile,
  email,
  socialLinks,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingLegal, setIsEditingLegal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);

  const [editData, setEditData] = useState({
    businessName,
    adminName,
    description,
    logo: logoUrl || "",
    gstNumber: gstNumber || "",
    openingHours: openingHours || [{ day: "", open: "", close: "" }],
    address: address || "",
    mobile: mobile || "",
    email: email || "",
    facebook: socialLinks?.facebook || "",
    twitter: socialLinks?.twitter || "",
    instagram: socialLinks?.instagram || "",
    linkedin: socialLinks?.linkedin || "",
  });

  // Update editData when logoUrl prop changes (for logo uploads)
  React.useEffect(() => {
    if (logoUrl !== editData.logo) {
      setEditData(prev => ({ ...prev, logo: logoUrl || "" }));
    }
  }, [logoUrl]);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 20,
    y: 20,
    width: 60,
    height: 60,
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleEditClick = () => {
    if (onEdit) onEdit();
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    // Determine which section is currently being edited and validate accordingly
    const currentlyEditingSections: string[] = []
    if (isEditing) currentlyEditingSections.push('profile')
    if (isEditingAbout) currentlyEditingSections.push('about')
    if (isEditingLegal) currentlyEditingSections.push('legal')
    if (isEditingContact) currentlyEditingSections.push('contact')
    if (isEditingSocial) currentlyEditingSections.push('social')

    // Validate required fields based on editing sections
    if (currentlyEditingSections.includes('profile') || currentlyEditingSections.includes('about') || currentlyEditingSections.includes('legal') || currentlyEditingSections.includes('contact')) {
      if (!editData.businessName.trim()) {
        toast({
          title: "Validation Error",
          description: "Business name is required",
          variant: "destructive"
        });
        return;
      }
    }

    // Only validate GST number if legal section is being edited
    if (currentlyEditingSections.includes('legal') && editData.gstNumber && !/^[0-9]{15}$/.test(editData.gstNumber)) {
      toast({
        title: "Validation Error",
        description: "GST number must be 15 digits",
        variant: "destructive"
      });
      return;
    }

    // Only validate email if contact section is being edited
    if (currentlyEditingSections.includes('contact') && editData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Only validate opening hours if legal section is being edited
    if (currentlyEditingSections.includes('legal')) {
      const hasInvalidHours = editData.openingHours.some(hour => {
        return hour.day && (!hour.open || !hour.close);
      });

      if (hasInvalidHours) {
        toast({
          title: "Validation Error",
          description: "Please provide both opening and closing times for all days",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      console.log("Saving business data:", {
        name: editData.businessName,
        description: editData.description,
        ownerName: editData.adminName,
        gstNumber: editData.gstNumber,
        openingHours: editData.openingHours,
        address: editData.address,
        mobile: editData.mobile,
        email: editData.email,
        facebook: editData.facebook,
        twitter: editData.twitter,
        instagram: editData.instagram,
        linkedin: editData.linkedin,
      });

      const response = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.businessName,
          description: editData.description,
          ownerName: editData.adminName,
          gstNumber: editData.gstNumber,
          openingHours: editData.openingHours,
          address: editData.address,
          mobile: editData.mobile,
          email: editData.email,
          facebook: editData.facebook,
          twitter: editData.twitter,
          instagram: editData.instagram,
          linkedin: editData.linkedin,
        }),
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (response.ok) {
        console.log("Business info updated successfully:", responseData);
        // Update local state with saved data
        setEditData(prev => ({
          ...prev,
          businessName: responseData.business.name || prev.businessName,
          description: responseData.business.description || prev.description,
          adminName: responseData.business.ownerName || prev.adminName,
          gstNumber: responseData.business.gstNumber || prev.gstNumber,
          openingHours: responseData.business.openingHours || prev.openingHours,
          address: responseData.business.address || prev.address,
          mobile: responseData.business.mobile || prev.mobile,
          email: responseData.business.email || prev.email,
          facebook: responseData.business.facebook || prev.facebook,
          twitter: responseData.business.twitter || prev.twitter,
          instagram: responseData.business.instagram || prev.instagram,
          linkedin: responseData.business.linkedin || prev.linkedin,
        }));

        setIsEditing(false);
        setIsEditingAbout(false);
        setIsEditingLegal(false);
        setIsEditingContact(false);
        setIsEditingSocial(false);
        if (onEdit) onEdit();
        toast({
          title: "Success",
          description: "Business information saved successfully!"
        });
      } else {
        console.error("Failed to update business info:", responseData);
        toast({
          title: "Error",
          description: responseData.error || 'Failed to save changes',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving business info:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          setSelectedFile(file);
          // Reset crop to center position when opening modal
          setCrop({
            unit: "%",
            x: 15,
            y: 15,
            width: 70,
            height: 70,
          });
          setCroppedAreaPixels(null);
          setCropModalOpen(true);
        }
      }
    },
    [],
  );

  const cropImage = useCallback(async (): Promise<Blob> => {
    const image = imgRef.current;
    if (!image || !croppedAreaPixels)
      throw new Error("Crop canvas does not exist");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const scaleX = naturalWidth / image.width;
    const scaleY = naturalHeight / image.height;

    const scaledCropX = croppedAreaPixels.x * scaleX;
    const scaledCropY = croppedAreaPixels.y * scaleY;
    const scaledCropWidth = croppedAreaPixels.width * scaleX;
    const scaledCropHeight = croppedAreaPixels.height * scaleY;

    canvas.width = scaledCropWidth;
    canvas.height = scaledCropHeight;

    ctx.drawImage(
      image,
      scaledCropX,
      scaledCropY,
      scaledCropWidth,
      scaledCropHeight,
      0,
      0,
      scaledCropWidth,
      scaledCropHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas blob failed");
        resolve(blob);
      }, selectedFile?.type || "image/jpeg");
    });
  }, [croppedAreaPixels, selectedFile]);

  const handleConfirmCrop = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const croppedBlob = await cropImage();
      if (!croppedBlob) return;

      if (imgRef.current?.src) URL.revokeObjectURL(imgRef.current.src);

      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: selectedFile.type,
      });

      setCropModalOpen(false);
      setSelectedFile(null);
      setCroppedAreaPixels(null);

      // Upload the cropped image to the server instead of just creating a blob URL
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('type', 'logo');

      const response = await fetch('/api/business/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const permanentUrl = data.url || data.secure_url;

      if (onLogoUpload) onLogoUpload(permanentUrl);
    } catch (error) {
      console.error("Error cropping/uploading image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image.",
        variant: "destructive"
      });
    }
  }, [selectedFile, cropImage, onLogoUpload]);

  return (
    <Card className="w-full p-0 mx-auto border-none shadow-none  bg-transparent  ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {/* --- Profile Information Card --- */}
        <div className="md:col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-200 relative">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h3>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsEditing(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 relative">
              <Avatar className="h-44 w-44 border-2 border-white shadow-sm">
                {logoUrl ? (
                  <AvatarImage src={logoUrl} alt={businessName} />
                ) : (
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-3xl font-bold">
                    {businessName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <label
                  htmlFor="logo-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-100 transition-opacity cursor-pointer"
                >
                  <Edit className="h-6 w-6 text-white" />
                </label>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!isEditing}
              />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={editData.businessName}
                    onChange={(e) =>
                      setEditData({ ...editData, businessName: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full text-lg font-semibold text-gray-900 border rounded-md pl-9 pr-3 py-2 outline-none transition-colors
                      ${
                        isEditing
                          ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Admin Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={editData.adminName}
                    onChange={(e) =>
                      setEditData({ ...editData, adminName: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`w-full text-sm font-medium text-gray-700 border rounded-md pl-9 pr-3 py-2 outline-none transition-colors
                      ${
                        isEditing
                          ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- About Section Card --- */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">About</h3>
            </div>
            {isEditingAbout ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsEditingAbout(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditingAbout(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="relative flex-1">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              disabled={!isEditingAbout}
              className={`flex-1 w-full resize-none border rounded-md p-3 pl-9 text-sm leading-relaxed outline-none transition-colors min-h-[120px]
                ${
                  isEditingAbout
                    ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
            />
          </div>
        </div>

        {/* --- Legal Info Card --- */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">
                Legal Info
              </h3>
            </div>
            {isEditingLegal ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsEditingLegal(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditingLegal(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                GST Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={editData.gstNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, gstNumber: e.target.value })
                  }
                  placeholder="Enter GST Number"
                  disabled={!isEditingLegal}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingLegal
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
            <div className="space-y-4">
              {editData.openingHours.map((hour, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Day
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={hour.day}
                        onChange={(e) => {
                          const newHours = [...editData.openingHours];
                          newHours[index].day = e.target.value;
                          setEditData({ ...editData, openingHours: newHours });
                        }}
                        placeholder="Monday"
                        disabled={!isEditingLegal}
                        className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                                ${
                                  isEditingLegal
                                    ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                                }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Opening Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={hour.open}
                        onChange={(e) => {
                          const newHours = [...editData.openingHours];
                          newHours[index].open = e.target.value;
                          setEditData({ ...editData, openingHours: newHours });
                        }}
                        placeholder="09:00 AM"
                        disabled={!isEditingLegal}
                        className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                                ${
                                  isEditingLegal
                                    ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                                }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Closing Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={hour.close}
                        onChange={(e) => {
                          const newHours = [...editData.openingHours];
                          newHours[index].close = e.target.value;
                          setEditData({ ...editData, openingHours: newHours });
                        }}
                        placeholder="06:00 PM"
                        disabled={!isEditingLegal}
                        className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                                ${
                                  isEditingLegal
                                    ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                                }`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    {editData.openingHours.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newHours = editData.openingHours.filter(
                            (_, i) => i !== index,
                          );
                          setEditData({ ...editData, openingHours: newHours });
                        }}
                        className="h-8 w-8 p-0"
                        disabled={!isEditingLegal}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {index === editData.openingHours.length - 1 &&
                      isEditingLegal && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditData({
                              ...editData,
                              openingHours: [
                                ...editData.openingHours,
                                { day: "", open: "", close: "" },
                              ],
                            });
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Contact Info Card (Separate) --- */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">
                Contact Information
              </h3>
            </div>
            {isEditingContact ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsEditingContact(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditingContact(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  value={editData.address}
                  onChange={(e) =>
                    setEditData({ ...editData, address: e.target.value })
                  }
                  placeholder="Enter Address"
                  disabled={!isEditingContact}
                  rows={3}
                  className={`w-full border rounded-md p-3 pl-9 text-sm outline-none transition-colors resize-none
                        ${
                          isEditingContact
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={editData.mobile}
                  onChange={(e) =>
                    setEditData({ ...editData, mobile: e.target.value })
                  }
                  placeholder="Enter Mobile Number"
                  disabled={!isEditingContact}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingContact
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  placeholder="Enter Email"
                  disabled={!isEditingContact}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingContact
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Social Media Card (Separate) --- */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">
                Social Media
              </h3>
            </div>
            {isEditingSocial ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setIsEditingSocial(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsEditingSocial(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Facebook URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Facebook className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={editData.facebook}
                  onChange={(e) =>
                    setEditData({ ...editData, facebook: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                  disabled={!isEditingSocial}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingSocial
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Twitter URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Twitter className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={editData.twitter}
                  onChange={(e) =>
                    setEditData({ ...editData, twitter: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                  disabled={!isEditingSocial}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingSocial
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 textgray-600"
                        }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Instagram URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Instagram className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={editData.instagram}
                  onChange={(e) =>
                    setEditData({ ...editData, instagram: e.target.value })
                  }
                  placeholder="https://instagram.com/..."
                  disabled={!isEditingSocial}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingSocial
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                LinkedIn URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={editData.linkedin}
                  onChange={(e) =>
                    setEditData({ ...editData, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/..."
                  disabled={!isEditingSocial}
                  className={`w-full border rounded-md pl-9 pr-3 py-2 text-sm outline-none transition-colors
                        ${
                          isEditingSocial
                            ? "bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Image Cropper Modal --- */}
        <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Crop Profile Image</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="h-96  relative flex justify-center bg-gray-100 rounded-lg overflow-hidden">
                <ReactImageCrop
                  crop={crop}
                  onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCroppedAreaPixels(c)}
                  aspect={1}
                  circularCrop={true}
                  className="max-h-full"
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    src={URL.createObjectURL(selectedFile)}
                    alt="Crop me"
                    className=" max-h-full object-contain"
                  />
                </ReactImageCrop>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCropModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmCrop} disabled={!croppedAreaPixels}>
                Confirm Crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
