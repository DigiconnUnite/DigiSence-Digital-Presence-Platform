"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface MenuItem {
  title: string;
  icon: any;
  mobileIcon: any;
  value: string;
  mobileTitle: string;
}

interface DashboardSidebarProps {
  menuItems: MenuItem[];
  currentView: string;
  setCurrentView: (value: string) => void;
  onLogout: () => void;
  role: "SUPER_ADMIN" | "BUSINESS_ADMIN" | "PROFESSIONAL_ADMIN";
}

export default function DashboardSidebar({
  menuItems,
  currentView,
  setCurrentView,
  onLogout,
  role,
}: DashboardSidebarProps) {
  const getRoleLabel = () => {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "BUSINESS_ADMIN") return "Business Admin";
    if (role === "PROFESSIONAL_ADMIN") return "Professional";
    return "Dashboard";
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* Generic Icon based on role */}
          <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
            {getRoleLabel().charAt(0)}
          </div>
          <span className="font-semibold text-sm">{getRoleLabel()}</span>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => setCurrentView(item.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${
                  currentView === item.value
                    ? " bg-linear-to-r from-orange-400 to-amber-500 text-white"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
