"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle, Menu, X, Home, Building2, Users as UsersIcon, Calculator, Mail, Filter } from "lucide-react";
import Link from "next/link";
import HeroSectionOne from "@/components/ui/hero";
import MarqueeSection from "@/components/ui/marquee";
import Footer from "@/components/Footer";
import { Android } from "@/components/ui/android";
import PricingSection from "@/components/sections/pricing/PricingSection";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: Home
    },
    {
      name: "Businesses",
      link: "/businesses",
      icon: Building2
    },
    {
      name: "Professionals",
      link: "/professionals",
      icon: UsersIcon
    },
    {
      name: "Pricing",
      link: "/pricing",
      icon: Calculator
    },
    {
      name: "Contact Us",
      link: "/contact",
      icon: Mail
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isHome = pathname === "/";
  const navTransparent = isHome && !scrolled;

  // Categories for sidebar
  const homeCategories = [
    { name: 'Business Solutions', icon: Building2 },
    { name: 'Professional Services', icon: UsersIcon },
    { name: 'Pricing Plans', icon: Calculator },
    { name: 'Contact Support', icon: Mail },
    { name: 'Documentation', icon: Star }
  ];

  return (
    <div className="relative min-h-screen secondary-light-gradient pb-16 md:pb-0">
      {/* Sidebar - Hidden by default on all screens */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="DigiSence" className="h-7 w-auto" />
              <span className="font-bold text-xl text-slate-800">DigiSence</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.link}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                    pathname === item.link
                      ? "bg-slate-800 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}                        
                >
                  <IconComponent className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Categories Section in Sidebar */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center px-3 mb-3">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Links</span>
              </div>
              <div className="space-y-1">
                {homeCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.name}
                      href="#"
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200",
                        "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <IconComponent className="mr-3 h-4 w-4" />
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button
              variant="outline"
              className="w-full text-white bg-slate-800 border-gray-800 hover:bg-slate-700 transition-colors duration-200"
              asChild
            >
              <Link href="/register">Make Your Profile</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white text-gray-900 hover:bg-slate-800 hover:text-white border-gray-800 transition-colors duration-200"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Bar - Fixed at Top */}
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-30",
          navTransparent
            ? "bg-transparent"
            : "bg-white border-b border-gray-200 shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className={cn(
                  "relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal",
                  navTransparent ? "text-white" : "text-gray-900"
                )}
              >
                <img
                  src="/logo.svg"
                  alt="DigiSence"
                  className={cn(
                    "h-6 w-auto sm:h-7",
                    navTransparent ? " filter invert hue-rotate-180" : " "
                  )}
                />

                <span
                  className={cn(
                    "font-bold text-lg sm:text-xl",
                    navTransparent ? "text-white" : "text-slate-800"
                  )}
                >
                  DigiSence
                </span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-4 lg:space-x-8 flex-1 justify-center">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.link}
                    className={cn(
                      "hover:text-cyan-400 transition-all duration-200 px-2 py-1 rounded-md text-sm lg:text-base flex items-center space-x-1",
                      pathname === item.link
                        ? navTransparent
                          ? "bg-white/20 text-white font-bold"
                          : "bg-white text-slate-800 font-bold"
                        : navTransparent
                          ? "text-white"
                          : "text-gray-700"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex space-x-2 sm:space-x-4">
                <Button
                  variant="outline"
                  className={cn(
                    "text-white border-gray-800 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4",
                    navTransparent
                      ? "bg-slate-900/20 border-white/50 "
                      : "bg-slate-800 hover:bg-white hover:text-slate-800"
                  )}
                  asChild
                >
                  <Link href="/register">Make Your Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white text-gray-900 hover:bg-slate-800 hover:text-white border-gray-800 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>
              {/* Sidebar Toggle Button - Visible on all screens */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={cn(
                  "p-2 rounded-md hover:bg-gray-100 md:hidden",
                  navTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700"
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-4 sm:px-6 lg:px-8 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.link}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/register"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Make Your Profile
            </Link>
            <Link
              href="/login"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
          </div>
        </div>
      )}

      <div className="  mx-auto">
        <HeroSectionOne />

        {/* Who Is It For? Section */}
        <section className="py-10 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto ">
            <div className="text-center mb-8">
              <div className="flex items-center w-fit mx-auto rounded-full px-4 py-2 border border-slate-900 shadow-sm mb-2  text-slate-800">
                <CheckCircle className="h-4 w-4 mr-2 text-slate-900" />
                Who Is It For
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-20 text-slate-800">
              Discover Your Digital Presence
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className="aspect-square overflow-hidden relative bg-linear-30 from-cyan-950 via-55% via-slate-950 to-cyan-950 rounded-4xl shadow-lg p-8 flex flex-col justify-between items-center text-center bg-cover bg-center"
                style={{
                  backgroundImage: "url('square-bg.svg')",
                }}
              >
                {/* Top content area */}
                <div className="z-10 w-full pb-10 flex flex-col items-center justify-start pt-4">
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                    For Businesses
                  </h3>
                  <p className="text-md mb-6 text-gray-200 max-w-xs">
                    Boost your business online.
                  </p>
                  <Link href="/businesses">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full bg-white text-slate-900 border-2 border-cyan-400  hover:border-cyan-300 px-8 shadow-lg font-semibold"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <Android
                  src={"b-1.png"}
                  className="h-full scale-200 w-fit mx-5  object-cover pointer-events-none relative   -bottom-1/3"
                />
                <div className="absolute"></div>
              </div>
              <div
                className="aspect-square overflow-hidden relative bg-linear-30 from-cyan-950 via-55% via-slate-950 to-cyan-950 rounded-4xl shadow-lg p-8 flex flex-col justify-between items-center text-center bg-cover bg-center"
                style={{
                  backgroundImage: "url('square-bg.svg')",
                }}
              >
                {/* Top content area */}
                <div className="z-10 pb-10 w-full flex flex-col items-center justify-start pt-4">
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                    For Professionals
                  </h3>
                  <p className="text-md mb-6 text-gray-200 max-w-xs">
                    Grow your presence online.
                  </p>
                  <Link href="/professionals">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full bg-white text-slate-900 border-2 border-cyan-400  hover:border-cyan-300 px-8 shadow-lg font-semibold"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                <Android
                  src={"p-1.png"}
                  className="h-full scale-200 mx-auto object-cover pointer-events-none relative -bottom-1/3"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Businesses Section */}
        <section className="py-10 md:py-20 bg-[#F3FBFF]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="text-left flex flex-col h-full    mr-8">
                <h2 className="text-3xl md:text-6xl font-bold text-gray-600 mb-6">
                  How It Work here. <br /> For
                  <span className="  font-extrabold  italic text-slate-900 ">
                    {" "}
                    Businesses
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Explore the powerful tools and capabilities that DigiSence
                  offers to enhance your digital presence.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Register Your Business
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create your account and get started with DigiSence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Connect with Professionals
                      </h3>
                      <p className="text-sm text-gray-600">
                        Find and collaborate with experts in your field.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Secure Your Data
                      </h3>
                      <p className="text-sm text-gray-600">
                        Enjoy peace of mind with our secure platform.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Boost Your Visibility
                      </h3>
                      <p className="text-sm text-gray-600">
                        Increase your online presence and reach more customers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col overflow-hidden  h-full ">
                <div className="aspect-video mt-auto  relative bg-[#E5F6FF] rounded-4xl  p-8 flex flex-col justify-between items-end text-center bg-cover bg-center">
                  <Android
                    src={"b-1.png"}
                    className="absolute -bottom-1/3 shadow-lg  left-1/2 transform -translate-x-1/2 h-full w-[80%] scale-300 object-cover pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Businesses Professionals */}
        <section className="py-10 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="flex flex-col overflow-hidden  h-full ">
                <div className="aspect-video mt-auto  relative bg-[#E5F6FF] rounded-4xl  p-8 flex flex-col justify-between items-end text-center bg-cover bg-center">
                  <Android
                    src={"p-1.png"}
                    className="absolute -bottom-1/3 shadow-lg  left-1/2 transform -translate-x-1/2 h-full w-[80%] scale-300 object-cover pointer-events-none"
                  />
                </div>
              </div>
              <div className="text-left flex flex-col h-full    ml-8">
                <h2 className="text-3xl md:text-6xl font-bold text-gray-600 mb-6">
                  How It Work here. <br /> For
                  <span className="  font-extrabold  italic text-slate-900 ">
                    {" "}
                    Professionals
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Explore the powerful tools and capabilities that DigiSence
                  offers to enhance your digital presence.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Register You Professionals Presence
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create your account and get started with DigiSence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Connect with Professionals
                      </h3>
                      <p className="text-sm text-gray-600">
                        Find and collaborate with experts in your field.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Secure Your Data
                      </h3>
                      <p className="text-sm text-gray-600">
                        Enjoy peace of mind with our secure platform.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 bg-[#E5F6FF] rounded-[14px] px-[18px] py-3.5">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Boost Your Visibility
                      </h3>
                      <p className="text-sm text-gray-600">
                        Increase your online presence and reach more customers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />

        {/* CTA Section */}
        <section className="py-10 md:py-20 max-w-7x mx-autol w-full px-4 sm:px-6 bg-transparent flex justify-center items-center">
          <div className="max-w-7xl w-full mx-auto">
            <div className="rounded-3xl border border-cyan/90  bg-linear-30 from-cyan-900  via-55%  via-slate-950 to-cyan-800 shadow-lg p-12 px-6 sm:px-12 text-center backdrop-blur-lg">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-md text-white">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg sm:text-xl mb-8 opacity-95 text-gray-200">
                Join{" "}
                <span className="font-semibold text-cyan-400">DigiSence</span>{" "}
                today and create your professional digital presence.
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
      </div>
      <Footer />
    </div>
  );
}