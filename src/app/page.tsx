"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import HeroSectionOne from "@/components/ui/hero-section-demo-1";
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

export default function HomePage() {
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
            name: "Dashboard",
            link: "/dashboard",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
      <>
          <Navbar>
              {/* Desktop Navigation */}
              <NavBody>
                  <a
                      href="/"
                      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
                  >
                      <span className="font-medium text-black dark:text-white">DigiSence</span>
                  </a>
                  <NavItems items={navItems} />
                  <div className="flex items-center gap-4">
                      <NavbarButton variant="secondary" as={Link} href="/login">Login</NavbarButton>
              </div>
              </NavBody>

              {/* Mobile Navigation */}
              <MobileNav>
                  <MobileNavHeader>
                      <a
                          href="/"
                          className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
                      >
                          <span className="font-medium text-black dark:text-white">DigiSence</span>
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
                      {navItems.map((item, idx) => (
                          <a
                              key={`mobile-link-${idx}`}
                              href={item.link}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="relative text-neutral-600 dark:text-neutral-300"
                          >
                              <span className="block">{item.name}</span>
                          </a>
                      ))}
                      <div className="flex w-full flex-col gap-4">
                          <NavbarButton
                              onClick={() => setIsMobileMenuOpen(false)}
                              variant="primary"
                              className="w-full"
                              as={Link}
                              href="/login"
                          >
                              Login
                          </NavbarButton>
                      </div>
                  </MobileNavMenu>
              </MobileNav>
          </Navbar>
          <AuroraBackground className="pt-24">
              <HeroSectionOne />
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




              {/* Testimonials Section */}
              <section className="py-20 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-16">
                          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                              What Our Users Say
                          </h2>
                          <p className="text-lg text-muted-foreground">
                              Join thousands of businesses already using DigiSence.
                          </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="flex items-center mb-4">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                      ))}
                                  </div>
                                  <p className="text-muted-foreground mb-4">
                                      "DigiSence transformed our online presence. We've seen a 40% increase in customer inquiries since switching to their platform."
                                  </p>
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-primary font-semibold">JD</span>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-primary">John Doe</p>
                                          <p className="text-sm text-muted-foreground">CEO, TechCorp</p>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="flex items-center mb-4">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                      ))}
                                  </div>
                                  <p className="text-muted-foreground mb-4">
                                      "The ease of use and professional look helped us stand out. Our customers love the seamless experience."
                                  </p>
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-primary font-semibold">SM</span>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-primary">Sarah Miller</p>
                                          <p className="text-sm text-muted-foreground">Marketing Director, RetailPlus</p>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                          <Card className="border-0 shadow-sm bg-white">
                              <CardContent className="p-6">
                                  <div className="flex items-center mb-4">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                      ))}
                                  </div>
                                  <p className="text-muted-foreground mb-4">
                                      "Reliable platform with excellent support. It's been a game-changer for our small business growth."
                                  </p>
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                          <span className="text-primary font-semibold">MR</span>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-primary">Mike Rodriguez</p>
                                          <p className="text-sm text-muted-foreground">Owner, Local Services</p>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      </div>
        </div>
      </section>

              {/* CTA Section */}
              <section className="py-20 max-w-7xl w-full px-4 sm:px-6 bg-transparent flex justify-center items-center">
                  <div className="max-w-full w-full mx-auto">
                      <div className="rounded-3xl border border-white/30 bg-slate-900/95 bg-linear-30 from-cyan-950  via-55%  via-slate-950 to-cyan-900 shadow-lg p-12 px-6 sm:px-12 text-center backdrop-blur-lg">
                          <h2 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-md text-white">
                              Ready to Transform Your Business?
                          </h2>
                          <p className="text-lg sm:text-xl mb-8 opacity-95 text-gray-200">
                              Join <span className="font-semibold text-cyan-400">DigiSence</span> today and create your professional digital presence.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                              <Button
                                  size="lg"
                                  variant="secondary"
                                  className="rounded-full bg-cyan-400 text-slate-900 border-2 border-cyan-400 hover:bg-cyan-300 hover:border-cyan-300 transition-all duration-200 px-8 shadow-lg font-semibold"
                              >
                                  Start Free Trial
                                  <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                              <Button
                                  size="lg"
                                  variant="outline"
                                  className="rounded-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 shadow-md transition-all duration-200 font-semibold"
                              >
                                  Contact Sales
                              </Button>
                          </div>
                          <div className="flex flex-wrap justify-center gap-5 text-sm opacity-90">
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  No setup fees
                              </div>
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  30-day free trial
                              </div>
                              <div className="flex items-center bg-slate-800/70 rounded-full px-4 py-2 border border-cyan-400/30 shadow-sm mb-2 mx-1 text-gray-200">
                                  <CheckCircle className="h-4 w-4 mr-2 text-cyan-400" />
                                  Cancel anytime
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
          </AuroraBackground>
          <Footer />
      </>
  );
}