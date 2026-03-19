'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface ThemeViewProps {
  themeSettings: any
  updateTheme: (updates: any) => void
  resetTheme: () => void
  saveTheme: () => void  // FIXED: now required, was missing
}

/**
 * FIXED: Save button previously had: onClick={() => { /* Save theme functionality would go here *\/ }}
 * Now calls saveTheme() from ThemeContext which persists to localStorage.
 */
const ThemeView: React.FC<ThemeViewProps> = ({ themeSettings, updateTheme, resetTheme, saveTheme }) => {
  const { toast } = useToast()

  const handleSave = () => {
    saveTheme()
    toast({ title: 'Theme saved', description: 'Your theme preferences have been saved.' })
  }

  const handleReset = () => {
    resetTheme()
    toast({ title: 'Theme reset', description: 'Theme restored to defaults.' })
  }

  return (
    <div className={`space-y-6 pb-20 md:pb-0 animate-fadeIn ${themeSettings.gap}`}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Theme Customization</h1>
        <p className="text-gray-600">Customize the appearance of your dashboard and public profile.</p>
      </div>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Color Combination</CardTitle>
          <CardDescription>Choose your primary and secondary colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={themeSettings.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <Input
                type="color"
                value={themeSettings.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Border Radius &amp; Spacing</CardTitle>
          <CardDescription>Adjust border radius and spacing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Select value={themeSettings.borderRadius} onValueChange={(v) => updateTheme({ borderRadius: v })}>
                <SelectTrigger className={themeSettings.borderRadius}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded-none">None</SelectItem>
                  <SelectItem value="rounded-lg">Small</SelectItem>
                  <SelectItem value="rounded-xl">Medium</SelectItem>
                  <SelectItem value="rounded-3xl">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gap</Label>
              <Select value={themeSettings.gap} onValueChange={(v) => updateTheme({ gap: v })}>
                <SelectTrigger className={themeSettings.borderRadius}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gap-2">Tight</SelectItem>
                  <SelectItem value="gap-4">Normal</SelectItem>
                  <SelectItem value="gap-6">Relaxed</SelectItem>
                  <SelectItem value="gap-8">Loose</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Background Theme</CardTitle>
          <CardDescription>Select your preferred background theme</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={themeSettings.backgroundTheme} onValueChange={(v) => updateTheme({ backgroundTheme: v as any })}>
            <SelectTrigger className={themeSettings.borderRadius}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Customize font styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={themeSettings.fontFamily} onValueChange={(v) => updateTheme({ fontFamily: v })}>
                <SelectTrigger className={themeSettings.borderRadius}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="font-sans">Sans Serif</SelectItem>
                  <SelectItem value="font-serif">Serif</SelectItem>
                  <SelectItem value="font-mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={themeSettings.fontSize} onValueChange={(v) => updateTheme({ fontSize: v })}>
                <SelectTrigger className={themeSettings.borderRadius}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-sm">Small</SelectItem>
                  <SelectItem value="text-base">Medium</SelectItem>
                  <SelectItem value="text-lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FIXED: Save button now calls handleSave() → saveTheme() → localStorage.setItem() */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className={`flex-1 ${themeSettings.buttonStyle}`}>
          Save Theme
        </Button>
        <Button variant="outline" onClick={handleReset} className={`flex-1 ${themeSettings.borderRadius}`}>
          Reset to Default
        </Button>
      </div>
    </div>
  )
}

export default ThemeView
