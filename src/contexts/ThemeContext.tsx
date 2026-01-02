// contexts/ThemeContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  gap: string;
  backgroundTheme: "default" | "dark" | "light" | "gradient";
  fontFamily?: string;
  fontSize?: string;
  cardStyle?: string;
  buttonStyle?: string;
  cardClass?: string;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  updateTheme: (newSettings: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  getBackgroundClass: () => string;
  getCardClass: () => string;
  getButtonClass: () => string;
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getBorderRadius: () => string;
  getGap: () => string;
}

const defaultThemeSettings: ThemeSettings = {
  primaryColor: "#f59e0b",
  secondaryColor: "#374151",
  borderRadius: "rounded-3xl",
  gap: "gap-6",
  backgroundTheme: "default",
  fontFamily: "font-sans",
  fontSize: "text-base",
  cardStyle: "shadow-lg",
  buttonStyle: "rounded-xl",
  cardClass: "bg-white border border-gray-200 shadow-lg",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeSettings, setThemeSettings] =
    useState<ThemeSettings>(defaultThemeSettings);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("professionalTheme");
    if (savedTheme) {
      try {
        setThemeSettings(JSON.parse(savedTheme));
      } catch (error) {
        console.error("Failed to parse saved theme:", error);
      }
    }
  }, []);

  const updateTheme = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...themeSettings, ...newSettings };
    setThemeSettings(updatedSettings);
    localStorage.setItem("professionalTheme", JSON.stringify(updatedSettings));
  };

  const resetTheme = () => {
    setThemeSettings(defaultThemeSettings);
    localStorage.setItem(
      "professionalTheme",
      JSON.stringify(defaultThemeSettings)
    );
  };

  const getBackgroundClass = () => {
    switch (themeSettings.backgroundTheme) {
      case "dark":
        return "bg-gray-900";
      case "light":
        return "bg-gray-100";
      case "gradient":
        return "bg-gradient-to-r from-blue-50 to-purple-50";
      default:
        return "bg-linear-to-b from-sky-300 via-white to-white";
    }
  };

  const getCardClass = () => {
    return `bg-white border border-gray-200 ${
      themeSettings.cardStyle || "shadow-lg"
    } ${themeSettings.borderRadius}`;
  };

  const getButtonClass = () => {
    return `${
      themeSettings.buttonStyle || "rounded-xl"
    } bg-amber-600 hover:bg-amber-700 text-white`;
  };

  const getPrimaryColor = () => themeSettings.primaryColor;
  const getSecondaryColor = () => themeSettings.secondaryColor;
  const getBorderRadius = () => themeSettings.borderRadius;
  const getGap = () => themeSettings.gap;

  return (
    <ThemeContext.Provider
      value={{
        themeSettings,
        updateTheme,
        resetTheme,
        getBackgroundClass,
        getCardClass,
        getButtonClass,
        getPrimaryColor,
        getSecondaryColor,
        getBorderRadius,
        getGap,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
