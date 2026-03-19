
import type { Metadata } from "next";

import React, { useState } from 'react'
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

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with Mydigisence",
  description: "Contact Mydigisence team for support, inquiries, or partnership opportunities. We're here to help you build your digital presence. Reach out today!",
  keywords: ['contact mydigisence', 'customer support', 'business inquiry', 'partnership', 'get in touch', 'contact us India', 'digital platform support'],
  openGraph: {
    title: 'Contact Us - Mydigisence',
    description: 'Get in touch with the Mydigisence team for support and inquiries.',
    url: 'https://mydigisence.com/contact',
    siteName: 'Mydigisence',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Mydigisence',
    description: 'Get in touch with the Mydigisence team for support and inquiries.',
  },
  alternates: {
    canonical: 'https://mydigisence.com/contact',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formState, setFormState] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormState('idle')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // @ts-ignore - TypeScript incorrectly thinks this is void
        setFormState('success')
        // Reset form
        (e.target as HTMLFormElement).reset()
      } else {
        setFormState('error')
        setErrorMsg(result.error || 'Failed to send message')
      }
    } catch {
      setFormState('error')
      setErrorMsg('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                          name="firstName"
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
                          name="lastName"
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
                        name="email"
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
                        name="subject"
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
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        className="mt-1 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>

                    {formState === 'success' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Your message has been sent successfully!
                      </div>
                    )}

                    {formState === 'error' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {errorMsg}
                      </div>
                    )}
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
