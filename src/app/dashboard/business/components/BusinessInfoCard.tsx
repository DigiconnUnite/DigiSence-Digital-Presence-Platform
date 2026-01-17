import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ReactImageCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface BusinessInfoCardProps {
  businessName: string;
  adminName: string;
  description: string;
  logoUrl?: string;
  onEdit?: () => void;
  onLogoUpload?: (url: string) => void;
}

export const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({
  businessName,
  adminName,
  description,
  logoUrl,
  onEdit,
  onLogoUpload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    businessName,
    adminName,
    description,
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Here you would typically call an API to save the changes
    // For now, we'll just toggle the editing state
    setIsEditing(false);
  };

  const handleLogoUpload = (url: string) => {
    if (onLogoUpload) {
      onLogoUpload(url);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setCropModalOpen(true);
      }
    }
  }, []);

  const cropImage = useCallback(async (): Promise<Blob> => {
    const image = imgRef.current;
    if (!image || !croppedAreaPixels) {
      throw new Error('Crop canvas does not exist');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Get the actual natural size of the image
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    // Calculate the scaling factor between the displayed image and the natural image
    const scaleX = naturalWidth / image.width;
    const scaleY = naturalHeight / image.height;

    // Scale the cropped area coordinates to match the natural image dimensions
    const scaledCropX = croppedAreaPixels.x * scaleX;
    const scaledCropY = croppedAreaPixels.y * scaleY;
    const scaledCropWidth = croppedAreaPixels.width * scaleX;
    const scaledCropHeight = croppedAreaPixels.height * scaleY;

    // Set canvas size to the size of the cropped area in natural pixels
    canvas.width = scaledCropWidth;
    canvas.height = scaledCropHeight;

    // Draw the image using the scaled coordinates
    ctx.drawImage(
      image,
      scaledCropX,
      scaledCropY,
      scaledCropWidth,
      scaledCropHeight,
      0,
      0,
      scaledCropWidth,
      scaledCropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas blob failed');
        }
        resolve(blob);
      }, selectedFile?.type || 'image/jpeg');
    });
  }, [croppedAreaPixels, selectedFile]);

  const handleConfirmCrop = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const croppedBlob = await cropImage();
      if (!croppedBlob) return;

      // Cleanup object URL to free memory
      if (imgRef.current?.src) {
        URL.revokeObjectURL(imgRef.current.src);
      }

      const croppedFile = new File([croppedBlob], selectedFile.name, { type: selectedFile.type });

      setCropModalOpen(false);
      setSelectedFile(null);
      setCroppedAreaPixels(null);

      // Create object URL for the cropped image and pass it to the upload handler
      const croppedUrl = URL.createObjectURL(croppedFile);
      if (onLogoUpload) {
        onLogoUpload(croppedUrl);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image.");
    }
  }, [selectedFile, cropImage, onLogoUpload]);

  return (
    <Card className="w-full p-0  mx-auto rounded-3xl shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Profile Photo */}
        <div className="md:w-fit md-h-50 bg-linear-to-br rounded-3xl m-2 from-blue-50 to-blue-100 p-3 flex flex-col items-center justify-center relative">
          <Avatar className="w-auto h-auto mb-4 border-4 border-white shadow-md">
            {logoUrl ? (
              <AvatarImage src={logoUrl} alt={businessName} />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white text-2xl font-bold">
                {businessName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          {/* Make logo clickable for upload with cropper */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
            style={{ zIndex: 10 }}
          />

          {/* Image Cropper Modal */}
          <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Crop Image</DialogTitle>
              </DialogHeader>
              {selectedFile && (
                <div className="h-96 w-full relative">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-1 mb-4 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCrop({ unit: '%', x: 25, y: 25, width: 50, height: 50 })}
                      >
                        Reset Crop
                      </Button>
                    </div>
                    <ReactImageCrop
                      crop={crop}
                      onChange={(_pixelCrop, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCroppedAreaPixels(c)}
                      aspect={1}
                    >
                      <img
                        ref={imgRef}
                        src={URL.createObjectURL(selectedFile)}
                        alt="Crop me"
                        style={{ maxHeight: '60vh', maxWidth: '100%' }}
                      />
                    </ReactImageCrop>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCropModalOpen(false);
                    setSelectedFile(null);
                    setCroppedAreaPixels(null);
                    if (imgRef.current?.src) URL.revokeObjectURL(imgRef.current.src);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmCrop} disabled={!croppedAreaPixels}>
                  Confirm Crop
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
         
        </div>

        {/* Right side - Text Content */}
        <div className="md:w-2/3 p-6 relative">
          {/* Edit button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 rounded-full h-8 w-8 p-0"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <CardHeader className="p-0 mb-4">
            {isEditing ? (
              <input
                type="text"
                value={editData.businessName}
                onChange={(e) => setEditData({...editData, businessName: e.target.value})}
                className="text-2xl font-bold text-gray-900 border border-gray-300 rounded-xl px-3 py-2 w-full"
              />
            ) : (
              <CardTitle className="text-2xl font-bold text-gray-900">
                {businessName}
              </CardTitle>
            )}
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">👤</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Admin Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.adminName}
                    onChange={(e) => setEditData({...editData, adminName: e.target.value})}
                    className="font-medium text-gray-900 border border-gray-300 rounded-xl px-2 py-1"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{adminName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Description</p>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="text-gray-700 leading-relaxed border border-gray-300 rounded-xl px-3 py-2 w-full min-h-[100px]"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Additional business information can be added here */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Category</p>
                <p className="font-medium text-gray-900">Business Services</p>
              </div>
            </div>

            {/* Save button when editing */}
            {isEditing && (
              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} className="rounded-xl">
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};