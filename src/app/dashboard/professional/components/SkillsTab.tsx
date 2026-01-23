"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, X } from "lucide-react";
import { SkillCard } from "./ReusableComponents";

interface SkillsTabProps {
  skills: Array<{
    name: string;
    level: "beginner" | "intermediate" | "expert" | "master";
  }>;
  setSkills: React.Dispatch<React.SetStateAction<Array<{
    name: string;
    level: "beginner" | "intermediate" | "expert" | "master";
  }>>>;
  handleUpdateSkills: () => void;
  themeSettings: any;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  setSkills,
  handleUpdateSkills,
  themeSettings,
}) => {
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [editingSkillItem, setEditingSkillItem] = useState<number | null>(null);
  const [skillFormData, setSkillFormData] = useState({
    name: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'expert' | 'master'
  });

  return (
    <div className="space-y-6">
      <Button
        onClick={() => {
          setEditingSkillItem(null);
          setSkillFormData({ name: '', level: 'intermediate' });
          setShowSkillDialog(true);
        }}
        className={`w-full ${themeSettings.buttonStyle} ${themeSettings.borderRadius}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>

      <div className="space-y-3">
        {skills.map((item, index) => (
          <SkillCard
            key={index}
            skill={item}
            index={index}
            onEdit={(index) => {
              setEditingSkillItem(index);
              setSkillFormData(item);
              setShowSkillDialog(true);
            }}
            onDelete={(index) => {
              const newSkills = skills.filter((_, i) => i !== index);
              setSkills(newSkills);
              handleUpdateSkills();
            }}
          />
        ))}
      </div>

      <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSkillItem !== null ? 'Edit' : 'Add'} Skill
            </DialogTitle>
            <DialogDescription>
              {editingSkillItem !== null ? 'Update your skill details.' : 'Add your skill details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const newSkills = editingSkillItem !== null
              ? skills.map((item, index) => index === editingSkillItem ? skillFormData : item)
              : [...skills, skillFormData];
            setSkills(newSkills);
            handleUpdateSkills();
            setShowSkillDialog(false);
            setEditingSkillItem(null);
            setSkillFormData({ name: '', level: 'intermediate' });
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input
                  value={skillFormData.name}
                  onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
                  placeholder="e.g., JavaScript"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select
                  value={skillFormData.level}
                  onValueChange={(value) => setSkillFormData({ ...skillFormData, level: value as 'beginner' | 'intermediate' | 'expert' | 'master' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSkillDialog(false)}
                className={themeSettings.borderRadius}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={themeSettings.buttonStyle}
              >
                {editingSkillItem !== null ? 'Update' : 'Add'} Skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsTab;