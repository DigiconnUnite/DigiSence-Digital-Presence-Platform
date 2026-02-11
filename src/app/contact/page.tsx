"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import Aurora from "@/components/Aurora";
import UnifiedPublicLayout from "@/components/UnifiedPublicLayout";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    description: "Mon-Fri from 9am to 6pm",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@digisence.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "123 Business Avenue",
    description: "New York, NY 10001",
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: "Mon - Fri: 9AM - 6PM",
    description: "Sat: 10AM - 4PM",
  },
];

const faqs = [
  {
    question: "How quickly can I get started with DigiSence?",
    answer:
      "You can create your account and start building your digital presence in just a few minutes. Our onboarding process is designed to be quick and intuitive.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time from your account settings. There are no long-term contracts or cancellation fees.",
  },
  {
    question: "Do you offer customer support?",
    answer:
      "Yes, our support team is available Mon-Fri during business hours. You can reach us via email, phone, or through the contact form on this page.",
  },
];

export default function ContactPage() {
  return (
    <UnifiedPublicLayout variant="solid" sidebarVariant="contact">
      <div className="relative">

        {/* Contact Content */}
        <div className="relative z-10 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Form and Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <Card className="border-0 p-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      Send us a Message
                    </h2>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </p>
                  </div>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium text-slate-700"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Shivam"
                          className="mt-1 border-gray-200 focus:border-slate-800 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium text-slate-700"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Thakur"
                          className="mt-1 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@mail.com"
                        className="mt-1 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="subject"
                        className="text-sm font-medium text-slate-700"
                      >
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="How can we help you?"
                        className="mt-1 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="message"
                        className="text-sm font-medium text-slate-700"
                      >
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        className="mt-1 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info Sidebar */}
              <Card className="lg:pl-8 bg-transparent  p-0 h-full"> 
                {/* Contact SVG */}
                <div className=" rounded-lg overflow-hidden h-full">
                  <img
                    src="/contact.svg"
                    alt="Contact Illustration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
              
            </div>
          </div>
        </div>
      </div>
    </UnifiedPublicLayout>
  );
}
