"use client";

import React from "react";
import { LogOut, MoreHorizontal, X } from "lucide-react";

interface MenuItem {
  title: string;
  icon: any;
  mobileIcon: any;
  value: string;
  mobileTitle: string;
}

interface MobileNavProps {
  menuItems: MenuItem[];
  currentView: string;
  onNavChange: (value: string) => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  onLogout: () => void;
}

export default function MobileNav({
  menuItems,
  currentView,
  onNavChange,
  showMoreMenu,
  setShowMoreMenu,
  onLogout,
}: MobileNavProps) {
  // Show first 4 items in nav bar, rest in "More" menu
  const visibleItems = menuItems.slice(0, 4);
  const moreItems = menuItems.slice(4);

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-50"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {moreItems.map((item) => {
                const MobileIcon = item.mobileIcon;
                return (
                  <button
                    key={item.value}
                    onClick={() => onNavChange(item.value)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                      currentView === item.value
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MobileIcon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {visibleItems.map((item) => {
            const MobileIcon = item.mobileIcon;
            return (
              <button
                key={item.value}
                onClick={() => onNavChange(item.value)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  currentView === item.value
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MobileIcon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.mobileTitle}</span>
              </button>
            );
          })}
          {/* More button for additional items */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
              showMoreMenu ||
              moreItems.some((item) => item.value === currentView)
                ? "text-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
