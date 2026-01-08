"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ServiceCard } from "./ReusableComponents";

interface ServicesTabProps {
  services: any[];
  setServices: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdateServices: (servicesToSave?: any[]) => void;
  themeSettings: any;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  setServices,
  handleUpdateServices,
  themeSettings,
}) => {
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [editingServicesItem, setEditingServicesItem] = useState<number | null>(null);
  const [servicesFormData, setServicesFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setEditingServicesItem(null);
          setServicesFormData({ name: '', description: '', price: '' });
          setShowServicesDialog(true);
        }}
        className={`w-full ${themeSettings.buttonStyle} ${themeSettings.borderRadius}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Service
      </Button>

      <div className="space-y-3">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              onEdit={(index) => {
                setEditingServicesItem(index);
                setServicesFormData(service);
                setShowServicesDialog(true);
              }}
              onDelete={(index) => {
                const newItems = services.filter((_, i) => i !== index);
                handleUpdateServices(newItems);
              }}
            />
          ))}
      </div>

      <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingServicesItem !== null ? 'Edit' : 'Add'} Service
            </DialogTitle>
            <DialogDescription>
              {editingServicesItem !== null ? 'Update your service details.' : 'Add your service details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
              const newServices = editingServicesItem !== null
                ? services.map((item, index) => index === editingServicesItem ? servicesFormData : item)
                : [...services, servicesFormData];
              handleUpdateServices(newServices);
            setShowServicesDialog(false);
            setEditingServicesItem(null);
            setServicesFormData({ name: '', description: '', price: '' });
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  value={servicesFormData.name}
                  onChange={(e) => setServicesFormData({ ...servicesFormData, name: e.target.value })}
                  placeholder="e.g., Web Development"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={servicesFormData.description}
                  onChange={(e) => setServicesFormData({ ...servicesFormData, description: e.target.value })}
                  placeholder="Describe your service..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (Optional)</Label>
                <Input
                  value={servicesFormData.price}
                  onChange={(e) => setServicesFormData({ ...servicesFormData, price: e.target.value })}
                  placeholder="e.g., $50/hour"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowServicesDialog(false)}
                className={themeSettings.borderRadius}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={themeSettings.buttonStyle}
              >
                {editingServicesItem !== null ? 'Update' : 'Add'} Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesTab;