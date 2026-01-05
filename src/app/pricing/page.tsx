"use client";
import { Button } from "@/components/ui/button";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle, Menu, X, Home, Building2, Users as UsersIcon, Calculator, Mail, Filter } from "lucide-react";
import Link from "next/link";
import PricingSection from "@/components/sections/pricing/PricingSection";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
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

  const pricingCategories = [
    { name: 'Basic Plan', icon: Star },
    { name: 'Professional Plan', icon: Users },
    { name: 'Business Plan', icon: Building2 },
    { name: 'Enterprise Plan', icon: Shield },
    { name: 'Custom Plan', icon: Zap }
  ];

  return (
    <div className="min-h-screen secondary-light-gradient pb-16 md:pb-0 relative">
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
            <Link
              href="/"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === "/"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
            <Link
              href="/businesses"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === "/businesses"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Building2 className="mr-3 h-5 w-5" />
              Businesses
            </Link>
            <Link
              href="/professionals"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === "/professionals"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Professionals
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === "/pricing"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Calculator className="mr-3 h-5 w-5" />
              Pricing
            </Link>
            <Link
              href="/contact"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === "/contact"
                  ? "bg-slate-800 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Mail className="mr-3 h-5 w-5" />
              Contact Us
            </Link>

            {/* Categories Section in Sidebar */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center px-3 mb-3">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing Plans</span>
              </div>
              <div className="space-y-1">
                {pricingCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.name}
                      href="#"
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200",
                        pathname === `/pricing/${category.name.toLowerCase().replace(' ', '-')}`
                          ? "bg-slate-800 text-white"
                          : "text-gray-700 hover:bg-gray-100"
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
      <nav className="fixed inset-x-0 top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center ">

              <Link
                href="/"
                className="flex items-center space-x-2"
              >
                <img src="/logo.svg" alt="DigiSence" className="h-6 w-auto sm:h-7" />
                <span className="font-bold text-lg sm:text-xl text-slate-800">
                  DigiSence
                </span>
              </Link>

            </div>
            <div className="hidden md:flex space-x-4 lg:space-x-8 flex-1 justify-center">
              <Link
                href="/"
                className={cn(
                  "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                  pathname === "/"
                    ? "bg-white text-slate-800 font-bold"
                    : "text-gray-700"
                )}
              >
                <Home className="mr-1 h-5 w-5" />
                Home
              </Link>
              <Link
                href="/businesses"
                className={cn(
                  "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                  pathname === "/businesses"
                    ? "bg-white text-slate-800 font-bold"
                    : "text-gray-700"
                )}
              >
                <Building2 className="mr-1 h-5 w-5" />
                Businesses
              </Link>
              <Link
                href="/professionals"
                className={cn(
                  "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                  pathname === "/professionals"
                    ? "bg-white text-slate-800 font-bold"
                    : "text-gray-700"
                )}
              >
                <Users className="mr-1 h-5 w-5" />
                Professionals
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "hover:text-cyan-400 transition-all flex duration-200 px-2 py-1 rounded-md text-sm lg:text-base",
                  pathname === "/pricing"
                    ? "bg-white text-slate-800 font-bold"
                    : "text-gray-700"
                )}
              >
                <Calculator className="mr-1 h-5 w-5" />
                Pricing
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "hover:text-cyan-400 transition-all duration-200 flex px-2 py-1 rounded-md text-sm lg:text-base",
                  pathname === "/contact"
                    ? "bg-white text-slate-800 font-bold"
                    : "text-gray-700"
                )}
              >
                <Mail className="mr-1 h-5 w-5" />
                Contact Us
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                className="text-white bg-slate-800 border-gray-800 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
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
              className="mr-2 p-2 rounded-md text-gray-700 md:hidden hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-12 sm:pt-16">

        <PricingSection />

      </main>
      <Footer />
    </div>
  );
}