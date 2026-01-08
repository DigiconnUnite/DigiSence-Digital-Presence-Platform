"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Edit, X } from "lucide-react";

interface ProfileTabsProps {
  activeProfileTab: string;
  setActiveProfileTab: (tab: string) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeProfileTab, 
  setActiveProfileTab, 
  isMobile, 
  children 
}) => {
  const tabItems = [
    { value: "basic", label: "Basic" },
    { value: "skills", label: "Skills" },
    { value: "experience", label: "Experience" },
    { value: "education", label: "Education" },
    { value: "services", label: "Services" },
    { value: "portfolio", label: "Portfolio" },
  ];

  const mobileTabItems = [
    { value: "education", label: "Education" },
    { value: "services", label: "Services" },
    { value: "portfolio", label: "Portfolio" },
  ];

  return (
    <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
      <div className="flex items-center">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'}`}>
          {tabItems.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {mobileTabItems.map((tab) => (
                <DropdownMenuItem 
                  key={tab.value} 
                  onClick={() => setActiveProfileTab(tab.value)}
                >
                  {tab.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {children}
    </Tabs>
  );
};

export default ProfileTabs;