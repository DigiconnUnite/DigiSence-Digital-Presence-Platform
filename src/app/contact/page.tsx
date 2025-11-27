"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";
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

export default function ContactPage() {
    const navItems = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Businesses",
            link: "/businesses",
        },
        {
            name: "Contact Us",
            link: "/contact",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <Link
                        href="/"
                        className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
                    >
                        <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
                    </Link>
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4">
                        <NavbarButton variant="dark" as={Link} href="/dashboard/admin">Login</NavbarButton>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <Link
                            href="/"
                            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
                        >
                            <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
                        </Link>
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
                                <Link
                                    key={`mobile-link-${idx}`}
                                    href={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "relative text-neutral-600 dark:text-neutral-300",
                                        isActive && "text-blue-600 dark:text-blue-400 font-semibold"
                                    )}
                                >
                                    <span className="block">{item.name}</span>
                                </Link>
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
                            {/* Contact Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-primary mb-8">Get In Touch</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-1">Email Us</h3>
                                            <p className="text-muted-foreground mb-2">Send us an email and we'll respond within 24 hours.</p>
                                            <a href="mailto:support@digisence.com" className="text-primary hover:underline">
                                                support@digisence.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-1">Call Us</h3>
                                            <p className="text-muted-foreground mb-2">Speak directly with our support team.</p>
                                            <a href="tel:+1-555-0123" className="text-primary hover:underline">
                                                +1 (555) 012-3456
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-1">Visit Us</h3>
                                            <p className="text-muted-foreground mb-2">Our headquarters location.</p>
                                            <address className="text-primary not-italic">
                                                123 Business Street<br />
                                                Tech City, TC 12345<br />
                                                United States
                                            </address>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary mb-1">Business Hours</h3>
                                            <p className="text-muted-foreground mb-2">When you can reach us.</p>
                                            <div className="text-primary">
                                                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                                <p>Saturday: 10:00 AM - 4:00 PM</p>
                                                <p>Sunday: Closed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
            </AuroraBackground>
            <Footer />
        </>
    );
}