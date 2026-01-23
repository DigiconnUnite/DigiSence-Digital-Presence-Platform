"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { PortfolioCard } from "./ReusableComponents";

interface PortfolioTabProps {
  portfolio: any[];
  setPortfolio: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdatePortfolio: (portfolioToSave?: any[]) => void;
  themeSettings: any;
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({
  portfolio,
  setPortfolio,
  handleUpdatePortfolio,
  themeSettings,
}) => {
  const [showPortfolioDialog, setShowPortfolioDialog] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<number | null>(null);
  const [portfolioFormData, setPortfolioFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setEditingPortfolioItem(null);
          setPortfolioFormData({ title: '', description: '', url: '' });
          setShowPortfolioDialog(true);
        }}
        className={`w-full ${themeSettings.buttonStyle} ${themeSettings.borderRadius}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Portfolio Item
      </Button>

      <div className="space-y-3">
        {portfolio.map((item, index) => (
          <PortfolioCard
            key={index}
            portfolio={item}
            index={index}
            onEdit={(index) => {
              setEditingPortfolioItem(index);
              setPortfolioFormData(item);
              setShowPortfolioDialog(true);
            }}
            onDelete={(index) => {
              const newItems = portfolio.filter((_, i) => i !== index);
              handleUpdatePortfolio(newItems);
            }}
          />
        ))}
      </div>

      <Dialog open={showPortfolioDialog} onOpenChange={setShowPortfolioDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPortfolioItem !== null ? 'Edit' : 'Add'} Portfolio Item
            </DialogTitle>
            <DialogDescription>
              {editingPortfolioItem !== null ? 'Update your portfolio item details.' : 'Add your portfolio item details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
              const newPortfolio = editingPortfolioItem !== null
                ? portfolio.map((item, index) => index === editingPortfolioItem ? portfolioFormData : item)
                : [...portfolio, portfolioFormData];
              handleUpdatePortfolio(newPortfolio);
            setShowPortfolioDialog(false);
            setEditingPortfolioItem(null);
            setPortfolioFormData({ title: '', description: '', url: '' });
          }}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={portfolioFormData.title}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, title: e.target.value })}
                    placeholder="e.g., Website Design Project"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={portfolioFormData.description}
                    onChange={(e) => setPortfolioFormData({ ...portfolioFormData, description: e.target.value })}
                    placeholder="Describe your work..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio Image</Label>
                  <ImageUpload
                    onUpload={(url) => setPortfolioFormData({ ...portfolioFormData, url })}
                    uploadUrl="/api/professionals/upload"
                      uploadType="portfolio"
                  />
                  {portfolioFormData.url && (
                    <p className="text-sm text-gray-600">
                      Image uploaded successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPortfolioDialog(false)}
                className={themeSettings.borderRadius}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={themeSettings.buttonStyle}
                disabled={!portfolioFormData.url}
              >
                {editingPortfolioItem !== null ? 'Update' : 'Add'} Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioTab;