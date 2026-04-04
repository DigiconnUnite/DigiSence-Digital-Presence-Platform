"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Shield, Sparkles } from "lucide-react";
import type { SettingsTabId } from "../config/searchIndex";

interface SettingsViewProps {
  searchTerm: string;
  activeTab: SettingsTabId;
  targetSection: string | null;
  onTabChange: (tab: SettingsTabId) => void;
  onSectionHandled: () => void;
}

const settingsTabs: Array<{
  id: SettingsTabId;
  title: string;
  icon: React.ReactNode;
  keywords: string[];
}> = [
  {
    id: "general",
    title: "General",
    icon: <Sparkles className="h-4 w-4" />,
    keywords: ["platform", "name", "email", "admin", "general", "brand"],
  },
  {
    id: "security",
    title: "Security",
    icon: <Shield className="h-4 w-4" />,
    keywords: ["security", "password", "session", "2fa", "lock"],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    keywords: ["notification", "alert", "email", "push", "bell"],
  },
];

function highlightText(text: string, searchTerm: string) {
  const trimmedSearch = searchTerm.trim();
  if (!trimmedSearch) {
    return text;
  }

  const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedSearch})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === trimmedSearch.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-amber-200 px-1 text-gray-900">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function SettingsView({
  searchTerm,
  activeTab,
  targetSection,
  onTabChange,
  onSectionHandled,
}: SettingsViewProps) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchingTabs = useMemo(() => {
    if (!normalizedSearch) {
      return settingsTabs;
    }

    return settingsTabs.filter((tab) => {
      const haystack = `${tab.title} ${tab.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (matchingTabs.length > 0 && !matchingTabs.some((tab) => tab.id === activeTab)) {
      onTabChange(matchingTabs[0].id);
    }
  }, [activeTab, matchingTabs, onTabChange]);

  useEffect(() => {
    if (!targetSection) return;

    const section = document.getElementById(targetSection);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedSectionId(targetSection);
      const timeout = window.setTimeout(() => {
        setHighlightedSectionId(null);
      }, 1800);
      onSectionHandled();
      return () => {
        window.clearTimeout(timeout);
      };
    }

    onSectionHandled();
  }, [onSectionHandled, targetSection]);

  const visibleTabs = matchingTabs.length > 0 ? matchingTabs : settingsTabs;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-900">System Settings</h1>
        <p className="text-md text-gray-600">
          {normalizedSearch
            ? `Showing matching settings tabs for "${searchTerm}"`
            : "Configure system preferences"}
        </p>
      </div>

      {normalizedSearch && (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Matching tabs: {matchingTabs.length > 0 ? matchingTabs.map((tab) => tab.title).join(", ") : "No direct tab match, showing all settings tabs"}
        </div>
      )}

      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as SettingsTabId)} className="gap-6">
          <TabsList className="h-auto w-full flex flex-wrap gap-2 bg-gray-100 p-2 rounded-2xl">
            {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="h-10 rounded-xl px-4 data-[state=active]:bg-[#080322] data-[state=active]:text-white">
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {highlightText(tab.title, searchTerm)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <div className="space-y-4 max-w-2xl">
              <div
                id="settings-general-platform-name"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-general-platform-name" ? "bg-amber-50" : ""}`}
              >
                <Label>Platform Name</Label>
                <div className="relative">
                  <Input defaultValue="DigiSense" className="rounded-2xl pl-4" />
                </div>
              </div>
              <div
                id="settings-general-admin-email"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-general-admin-email" ? "bg-amber-50" : ""}`}
              >
                <Label>Admin Email</Label>
                <Input defaultValue="admin@digisence.com" className="rounded-2xl" />
              </div>
              <div
                id="settings-general-brand-accent"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-general-brand-accent" ? "bg-amber-50" : ""}`}
              >
                <Label>Brand Accent</Label>
                <Input defaultValue="#080322" className="rounded-2xl" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <div className="space-y-4 max-w-2xl">
              <div
                id="settings-security-policy"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-security-policy" ? "bg-amber-50" : ""}`}
              >
                <Label>Security Policy</Label>
                <Input defaultValue="Strong passwords required" className="rounded-2xl" />
              </div>
              <div
                id="settings-security-session-timeout"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-security-session-timeout" ? "bg-amber-50" : ""}`}
              >
                <Label>Session Timeout</Label>
                <Input defaultValue="30 minutes" className="rounded-2xl" />
              </div>
              <div
                id="settings-security-two-factor"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-security-two-factor" ? "bg-amber-50" : ""}`}
              >
                <Label>Two Factor Authentication</Label>
                <Input defaultValue="Enabled for all admins" className="rounded-2xl" />
              </div>
              <div className="flex gap-3">
                <Button className="rounded-2xl">Update Security</Button>
                <Button variant="outline" className="rounded-2xl">Reset Password Rules</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <div className="space-y-4 max-w-2xl">
              <div
                id="settings-notification-email-alerts"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-notification-email-alerts" ? "bg-amber-50" : ""}`}
              >
                <Label>Email Alerts</Label>
                <Input defaultValue="Enabled for approvals and errors" className="rounded-2xl" />
              </div>
              <div
                id="settings-notification-push"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-notification-push" ? "bg-amber-50" : ""}`}
              >
                <Label>Push Notifications</Label>
                <Input defaultValue="Enabled on admin devices" className="rounded-2xl" />
              </div>
              <div
                id="settings-notification-digest"
                className={`space-y-2 rounded-xl p-2 transition-colors ${highlightedSectionId === "settings-notification-digest" ? "bg-amber-50" : ""}`}
              >
                <Label>Digest Frequency</Label>
                <Input defaultValue="Daily summary at 8:00 AM" className="rounded-2xl" />
              </div>
              <div className="flex gap-3">
                <Button className="rounded-2xl">Save Notifications</Button>
                <Button variant="outline" className="rounded-2xl">Test Alert</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
