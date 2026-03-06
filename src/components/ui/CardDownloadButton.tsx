"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CardData {
  // Common fields
  name: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  logo?: string | null;  // URL to logo/profile image
  
  // Professional specific
  professionalHeadline?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  
  // Business specific
  category?: { name: string } | null;
  description?: string | null;
  address?: string | null;
}

interface CardDownloadButtonProps {
  data: CardData;
  type: "business" | "professional";
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function CardDownloadButton({
  data,
  type,
  variant = "outline",
  size = "sm",
  className,
  children,
}: CardDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const endpoint = type === "professional" 
        ? "/api/professionals/card" 
        : "/api/businesses/card";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          [type]: {
            name: data.name,
            professionalHeadline: data.professionalHeadline || data.category?.name || null,
            location: data.location || data.address || null,
            phone: data.phone,
            email: data.email,
            website: data.website,
            facebook: data.facebook,
            twitter: data.twitter,
            instagram: data.instagram,
            linkedin: data.linkedin,
            logo: data.logo, // Pass logo to API
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate card");
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: "image/png" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.name.replace(/\s+/g, "_")}_Visiting_Card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Visiting card downloaded successfully!");
    } catch (error) {
      console.error("Error downloading card:", error);
      toast.error("Failed to download visiting card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isLoading}
      title="Download visiting card"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Download className="h-3 w-3" />
      )}
      {children || "Download Card"}
    </Button>
  );
}

export default CardDownloadButton;
