"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface Professional {
  id: string;
  name: string;
  slug: string;
  professionName: string | null;
  professionalHeadline: string | null;
  aboutMe: string | null;
  profilePicture: string | null;
  banner: string | null;
  resume: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
}

interface ContactTabProps {
  professional: Professional;
  themeSettings: any;
}

const ContactTab: React.FC<ContactTabProps> = ({
  professional,
  themeSettings,
}) => {
  return (
    <div className="space-y-6">
      <Card
        className={`${themeSettings.cardClass} ${themeSettings.borderRadius} overflow-hidden hover:shadow-xl transition-shadow duration-300`}
      >
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm text-gray-900">
                    {professional.email || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-sm text-gray-900">
                    {professional.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm text-gray-900">
                    {professional.location || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Globe className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Website
                  </p>
                  <p className="text-sm text-gray-900">
                    {professional.website ? (
                      <a
                        href={professional.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {professional.website}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Right Column - Social Media Links */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">
                Social Media Links
              </Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Facebook className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Facebook
                    </p>
                    <p className="text-sm text-gray-900">
                      {professional.facebook ? (
                        <a
                          href={professional.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Twitter className="h-5 w-5 text-sky-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Twitter
                    </p>
                    <p className="text-sm text-gray-900">
                      {professional.twitter ? (
                        <a
                          href={professional.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Instagram className="h-5 w-5 text-pink-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Instagram
                    </p>
                    <p className="text-sm text-gray-900">
                      {professional.instagram ? (
                        <a
                          href={professional.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Linkedin className="h-5 w-5 text-blue-700 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      LinkedIn
                    </p>
                    <p className="text-sm text-gray-900">
                      {professional.linkedin ? (
                        <a
                          href={professional.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          Connected
                        </a>
                      ) : (
                        "Not connected"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactTab;