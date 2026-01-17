"use client";

import { useState } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Save, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Play, Settings } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

interface Banner {
  mediaType: 'image' | 'video';
  media: string;
  headline: string;
  headlineSize: string;
  headlineColor: string;
  headlineAlignment: 'left' | 'center' | 'right';
  subtext: string;
  subtextSize: string;
  subtextColor: string;
  subtextAlignment: 'left' | 'center' | 'right';
  cta: string;
  ctaLink: string;
  showText?: boolean;
}

interface HeroContent {
  slides: Banner[];
  autoPlay: boolean;
  transitionSpeed: number;
  showDots?: boolean;
  showArrows?: boolean;
  showText?: boolean;
}

interface HeroBannerManagerProps {
  heroContent: HeroContent;
  onChange: (content: HeroContent) => void;
}

export default function HeroBannerManager({ heroContent, onChange }: HeroBannerManagerProps) {
  const [selectedBannerIndex, setSelectedBannerIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  // Form state with defaults
  const [bannerForm, setBannerForm] = useState<Banner>({
    mediaType: 'image',
    media: '',
    headline: '',
    headlineSize: 'text-4xl md:text-6xl',
    headlineColor: '#ffffff',
    headlineAlignment: 'center',
    subtext: '',
    subtextSize: 'text-xl md:text-2xl',
    subtextColor: '#ffffff',
    subtextAlignment: 'center',
    cta: 'Get in Touch',
    ctaLink: '',
    showText: true,
  });

  const banners = heroContent.slides || [];

  const handleSelectBanner = (index: number) => {
    setSelectedBannerIndex(index);
  };

  const handleMoveUp = () => {
    if (selectedBannerIndex > 0) {
      const newSlides = [...banners];
      [newSlides[selectedBannerIndex], newSlides[selectedBannerIndex - 1]] = [newSlides[selectedBannerIndex - 1], newSlides[selectedBannerIndex]];
      onChange({ ...heroContent, slides: newSlides });
      setSelectedBannerIndex(selectedBannerIndex - 1);
    }
  };

  const handleMoveDown = () => {
    if (selectedBannerIndex < banners.length - 1) {
      const newSlides = [...banners];
      [newSlides[selectedBannerIndex], newSlides[selectedBannerIndex + 1]] = [newSlides[selectedBannerIndex + 1], newSlides[selectedBannerIndex]];
      onChange({ ...heroContent, slides: newSlides });
      setSelectedBannerIndex(selectedBannerIndex + 1);
    }
  };
 
  const handleDelete = () => {
    setBannerToDelete(selectedBannerIndex);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete !== null) {
      const newSlides = banners.filter((_, i) => i !== bannerToDelete);
      onChange({ ...heroContent, slides: newSlides });
      setSelectedBannerIndex(Math.max(0, bannerToDelete - 1));
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = (index?: number) => {
    const bannerIndex = index !== undefined ? index : selectedBannerIndex;
    
    if (banners[bannerIndex]) {
      // If editing existing, load that banner's data
      setBannerForm(banners[bannerIndex]);
      setEditingBannerIndex(bannerIndex);
    } else {
      // If adding new or invalid index, reset form
      setBannerForm({
        mediaType: 'image',
        media: '',
        headline: '',
        headlineSize: 'text-4xl md:text-6xl',
        headlineColor: '#ffffff',
        headlineAlignment: 'center',
        subtext: '',
        subtextSize: 'text-xl md:text-2xl',
        subtextColor: '#ffffff',
        subtextAlignment: 'center',
        cta: 'Get in Touch',
        ctaLink: '',
        showText: true,
      });
      setEditingBannerIndex(null);
    }
    setShowModal(true);
  };

  const handleAddSlide = () => {
    setBannerForm({
      mediaType: 'image',
      media: '',
      headline: '',
      headlineSize: 'text-4xl md:text-6xl',
      headlineColor: '#ffffff',
      headlineAlignment: 'center',
      subtext: '',
      subtextSize: 'text-xl md:text-2xl',
      subtextColor: '#ffffff',
      subtextAlignment: 'center',
      cta: 'Get in Touch',
      ctaLink: '',
      showText: true,
    });
    setEditingBannerIndex(null);
    setShowModal(true);
  };

  const handleSaveBanner = async () => {
    setSavingBanner(true);
    try {
      const newSlides = [...banners];
      if (editingBannerIndex !== null) {
        // Update existing
        newSlides[editingBannerIndex] = bannerForm;
      } else {
        // Add new
        newSlides.push(bannerForm);
        setSelectedBannerIndex(newSlides.length - 1);
      }
      onChange({ ...heroContent, slides: newSlides });
      setShowModal(false);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveSettings = () => {
    onChange({ ...heroContent });
    setShowSettingsDialog(false);
  };

  const currentBanner = banners[selectedBannerIndex];

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <Select 
            value={selectedBannerIndex.toString()}
            onValueChange={(value) => handleSelectBanner(parseInt(value))}
          >
            <SelectTrigger className="rounded-2xl bg-white">
              <SelectValue placeholder="Select a banner" />
            </SelectTrigger>
            <SelectContent>
              {banners.map((banner, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {index + 1}: {banner.headline || "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        

        {/* Move Up */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (selectedBannerIndex > 0) {
              const newSlides = [...banners];
              [newSlides[selectedBannerIndex], newSlides[selectedBannerIndex - 1]] = [
                newSlides[selectedBannerIndex - 1],
                newSlides[selectedBannerIndex]
              ];
              setSelectedBannerIndex(selectedBannerIndex - 1);
            }
          }}
          disabled={selectedBannerIndex === 0}
          className="rounded-xl"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        {/* Move Down */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (selectedBannerIndex < banners.length - 1) {
              const newSlides = [...banners];
              [newSlides[selectedBannerIndex], newSlides[selectedBannerIndex + 1]] = [
                newSlides[selectedBannerIndex + 1],
                newSlides[selectedBannerIndex]
              ];
              setSelectedBannerIndex(selectedBannerIndex + 1);
            }
          }}
          disabled={selectedBannerIndex === banners.length - 1}
          className="rounded-xl"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Settings Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettingsDialog(true)}
          className="rounded-xl"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Add Button (Always enabled) */}
        <Button onClick={handleAddSlide} className="rounded-2xl ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Banner Preview Section */}
      <Card className="bg-white/30 py-0 relative z-0">
        <CardContent className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Banner Preview</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(selectedBannerIndex)}
                disabled={!currentBanner}
                className="rounded-xl"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={!currentBanner}
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-gray-100 border-3 aspect-3/1 rounded-3xl overflow-hidden relative">
            {currentBanner ? (
              <>
                {currentBanner.mediaType === "video" ||
                currentBanner.media?.includes(".mp4") ? (
                  <video
                    src={currentBanner.media}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={getOptimizedImageUrl(currentBanner.media, {
                      width: 800,
                      height: 450,
                      quality: 85,
                      format: "auto",
                    })}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                )}
                {currentBanner.showText !== false && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-white bg-opacity-40">
                    {currentBanner.headline && (
                      <h1
                        className={`font-bold mb-2 ${currentBanner.headlineSize} ${
                          currentBanner.headlineAlignment === "left"
                            ? "text-left self-start"
                            : currentBanner.headlineAlignment === "right"
                              ? "text-right self-end"
                              : "text-center self-center"
                        }`}
                        style={{ color: currentBanner.headlineColor }}
                      >
                        {currentBanner.headline}
                      </h1>
                    )}
                    {currentBanner.subtext && (
                      <p
                        className={`mb-3 ${currentBanner.subtextSize} ${
                          currentBanner.subtextAlignment === "left"
                            ? "text-left self-start"
                            : currentBanner.subtextAlignment === "right"
                              ? "text-right self-end"
                              : "text-center self-center"
                        }`}
                        style={{ color: currentBanner.subtextColor }}
                      >
                        {currentBanner.subtext}
                      </p>
                    )}
                    {currentBanner.cta && (
                      <a
                        href={currentBanner.ctaLink || "#"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        {currentBanner.cta}
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleEdit(undefined)}
              >
                <Plus className="w-24 h-24 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No banners added yet.
                  <br />
                  Click "Add Banner" to create your first banner.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card className="p-0 pb-1 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => (
                <TableRow
                  key={index}
                  className={index === selectedBannerIndex ? "bg-blue-50" : ""}
                >
                  <TableCell>
                    <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                      {banner.media ? (
                        banner.mediaType === "video" ||
                        banner.media.includes(".mp4") ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Play className="w-6 h-6 text-gray-500" />
                          </div>
                        ) : (
                          <img
                            src={getOptimizedImageUrl(banner.media, {
                              width: 64,
                              height: 48,
                              quality: 85,
                              format: "auto",
                            })}
                            alt="Banner thumbnail"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{banner.mediaType}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {banner.headline || "Untitled"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (index > 0) {
                            const newSlides = [...banners];
                            [newSlides[index], newSlides[index - 1]] = [
                              newSlides[index - 1],
                              newSlides[index],
                            ];
                            onChange({ ...heroContent, slides: newSlides });
                            if (index === selectedBannerIndex) {
                              setSelectedBannerIndex(index - 1);
                            } else if (index - 1 === selectedBannerIndex) {
                              setSelectedBannerIndex(index);
                            }
                          }
                        }}
                        disabled={index === 0}
                        className="rounded-xl"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (index < banners.length - 1) {
                            const newSlides = [...banners];
                            [newSlides[index], newSlides[index + 1]] = [
                              newSlides[index + 1],
                              newSlides[index],
                            ];
                            onChange({ ...heroContent, slides: newSlides });
                            if (index === selectedBannerIndex) {
                              setSelectedBannerIndex(index + 1);
                            } else if (index + 1 === selectedBannerIndex) {
                              setSelectedBannerIndex(index);
                            }
                          }
                        }}
                        disabled={index === banners.length - 1}
                        className="rounded-xl"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                        className="rounded-xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBannerToDelete(index);
                          setShowDeleteDialog(true);
                        }}
                        className="rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {banners.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No banners yet
              </h3>
              <p className="text-gray-600">
                Add your first banner using the controls above
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Modal */}
      {/* Note: z-index ensures it appears above other content. Flex-col ensures proper layout. */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col z-50 bg-white">
          <DialogHeader className="bg-white border-b">
            <DialogTitle className="text-md font-semibold leading-none tracking-tight">
              {editingBannerIndex !== null ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-normal">
              {editingBannerIndex !== null ? "Update banner details" : "Create a new hero banner"}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-1 py-4 space-y-6 bg-white">
            {/* Media Section */}
            <div>
              <Label className="text-sm font-medium">Background Media</Label>
              <div className="mt-2 space-y-3">
                <Select
                  value={bannerForm.mediaType}
                  onValueChange={(value: "image" | "video") =>
                    setBannerForm((prev) => ({ ...prev, mediaType: value }))
                  }
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Media URL"
                  value={bannerForm.media}
                  onChange={(e) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      media: e.target.value,
                    }))
                  }
                  className="rounded-2xl"
                />
                <ImageUpload
                  allowVideo={bannerForm.mediaType === 'video'}
                  onUpload={(url) =>
                    setBannerForm((prev) => ({ ...prev, media: url }))
                  }
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Headline</Label>
                <Input
                  placeholder="Enter headline"
                  value={bannerForm.headline}
                  onChange={(e) =>
                    setBannerForm((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">CTA Text</Label>
                <Input
                  placeholder="Call to action text"
                  value={bannerForm.cta}
                  onChange={(e) =>
                    setBannerForm((prev) => ({ ...prev, cta: e.target.value }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Subtext</Label>
              <Textarea
                placeholder="Enter subtext"
                rows={3}
                value={bannerForm.subtext}
                onChange={(e) =>
                  setBannerForm((prev) => ({
                    ...prev,
                    subtext: e.target.value,
                  }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">CTA Link</Label>
              <Input
                placeholder="https://..."
                value={bannerForm.ctaLink}
                onChange={(e) =>
                  setBannerForm((prev) => ({
                    ...prev,
                    ctaLink: e.target.value,
                  }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>

            {/* Style Section */}
            <div>
              <h3 className="text-sm font-medium mb-4">Headline Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Size</Label>
                  <Select
                    value={bannerForm.headlineSize}
                    onValueChange={(value) =>
                      setBannerForm((prev) => ({
                        ...prev,
                        headlineSize: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                        Small
                      </SelectItem>
                      <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                        Medium
                      </SelectItem>
                      <SelectItem value="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                        Large
                      </SelectItem>
                      <SelectItem value="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                        Extra Large
                      </SelectItem>
                      <SelectItem value="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                        Huge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={bannerForm.headlineColor}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          headlineColor: e.target.value,
                        }))
                      }
                      className="w-12 h-10 p-1 rounded-2xl"
                    />
                    <Input
                      value={bannerForm.headlineColor}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          headlineColor: e.target.value,
                        }))
                      }
                      placeholder="#ffffff"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Alignment</Label>
                  <Select
                    value={bannerForm.headlineAlignment}
                    onValueChange={(value: "left" | "center" | "right") =>
                      setBannerForm((prev) => ({
                        ...prev,
                        headlineAlignment: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Subtext Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Size</Label>
                  <Select
                    value={bannerForm.subtextSize}
                    onValueChange={(value) =>
                      setBannerForm((prev) => ({ ...prev, subtextSize: value }))
                    }
                  >
                    <SelectTrigger className="mt-2 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl">
                        Small
                      </SelectItem>
                      <SelectItem value="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl">
                        Medium
                      </SelectItem>
                      <SelectItem value="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl">
                        Large
                      </SelectItem>
                      <SelectItem value="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                        Extra Large
                      </SelectItem>
                      <SelectItem value="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                        Huge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="color"
                      value={bannerForm.subtextColor}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          subtextColor: e.target.value,
                        }))
                      }
                      className="w-12 h-10 p-1 rounded-2xl"
                    />
                    <Input
                      value={bannerForm.subtextColor}
                      onChange={(e) =>
                        setBannerForm((prev) => ({
                          ...prev,
                          subtextColor: e.target.value,
                        }))
                      }
                      placeholder="#ffffff"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Alignment</Label>
                  <Select
                    value={bannerForm.subtextAlignment}
                    onValueChange={(value: "left" | "center" | "right") =>
                      setBannerForm((prev) => ({
                        ...prev,
                        subtextAlignment: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showText"
                checked={bannerForm.showText !== false}
                onChange={(e) =>
                  setBannerForm((prev) => ({
                    ...prev,
                    showText: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="showText" className="text-sm">
                Show text overlay
              </Label>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 flex flex-row justify-center border-t bg-white z-10 shrink-0">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-full w-auto flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveBanner} disabled={savingBanner} className="rounded-full w-auto flex-1">
              {savingBanner ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingBannerIndex !== null ? 'Update Banner' : 'Add Banner'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md z-50">
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="rounded-2xl bg-red-500 hover:bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md z-50 bg-white">
          <DialogHeader className="bg-white border-b">
            <DialogTitle className="text-md font-semibold leading-none tracking-tight">
              Slider Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-normal">
              Configure hero slider behavior and appearance
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTextOverlay" className="text-sm">Show Text Overlay</Label>
                <Switch
                  id="showTextOverlay"
                  checked={heroContent.showText !== false}
                  onCheckedChange={(checked) => {
                    onChange({ ...heroContent, showText: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay" className="text-sm">Auto-play</Label>
                <Switch
                  id="autoplay"
                  checked={heroContent.autoPlay}
                  onCheckedChange={(checked) => {
                    onChange({ ...heroContent, autoPlay: checked });
                  }}
                />
              </div>

              <div>
                <Label className="text-sm">Transition Speed (seconds)</Label>
                <Select
                  value={heroContent.transitionSpeed?.toString()}
                  onValueChange={(value) => {
                    onChange({ ...heroContent, transitionSpeed: parseInt(value) });
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="7">7 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showDots" className="text-sm">Show Navigation Dots</Label>
                <Switch
                  id="showDots"
                  checked={heroContent.showDots !== false}
                  onCheckedChange={(checked) => {
                    onChange({ ...heroContent, showDots: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showArrows" className="text-sm">Show Navigation Arrows</Label>
                <Switch
                  id="showArrows"
                  checked={heroContent.showArrows !== false}
                  onCheckedChange={(checked) => {
                    onChange({ ...heroContent, showArrows: checked });
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-3 flex flex-row justify-center border-t bg-white z-10 shrink-0">
            <Button type="button" variant="outline" onClick={() => setShowSettingsDialog(false)} className="rounded-full w-auto flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="rounded-full w-auto flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}