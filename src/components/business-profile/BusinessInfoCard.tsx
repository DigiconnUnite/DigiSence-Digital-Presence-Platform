"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CardDownloadButton from "@/components/ui/CardDownloadButton";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  Download,
  Building2,
  User,
  Image,
} from "lucide-react";
import { SiWhatsapp, SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";

interface BusinessInfoCardProps {
  business: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    linkedin: string | null;
    catalogPdf: string | null;
    category?: { name: string } | null;
    admin?: { name?: string | null; email: string };
  };
}

export default function BusinessInfoCard({ business }: BusinessInfoCardProps) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-3 lg:gap-4 w-full">
      <Card className="relative  border border-orange-500 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 lg:p-4 flex flex-col items-center text-center w-full overflow-hidden">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="shrink-0 flex items-center justify-center">
            {business.logo && business.logo.trim() !== "" ? (
              <img
                src={getOptimizedImageUrl(business.logo)}
                alt={business.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                <Image className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 w-full min-w-0 text-center">
            <h3 className="font-extrabold text-lg text-gray-800 line-clamp-2 leading-tight">
              {business.name || "Business Name"}
            </h3>
            {business.category && (
              <span className="inline-flex items-center justify-center text-xs px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-medium w-fit mx-auto">
                <Building2 className="w-3 h-3 mr-1 text-orange-700" />
                {business.category.name}
              </span>
            )}
            {business.description && (
              <p className="text-xs text-gray-600 line-clamp-4">
                {business.description}
              </p>
            )}
            {business.admin?.name && (
              <span className="flex items-center justify-center text-xs flex-1 rounded-full py-1 px-3 bg-slate-900 text-gray-200 border border-gray-200 font-semibold w-fit mx-auto">
                <User className="w-3 h-3 mr-1 text-gray-100" />
                {business.admin.name}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons - Call, WhatsApp, Email */}
      <div className="flex flex-row gap-2 w-full">
        {/* Call Button */}
        {business.phone && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
            onClick={() => {
              window.location.href = `tel:${business.phone}`;
            }}
            title="Call this number"
          >
            <Phone className="h-3 w-3" />
            Call
          </Button>
        )}
        {business.phone && (
          <Button
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors text-xs font-medium shadow-sm border-0 cursor-pointer"
            style={{ backgroundColor: "#25D366" }}
            onClick={() => {
              const phoneNum = business.phone!.replace(/[^\d]/g, "");
              const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(`Hi, I'm interested in ${business.name}${business.category?.name ? ` (${business.category.name})` : ""}`)}`;
              window.open(waUrl, "_blank");
            }}
            title="Contact via WhatsApp"
          >
            <SiWhatsapp className="h-3 w-3" />
            WhatsApp
          </Button>
        )}
        {business.email && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
            onClick={() => {
              window.location.href = `mailto:${business.email}?subject=Inquiry about ${encodeURIComponent(business.name || "")}`;
            }}
            title="Send email"
          >
            <Mail className="h-3 w-3" />
            Email
          </Button>
        )}
      </div>

      {/* Secondary Action Buttons - Download Row */}
      <div className="flex flex-row gap-2 w-full">
        {/* Download Card Button */}
        <CardDownloadButton
          data={{
            name: business.name,
            category: business.category,
            description: business.description,
            address: business.address,
            phone: business.phone,
            email: business.email,
            website: business.website,
            facebook: business.facebook,
            twitter: business.twitter,
            instagram: business.instagram,
            linkedin: business.linkedin,
            logo: business.logo,
          }}
          type="business"
          variant="outline"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
        >
          Download Card
        </CardDownloadButton>
        {/* Download Catalog PDF Button */}
        {business.catalogPdf && (
          <Button
            variant="default"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors text-xs font-medium shadow-sm cursor-pointer"
            onClick={() => {
              if (business.catalogPdf) {
                window.open(business.catalogPdf, "_blank");
              }
            }}
            title="Download catalog PDF"
          >
            <Download className="h-3 w-3" />
            Download Catalog
          </Button>
        )}
      </div>

      {/* Share Button - Third Row */}
      <div className="flex flex-row gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: business.name || "Business Profile",
                  text: business.description || `Check out ${business.name}`,
                  url: window.location.href,
                })
                .catch((err) => console.log("Error sharing:", err));
            } else {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  toast({
                    title: "Link Copied",
                    description: "Link copied to clipboard!",
                  });
                })
                .catch((err) => console.log("Error copying link:", err));
            }
          }}
          title="Share this business profile"
        >
          <Share2 className="h-3 w-3" />
          Share
        </Button>
      </div>

      {/* Contact Details Card */}
      <Card className="rounded-2xl shadow-md bg-slate-900 hover:shadow-md transition-shadow duration-300 px-3 py-3 flex flex-col items-stretch h-full w-full relative">
        <div className="flex flex-col gap-3 w-full items-center justify-between relative z-10">
          <div className="flex flex-col flex-1 min-w-0 space-y-2.5 w-full">
            {business.address && business.address.trim() !== "" && (
              <div className="flex items-start gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 mt-0.5 shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors" />
                </span>
                <span className="text-xs text-white hover:text-orange-300 font-semibold leading-snug wrap-break-word">
                  {business.address}
                </span>
              </div>
            )}
            {business.phone && business.phone.trim() !== "" && (
              <div className="flex items-center gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 shrink-0">
                  <Phone className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors shrink-0" />
                </span>
                <a
                  href={`tel:${business.phone}`}
                  className="text-xs text-white hover:text-orange-300 hover:underline font-semibold break-all"
                  title="Call this number"
                >
                  {business.phone}
                </a>
              </div>
            )}
            {business.email && business.email.trim() !== "" && (
              <div className="flex items-center gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 shrink-0">
                  <Mail className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors shrink-0" />
                </span>
                <a
                  href={`mailto:${business.email}`}
                  className="text-xs text-white hover:text-orange-300 hover:underline font-semibold break-all"
                  title="Send email"
                >
                  {business.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {(business.facebook ||
          business.twitter ||
          business.instagram ||
          business.linkedin ||
          business.website) && (
          <div className="w-full border-t pt-4 border-gray-200/80 mt-1 relative z-10">
            <div className="flex flex-wrap gap-2 w-full justify-center items-center">
              {business.website && (
                <a
                  href={
                    business.website.startsWith("http")
                      ? business.website
                      : `https://${business.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                  aria-label="Website"
                >
                  <Globe className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                </a>
              )}
              {business.facebook && (
                <a
                  href={
                    business.facebook.startsWith("http")
                      ? business.facebook
                      : `https://${business.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                </a>
              )}
              {business.twitter && (
                <a
                  href={
                    business.twitter.startsWith("http")
                      ? business.twitter
                      : `https://${business.twitter}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                  aria-label="Twitter"
                >
                  <SiX className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                </a>
              )}
              {business.instagram && (
                <a
                  href={
                    business.instagram.startsWith("http")
                      ? business.instagram
                      : `https://${business.instagram}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors group"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-4 w-4 text-pink-600 group-hover:text-pink-800" />
                </a>
              )}
              {business.linkedin && (
                <a
                  href={
                    business.linkedin.startsWith("http")
                      ? business.linkedin
                      : `https://${business.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
