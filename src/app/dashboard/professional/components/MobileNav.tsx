"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  User, 
  Cog, 
  Home, 
  Eye, 
  Edit 
} from "lucide-react";

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isMobile: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, isMobile }) => {
  const menuItems = [
    {
      title: "Overview",
      icon: BarChart3,
      mobileIcon: Home,
      value: "overview",
      mobileTitle: "Home",
    },
    {
      title: "My Profile",
      icon: User,
      mobileIcon: User,
      value: "profile",
      mobileTitle: "Profile",
    },
    {
      title: "Settings",
      icon: Cog,
      mobileIcon: Cog,
      value: "settings",
      mobileTitle: "Settings",
    },
  ];

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const MobileIcon = item.mobileIcon;
          return (
            <button
              key={item.value}
              onClick={() => onNavigate(item.value)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${currentView === item.value
                ? "text-amber-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <MobileIcon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">
                {item.mobileTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;