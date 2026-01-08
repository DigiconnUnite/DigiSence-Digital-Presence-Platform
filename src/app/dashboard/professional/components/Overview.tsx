"use client";

import React from "react";
import { Eye } from "lucide-react";
import { StatCard, ActionCard } from "./ReusableComponents";

interface OverviewProps {
  professional: any;
  themeSettings: any;
}

export default function Overview({ professional, themeSettings }: OverviewProps) {
  return (
    <div
      className={`space-y-6 pb-20 md:pb-0 animate-fadeIn ${themeSettings.gap}`}
    >
      <div className="mb-8">
        <h1 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
          Professional Dashboard Overview
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Welcome back! Here's your professional profile overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Profile Views"
          value="0"
          subtitle="This month"
          icon={<Eye className="h-4 w-4 text-gray-400" />}
        />
        <StatCard
          title="Profile Status"
          value={professional?.isActive ? "Active" : "Inactive"}
          subtitle="Current status"
          icon={<div className="h-4 w-4 rounded-full bg-green-400" />}
        />
        <StatCard
          title="Profile URL"
          value={professional ? `/pcard/${professional.slug}` : "Not set"}
          subtitle="Your public profile"
          icon={<div className="h-4 w-4 rounded bg-blue-400" />}
          truncate
        />
        <StatCard
          title="Platform Health"
          value="Good"
          subtitle="System status"
          icon={<div className="h-4 w-4 rounded bg-gray-400" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="View My Profile"
          description="See how your professional profile appears to visitors"
          icon={<Eye className="h-5 w-5" />}
          buttonText="View Public Profile"
          buttonAction={() =>
            professional &&
            window.open(`/pcard/${professional.slug}`, "_blank")
          }
          disabled={!professional}
        />
        <ActionCard
          title="Edit Profile"
          description="Update your professional information and portfolio"
          icon={<div className="h-5 w-5 rounded bg-blue-500" />}
          buttonText="Edit Profile"
          buttonAction={() => {}}
          variant="outline"
        />
      </div>
    </div>
  );
}