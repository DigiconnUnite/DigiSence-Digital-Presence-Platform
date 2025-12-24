"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Menu, X } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ContactPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Navigation Bar - Fixed at Top */}
            <nav className="fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
                            >
                                <img src="/logo.svg" alt="DigiSence" className="h-7 w-auto" />

                                <span className="font-bold text-xl text-primary">DigiSence</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex space-x-8 flex-1 justify-center">
                            <Link href="/" className={cn("hover:text-cyan-400 transition-colors px-2 py-1 rounded-md", pathname === "/" ? "bg-white text-slate-800 font-bold" : "text-gray-700")}>
                                Home
                            </Link>
                            <Link href="/businesses" className={cn("hover:text-cyan-400 transition-colors px-2 py-1 rounded-md", pathname === "/businesses" ? "bg-white text-slate-800 font-bold" : "text-gray-700")}>
                                Businesses
                            </Link>
                            <Link href="/professionals" className={cn("hover:text-cyan-400 transition-colors px-2 py-1 rounded-md", pathname === "/professionals" ? "bg-white text-slate-800 font-bold" : "text-gray-700")}>
                                Professionals
                            </Link>
                            <Link href="/pricing" className={cn("hover:text-cyan-400 transition-colors px-2 py-1 rounded-md", pathname === "/pricing" ? "bg-white text-slate-800 font-bold" : "text-gray-700")}>
                                Pricing
                            </Link>
                            <Link href="/contact" className={cn("hover:text-cyan-400 transition-colors px-2 py-1 rounded-md", pathname === "/contact" ? "bg-white text-slate-800 font-bold" : "text-gray-700")}>
                                Contact Us
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" className="bg-cyan-600 text-white hover:bg-cyan-500 border-gray-800" asChild>
                                <Link href="/register">Make Your Profile</Link>
                            </Button>
                            <Button variant="outline" className="bg-white text-gray-900 hover:bg-gray-700 border-gray-800" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            {/* Mobile menu button */}
                            <button
                                className="md:hidden ml-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-2">
                        <div className="px-4 sm:px-6 lg:px-8 space-y-1">
                            <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Home
                            </Link>
                            <Link href="/businesses" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Businesses
                            </Link>
                            <Link href="/professionals" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Professionals
                            </Link>
                            <Link href="/pricing" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Pricing
                            </Link>
                            <Link href="/contact" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Contact Us
                            </Link>
                            <Link href="/register" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Make Your Profile
                            </Link>
                            <Link href="/login" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                                Login
                            </Link>
                        </div>
                    </div>
                )}
            </nav>


                {/* Header Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
                            Contact Us
                        </h1>
                        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                            Have questions about DigiSence? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
                        </p>
                    </div>
                </section>

                {/* Contact Information Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div>
                                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center mb-6">
                                            <MessageSquare className="h-6 w-6 text-primary mr-3" />
                                            <h3 className="text-2xl font-bold text-primary">Send us a Message</h3>
                                        </div>
                                        <form className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="firstName" className="text-sm font-medium text-primary">
                                                        First Name
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        type="text"
                                                        placeholder="John"
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lastName" className="text-sm font-medium text-primary">
                                                        Last Name
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        type="text"
                                                        placeholder="Doe"
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="email" className="text-sm font-medium text-primary">
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john.doe@example.com"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="subject" className="text-sm font-medium text-primary">
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
                                                <Label htmlFor="message" className="text-sm font-medium text-primary">
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
                            </div>
                        </div>
                    </div>
            </section>
            <Footer />
        </>
    );
}