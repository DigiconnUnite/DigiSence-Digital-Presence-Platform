"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsViewProps {
  stats: {
    totalInquiries: number;
    newInquiries: number;
    profileViews: number;
  };
  themeSettings: any;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  themeSettings,
}) => {
  return (
    <div className={`space-y-6 pb-20 md:pb-0 animate-fadeIn ${themeSettings.gap}`}>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Profile Analytics
        </h1>
        <p className="text-xl text-gray-600">
          Track your profile performance and engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
          <CardHeader>
            <CardTitle>Profile Views</CardTitle>
            <CardDescription>
              Number of times your profile has been viewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.profileViews}</div>
            <p className="text-sm text-gray-500">Analytics coming soon</p>
          </CardContent>
        </Card>

        <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
          <CardHeader>
            <CardTitle>Contact Requests</CardTitle>
            <CardDescription>
              Inquiries received through your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalInquiries}
            </div>
            <p className="text-sm text-gray-500">
              Total inquiries received
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsView;