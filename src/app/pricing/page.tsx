"use client";
import { Button } from "@/components/ui/button";
import { Star, Users, Shield, Zap } from "lucide-react";
import PricingSection from "@/components/sections/pricing/PricingSection";
import Footer from "@/components/Footer";
import UnifiedPublicLayout from "@/components/UnifiedPublicLayout";

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
      <Footer />
    </UnifiedPublicLayout>
  );
}
