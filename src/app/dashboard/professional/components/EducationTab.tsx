"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EducationCard } from "./ReusableComponents";

interface EducationTabProps {
  education: any[];
  setEducation: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdateEducation: () => void;
  themeSettings: any;
}

const EducationTab: React.FC<EducationTabProps> = ({
  education,
  setEducation,
  handleUpdateEducation,
  themeSettings,
}) => {
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [editingEducationItem, setEditingEducationItem] = useState<number | null>(null);
  const [educationFormData, setEducationFormData] = useState({
    degree: '',
    institution: '',
    year: '',
    description: ''
  });

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setEditingEducationItem(null);
          setEducationFormData({ degree: '', institution: '', year: '', description: '' });
          setShowEducationDialog(true);
        }}
        className={`w-full ${themeSettings.buttonStyle} ${themeSettings.borderRadius}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>

      <div className="space-y-3">
          {education.map((item, index) => (
            <EducationCard
              key={index}
              education={item}
              index={index}
              onEdit={(index) => {
                setEditingEducationItem(index);
                setEducationFormData(item);
                setShowEducationDialog(true);
              }}
              onDelete={(index) => {
                const newItems = education.filter((_, i) => i !== index);
                setEducation(newItems);
                handleUpdateEducation();
              }}
            />
          ))}
      </div>

      <Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEducationItem !== null ? 'Edit' : 'Add'} Education
            </DialogTitle>
            <DialogDescription>
              {editingEducationItem !== null ? 'Update your education details.' : 'Add your education details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingEducationItem !== null) {
              const newItems = [...education];
              newItems[editingEducationItem] = educationFormData;
              setEducation(newItems);
            } else {
              setEducation([...education, educationFormData]);
            }
            handleUpdateEducation();
            setShowEducationDialog(false);
            setEditingEducationItem(null);
            setEducationFormData({ degree: '', institution: '', year: '', description: '' });
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Degree/Certificate</Label>
                <Input
                  value={educationFormData.degree}
                  onChange={(e) => setEducationFormData({ ...educationFormData, degree: e.target.value })}
                  placeholder="e.g., Bachelor of Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input
                  value={educationFormData.institution}
                  onChange={(e) => setEducationFormData({ ...educationFormData, institution: e.target.value })}
                  placeholder="e.g., University Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  min="1900"
                  max="2030"
                  value={educationFormData.year}
                  onChange={(e) => setEducationFormData({ ...educationFormData, year: e.target.value })}
                  placeholder="e.g., 2020"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={educationFormData.description}
                  onChange={(e) => setEducationFormData({ ...educationFormData, description: e.target.value })}
                  placeholder="Additional details about your education..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEducationDialog(false)}
                className={themeSettings.borderRadius}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={themeSettings.buttonStyle}
              >
                {editingEducationItem !== null ? 'Update' : 'Add'} Education
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationTab;