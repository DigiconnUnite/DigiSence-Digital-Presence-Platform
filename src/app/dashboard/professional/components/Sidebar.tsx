"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { User, BarChart3, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      value: "overview",
    },
    {
      title: "User Profile",
      icon: User,
      value: "profile",
    },
    {
      title: "Settings",
      icon: Settings,
      value: "settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      onLogout();
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-64 m-4 border rounded-3xl bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 rounded-t-3xl">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <span className="font-semibold">Professional</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.title}>
              <button
                onClick={() => onNavigate(item.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${currentView === item.value
                  ? "bg-amber-100 text-amber-600"
                  : "text-gray-700 hover:bg-amber-50"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200 mb-5 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;