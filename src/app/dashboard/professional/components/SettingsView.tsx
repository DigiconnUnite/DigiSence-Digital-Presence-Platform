"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsViewProps {
  user: any;
  themeSettings: any;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  themeSettings,
}) => {
  return (
    <div className={`space-y-6 pb-20 md:pb-0 animate-fadeIn ${themeSettings.gap}`}>
      <div className="mb-8">
        <h1 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
          Account Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage your account preferences and security.
        </p>
      </div>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={user?.name || ""}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={user?.role || ""}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : ""
                }
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Login Credentials</CardTitle>
          <CardDescription>Manage your login information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Email</Label>
            <Input
              value={user?.email || ""}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      <Card className={`${themeSettings.cardClass} ${themeSettings.borderRadius}`}>
        <CardHeader>
          <CardTitle>Plans Information</CardTitle>
          <CardDescription>
            Your current subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">Free Plan</div>
          <p className="text-sm text-gray-500">
            Upgrade to access more features
          </p>
          <Button className={`mt-4 ${themeSettings.buttonStyle}`}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;