"use client";
import { Button } from "@/components/ui/button";
import { Star, Users, Shield, Zap } from "lucide-react";
import PricingSection from "@/components/sections/pricing/PricingSection";
import Footer from "@/components/Footer";
import UnifiedPublicLayout from "@/components/UnifiedPublicLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Choose Your DigiSence Plan",
  description: "View DigiSence pricing plans for businesses and professionals. Choose the perfect plan to build your digital presence. Flexible pricing with no hidden fees.",
  keywords: ['pricing', 'plans', 'subscription', 'pricing plans', 'business pricing', 'professional pricing', 'digital presence pricing', 'India pricing'],
  openGraph: {
    title: 'Pricing - DigiSence Plans',
    description: 'View DigiSence pricing plans. Choose the perfect plan to build your digital presence.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingPage() {
  const pricingCategories = [
    { name: 'Basic Plan', icon: Star },
    { name: 'Professional Plan', icon: Users },
    { name: 'Business Plan', icon: Shield },
    { name: 'Enterprise Plan', icon: Zap },
    { name: 'Custom Plan', icon: Zap }
  ];

  return (
    <UnifiedPublicLayout 
      variant="solid" 
      sidebarVariant="pricing"
      categories={pricingCategories}
    >
      <div className="secondary-light-gradient">
        <PricingSection />
      </div>
    </UnifiedPublicLayout>
  );
}
