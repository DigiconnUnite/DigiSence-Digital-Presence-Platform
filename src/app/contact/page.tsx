"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import Footer from "@/components/Footer";
import Aurora from "@/components/Aurora";
import UnifiedPublicLayout from "@/components/UnifiedPublicLayout";

export default function ContactPage() {
  return (
    <UnifiedPublicLayout variant="solid" sidebarVariant="contact">
      <div className="secondary-light-gradient relative">
   

        {/* Contact Content - with padding to account for fixed header */}
        <div className="relative z-10 pt-32">
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <Card className="border-0 shadow-lg bg-transparent backdrop-blur-md">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <MessageSquare className="h-6 w-6 text-primary mr-3" />
                      <h3 className="text-2xl font-bold text-primary">
                        Send us a Message
                      </h3>
                    </div>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-medium text-primary"
                          >
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="shivam"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-medium text-primary"
                          >
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="thakur"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-primary"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="shivam.thakur@example.com"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="subject"
                          className="text-sm font-medium text-primary"
                        >
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder="How can we help you?"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="message"
                          className="text-sm font-medium text-primary"
                        >
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          className="mt-1"
                        />
                      </div>

                      <Button type="submit" className="w-full rounded-full">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Contact SVG */}
                <div className="flex items-center justify-center">
                  <img
                    src="/contact.svg"
                    alt="Contact Illustration"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </UnifiedPublicLayout>
  );
}
