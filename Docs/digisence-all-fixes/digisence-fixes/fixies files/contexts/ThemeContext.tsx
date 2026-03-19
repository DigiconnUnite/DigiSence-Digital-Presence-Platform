'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  borderRadius: string
  gap: string
  backgroundTheme: 'default' | 'dark' | 'light' | 'gradient'
  fontFamily?: string
  fontSize?: string
  cardStyle?: string
  buttonStyle?: string
  cardClass?: string
}

interface ThemeContextType {
  themeSettings: ThemeSettings
  updateTheme: (newSettings: Partial<ThemeSettings>) => void
  resetTheme: () => void
  saveTheme: () => void  // FIXED: was missing — Save button had no handler
  getBackgroundClass: () => string
  getCardClass: () => string
  getButtonClass: () => string
  getPrimaryColor: () => string
  getSecondaryColor: () => string
  getBorderRadius: () => string
  getGap: () => string
}

const STORAGE_KEY = 'professionalTheme'

const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#f59e0b',
  secondaryColor: '#374151',
  borderRadius: 'rounded-3xl',
  gap: 'gap-6',
  backgroundTheme: 'default',
  fontFamily: 'font-sans',
  fontSize: 'text-base',
  cardStyle: 'shadow-lg',
  buttonStyle: 'rounded-xl',
  cardClass: 'bg-white border border-gray-200 shadow-lg',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * FIXED: Previously the theme was loaded in useEffect, causing a flash of default
 * styles on every page load (FOUC — Flash of Unstyled Content). The fix has two parts:
 *
 * 1. ThemeProvider now reads localStorage synchronously on first render using a
 *    lazy initializer function in useState — this avoids the default → saved flash.
 *
 * 2. A companion script tag (ThemeScript) can be added to layout.tsx <head> to
 *    set CSS variables before React hydrates, preventing any flash at all.
 */
function getInitialTheme(): ThemeSettings {
  if (typeof window === 'undefined') return defaultThemeSettings
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultThemeSettings, ...JSON.parse(saved) }
  } catch {}
  return defaultThemeSettings
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // FIXED: lazy initializer reads localStorage synchronously — no useEffect needed
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(getInitialTheme)

  const updateTheme = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // FIXED: saveTheme was missing — the Save button in ThemeView had an empty onClick
  const saveTheme = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeSettings))
    } catch (e) {
      console.error('Failed to save theme:', e)
    }
  }

  const resetTheme = () => {
    setThemeSettings(defaultThemeSettings)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const getBackgroundClass = () => {
    switch (themeSettings.backgroundTheme) {
      case 'dark': return 'bg-gray-900'
      case 'light': return 'bg-gray-100'
      case 'gradient': return 'bg-gradient-to-r from-blue-50 to-purple-50'
      default: return 'bg-orange-50'
    }
  }

  const getCardClass = () =>
    `bg-white border border-gray-200 ${themeSettings.cardStyle || 'shadow-lg'} ${themeSettings.borderRadius}`

  const getButtonClass = () =>
    `${themeSettings.buttonStyle || 'rounded-xl'} bg-sky-600 hover:bg-sky-700 text-white`

  return (
    <ThemeContext.Provider
      value={{
        themeSettings,
        updateTheme,
        resetTheme,
        saveTheme,
        getBackgroundClass,
        getCardClass,
        getButtonClass,
        getPrimaryColor: () => themeSettings.primaryColor,
        getSecondaryColor: () => themeSettings.secondaryColor,
        getBorderRadius: () => themeSettings.borderRadius,
        getGap: () => themeSettings.gap,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

/**
 * Add this to your layout.tsx <head> to prevent any theme flash:
 *
 * <ThemeScript />
 *
 * This runs before React hydrates and sets CSS variables immediately.
 */
export function ThemeScript() {
  const script = `
    try {
      var t = JSON.parse(localStorage.getItem('${STORAGE_KEY}') || '{}');
      if (t.primaryColor) document.documentElement.style.setProperty('--theme-primary', t.primaryColor);
      if (t.secondaryColor) document.documentElement.style.setProperty('--theme-secondary', t.secondaryColor);
    } catch(e) {}
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
