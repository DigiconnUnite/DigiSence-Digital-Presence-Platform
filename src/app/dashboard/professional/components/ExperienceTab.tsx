"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { ExperienceCard } from "./ReusableComponents";

interface ExperienceTabProps {
  workExperience: any[];
  setWorkExperience: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdateExperience: (experienceToSave?: any[]) => void;
  themeSettings: any;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({
  workExperience,
  setWorkExperience,
  handleUpdateExperience,
  themeSettings,
}) => {
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [editingExperienceItem, setEditingExperienceItem] = useState<number | null>(null);
  const [experienceFormData, setExperienceFormData] = useState({
    position: '',
    company: '',
    location: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setEditingExperienceItem(null);
          setExperienceFormData({ position: '', company: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false });
          setShowExperienceDialog(true);
        }}
        className={`w-full ${themeSettings.buttonStyle} ${themeSettings.borderRadius}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>

      <div className="space-y-3">
        {workExperience.map((item, index) => (
          <ExperienceCard
            key={index}
            experience={item}
            index={index}
            onEdit={(index) => {
              setEditingExperienceItem(index);
              setExperienceFormData(item);
              setShowExperienceDialog(true);
            }}
            onDelete={(index) => {
              const newItems = workExperience.filter((_, i) => i !== index);
              setWorkExperience(newItems);
              handleUpdateExperience();
            }}
          />
        ))}
      </div>

      <Dialog open={showExperienceDialog} onOpenChange={setShowExperienceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExperienceItem !== null ? 'Edit' : 'Add'} Work Experience
            </DialogTitle>
            <DialogDescription>
              {editingExperienceItem !== null ? 'Update your work experience details.' : 'Add your work experience details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
              const newExperience = editingExperienceItem !== null
                ? workExperience.map((item, index) => index === editingExperienceItem ? experienceFormData : item)
                : [...workExperience, experienceFormData];
              handleUpdateExperience(newExperience);
            setShowExperienceDialog(false);
            setEditingExperienceItem(null);
            setExperienceFormData({ position: '', company: '', location: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false });
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Position/Title</Label>
                <Input
                  value={experienceFormData.position}
                  onChange={(e) => setExperienceFormData({ ...experienceFormData, position: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Company/Organization</Label>
                <Input
                  value={experienceFormData.company}
                  onChange={(e) => setExperienceFormData({ ...experienceFormData, company: e.target.value })}
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={experienceFormData.location}
                  onChange={(e) => setExperienceFormData({ ...experienceFormData, location: e.target.value })}
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Month</Label>
                  <Select
                    value={experienceFormData.startMonth}
                    onValueChange={(value) => setExperienceFormData({ ...experienceFormData, startMonth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Year</Label>
                  <Input
                    type="number"
                    min="1900"
                    max="2030"
                    value={experienceFormData.startYear}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, startYear: e.target.value })}
                    placeholder="Year"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Month</Label>
                  <Select
                    value={experienceFormData.endMonth}
                    onValueChange={(value) => setExperienceFormData({ ...experienceFormData, endMonth: value })}
                    disabled={experienceFormData.isCurrent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Year</Label>
                  <Input
                    type="number"
                    min="1900"
                    max="2030"
                    value={experienceFormData.endYear}
                    onChange={(e) => setExperienceFormData({ ...experienceFormData, endYear: e.target.value })}
                    placeholder="Year"
                    disabled={experienceFormData.isCurrent}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="current"
                  checked={experienceFormData.isCurrent}
                  onCheckedChange={(checked) => setExperienceFormData({ ...experienceFormData, isCurrent: checked === true })}
                />
                <Label htmlFor="current">I currently work here</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExperienceDialog(false)}
                className={themeSettings.borderRadius}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={themeSettings.buttonStyle}
              >
                {editingExperienceItem !== null ? 'Update' : 'Add'} Experience
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExperienceTab;