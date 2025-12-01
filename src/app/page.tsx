"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import HeroSectionOne from "@/components/ui/hero";
import MarqueeSection from "@/components/ui/marquee";
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

export default function HomePage() {
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
      <div className="relative">
          <Navbar >
              {/* Desktop Navigation */}
              <NavBody>
                  <Link
                      href="/"
                      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
                  >
                      <img src="/logo-digisence.svg" alt="DigiSence" className="h-8 w-auto" />
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
                          <img src="/logo-digisence.svg" alt="DigiSence" className="h-10 w-auto" />
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
              <HeroSectionOne />
              <MarqueeSection />
              {/* Features Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
                  <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-16">
                          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                              Why Choose DigiSence?
                          </h2>
                          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                              Powerful features designed to help businesses thrive in the digital landscape.
                          </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                      <Users className="h-6 w-6 text-primary" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-primary mb-2">Customer Engagement</h3>
                                  <p className="text-muted-foreground">
                                      Connect directly with your customers through inquiries and feedback systems.
                                  </p>
                              </CardContent>
                          </Card>
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                      <Shield className="h-6 w-6 text-primary" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-primary mb-2">Secure & Reliable</h3>
                                  <p className="text-muted-foreground">
                                      Enterprise-grade security ensures your business data is always protected.
                                  </p>
                              </CardContent>
                          </Card>
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                      <Zap className="h-6 w-6 text-primary" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-primary mb-2">Fast & Easy Setup</h3>
                                  <p className="text-muted-foreground">
                                      Get your professional digital profile up and running in minutes.
                                  </p>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              </section>




              {/* First New Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                          <div className="order-2 lg:order-1">
                              <img src="/placeholder.png" alt="Discover Businesses" className="w-full h-auto rounded-lg shadow-lg" />
                          </div>
                          <div className="order-1 lg:order-2">
                              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Discover Amazing Businesses</h2>
                              <p className="text-lg text-muted-foreground mb-6">Explore our curated catalog of local businesses and find exactly what you're looking for.</p>
                              <Link href="/businesses">
                                  <Button size="lg" className="rounded-full">Explore Now <ArrowRight className="ml-2 h-5 w-5" /></Button>
                              </Link>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Second New Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/20">
                  <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                          <div>
                              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Manage Your Business Profile</h2>
                              <p className="text-lg text-muted-foreground mb-6">Create and manage your professional business profile with ease. Showcase your products and connect with customers.</p>
                              <Link href="/dashboard/admin">
                                  <Button size="lg" className="rounded-full">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Button>
                              </Link>
                          </div>
                          <div>
                              <img src="/card-bg.jpg" alt="Manage Profile" className="w-full h-auto rounded-lg shadow-lg" />
                          </div>
                      </div>
                  </div>
              </section>



              {/* CTA Section */}
              <section className="py-20 max-w-7xl w-full px-4 sm:px-6 bg-transparent flex justify-center items-center">
                  <div className="max-w-full w-full mx-auto">
                      <div className="rounded-3xl border border-cyan/90  bg-linear-30 from-cyan-950  via-55%  via-slate-950 to-cyan-900 shadow-lg p-12 px-6 sm:px-12 text-center backdrop-blur-lg">
                          <h2 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-md text-white">
                              Ready to Transform Your Business?
                          </h2>
                          <p className="text-lg sm:text-xl mb-8 opacity-95 text-gray-200">
                              Join <span className="font-semibold text-cyan-400">DigiSence</span> today and create your professional digital presence.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                              <Link href="/dashboard/admin">
                                  <Button
                                      size="lg"
                                      variant="secondary"
                                      className="rounded-full bg-cyan-400 text-slate-900 border-2 border-cyan-400 hover:bg-cyan-300 hover:border-cyan-300 transition-all duration-200 px-8 shadow-lg font-semibold"
                                  >
                                      Start Free Trial
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                  </Button>
                              </Link>
                              <Link href="/businesses">
                                  <Button
                                      size="lg"
                                      variant="outline"
                                      className="rounded-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 shadow-md transition-all duration-200 font-semibold"
                                  >
                                      Contact Sales
                                  </Button>
                              </Link>
                          </div>
                          <div className="flex flex-wrap justify-center gap-5 text-sm opacity-90">
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  No setup fees
                              </div>
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  Your Online Presence
                              </div>
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  Easy to use
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
          </AuroraBackground>
          <Footer />
      </div>
  );
}