"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle
} from "lucide-react";

export default function ContactPage() {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Businesses",
      link: "/business",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    contactName: "",
    email: "",
    phone: "",
    requirements: "",
    inquiryType: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/business-listing-inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Inquiry submitted successfully:', result);
        setIsSubmitted(true);
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            businessName: "",
            businessDescription: "",
            contactName: "",
            email: "",
            phone: "",
            requirements: "",
            inquiryType: ""
          });
          setIsSubmitted(false);
        }, 3000);
      } else {
        const error = await response.json();
        console.error('Submission failed:', error);
        alert('Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <a
            href="/"
            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
          </a>
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="dark" as={Link} href="/dashboard/admin">Login</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <a
              href="/"
              className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
            </a>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => {
              const isActive = pathname === item.link;
              return (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative text-neutral-600 dark:text-neutral-300",
                    isActive && "text-blue-600 dark:text-blue-400 font-semibold"
                  )}
                >
                  <span className="block">{item.name}</span>
                </a>
              );
            })}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="dark"
                className="w-full"
                as={Link}
                href="/dashboard/admin"
              >
                Login
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <AuroraBackground className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get Your Business Listed
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to showcase your business on DigiSence? Fill out the form below and our team will help you create a professional online presence.
              We'll review your application and get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-neutral-950/80">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Email Us
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Send us an email and we'll respond within 24 hours.
                          </p>
                          <a
                            href="mailto:support@digisence.com"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            support@digisence.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-neutral-950/80">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Call Us
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Speak directly with our support team.
                          </p>
                          <a
                            href="tel:+1-555-0123"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            +1 (555) 012-3456
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-neutral-950/80">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Visit Us
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Our office location.
                          </p>
                          <address className="text-primary not-italic">
                            123 Business Street<br />
                            Tech City, TC 12345<br />
                            United States
                          </address>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-neutral-950/80">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Business Hours
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            When you can reach us.
                          </p>
                          <div className="text-primary">
                            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                            <p>Saturday: 10:00 AM - 4:00 PM</p>
                            <p>Sunday: Closed</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-sm bg-white/80 dark:bg-neutral-950/80">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Business Listing Application
                  </h2>

                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Thank you for your inquiry!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        We'll review your business listing request and get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-gray-700 dark:text-gray-300">
                            Business Name *
                          </Label>
                          <Input
                            id="businessName"
                            name="businessName"
                            type="text"
                            required
                            value={formData.businessName}
                            onChange={handleInputChange}
                            className="rounded-lg"
                            placeholder="Your business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName" className="text-gray-700 dark:text-gray-300">
                            Contact Name *
                          </Label>
                          <Input
                            id="contactName"
                            name="contactName"
                            type="text"
                            required
                            value={formData.contactName}
                            onChange={handleInputChange}
                            className="rounded-lg"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="rounded-lg"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="rounded-lg"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessDescription" className="text-gray-700 dark:text-gray-300">
                          Business Description
                        </Label>
                        <Textarea
                          id="businessDescription"
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleInputChange}
                          className="rounded-lg min-h-[80px]"
                          placeholder="Brief description of your business..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryType" className="text-gray-700 dark:text-gray-300">
                          Inquiry Type
                        </Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_listing">New Business Listing</SelectItem>
                            <SelectItem value="update_listing">Update Existing Listing</SelectItem>
                            <SelectItem value="premium_features">Premium Features</SelectItem>
                            <SelectItem value="technical_support">Technical Support</SelectItem>
                            <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements" className="text-gray-700 dark:text-gray-300">
                          Requirements & Details *
                        </Label>
                        <Textarea
                          id="requirements"
                          name="requirements"
                          required
                          value={formData.requirements}
                          onChange={handleInputChange}
                          className="rounded-lg min-h-[120px]"
                          placeholder="Please describe your specific requirements, what services you're looking for, or any questions you have..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Business Inquiry
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Information */}
          <div className="text-center">
            <div className="bg-white/60 dark:bg-neutral-950/60 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                What Happens Next?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                After submitting your application, our team will review your business details and contact you within 24 hours.
                We'll guide you through the listing process and help you create an impressive online presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="rounded-lg">
                  View Sample Listings
                </Button>
                <Button variant="outline" className="rounded-lg">
                  Pricing Information
                </Button>
              </div>
            </div>
          </div>
        </div>
        


      </AuroraBackground>
      <Footer />
    </>
  );
}