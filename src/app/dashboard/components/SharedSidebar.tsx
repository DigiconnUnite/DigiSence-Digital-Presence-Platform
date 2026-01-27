import React, { useState } from 'react';
import { LogOut, MoreHorizontal } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: any;
  mobileIcon: any;
  value: string;
  mobileTitle: string;
}

interface SharedSidebarProps {
  navLinks: MenuItem[];
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isMobile: boolean;
  headerTitle: string;
  headerIcon?: any;
  showMoreMenu?: boolean;
}

export default function SharedSidebar({
  navLinks,
  currentView,
  onViewChange,
  onLogout,
  isMobile,
  headerTitle,
  headerIcon: HeaderIcon,
}: SharedSidebarProps) {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {navLinks.slice(0, 4).map((item) => {
            const MobileIcon = item.mobileIcon;
            return (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  currentView === item.value
                    ? "text-orange-500"
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
          {/* More button for additional items */}
          {navLinks.length > 4 && (
            <button
              onClick={() => {
                // Handle more menu - this could be expanded
                const moreItems = navLinks.slice(4);
                if (moreItems.length > 0) {
                  onViewChange(moreItems[0].value);
                }
              }}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                navLinks.slice(4).some((item) => item.value === currentView)
                  ? "text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LogOut className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 rounded-t-3xl">
        <div className="flex items-center space-x-2">
          {HeaderIcon && <HeaderIcon className="h-6 w-6" />}
          <span className="font-semibold">{headerTitle}</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => onViewChange(item.value)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${
                  currentView === item.value
                    ? "bg-linear-to-r from-orange-400 to-amber-500 text-white"
                    : "text-gray-700 hover:bg-orange-50"
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
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}