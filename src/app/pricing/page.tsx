"use client";
import { Button } from "@/components/ui/button";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import PricingSection from "@/components/sections/pricing/PricingSection";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PricingPage() {
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
            name: "Professionals",
            link: "/professionals",
        },
        {
            name: "Pricing",
            link: "/pricing",
        },
        {
            name: "Contact Us",
            link: "/contact",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = pathname === "/";
    const navTransparent = isHome && !scrolled;

  return (
    <div className="relative">
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-40",
          navTransparent
            ? "bg-transparent"
            : " backdrop-blur-2xl bg-linear-30 from-cyan-50/90 via-slate-50/90 to-cyan-50/90  border-gray-200"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center h-16">
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
                    "h-7 w-auto",
                    navTransparent ? " filter invert hue-rotate-180" : " "
                  )}
                />

                <span
                  className={cn(
                    "font-bold text-xl",
                    navTransparent ? "text-white" : "text-primary"
                  )}
                >
                  DigiSence
                </span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-8 flex-1 justify-center">
              <Link
                href="/"
                className={cn(
                  "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                  pathname === "/"
                    ? "bg-white text-slate-800 font-bold"
                    : navTransparent
                    ? "text-white"
                    : "text-gray-700"
                )}
              >
                Home
              </Link>
              <Link
                href="/businesses"
                className={cn(
                  "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                  pathname === "/businesses"
                    ? "bg-white text-slate-800 font-bold"
                    : navTransparent
                    ? "text-white"
                    : "text-gray-700"
                )}
              >
                Businesses
              </Link>
              <Link
                href="/professionals"
                className={cn(
                  "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                  pathname === "/professionals"
                    ? "bg-white text-slate-800 font-bold"
                    : navTransparent
                    ? "text-white"
                    : "text-gray-700"
                )}
              >
                Professionals
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                  pathname === "/pricing"
                    ? "bg-white text-slate-800 font-bold"
                    : navTransparent
                    ? "text-white"
                    : "text-gray-700"
                )}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "hover:text-cyan-400 transition-colors px-2 py-1 rounded-md",
                  pathname === "/contact"
                    ? "bg-white text-slate-800 font-bold"
                    : navTransparent
                    ? "text-white"
                    : "text-gray-700"
                )}
              >
                Contact Us
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className={cn(
                  "text-white border-gray-800",
                  navTransparent
                    ? "bg-slate-900/20 border-white/50 "
                    : "bg-slate-900/90 hover:bg-white  hover:text-slate-800"
                )}
                asChild
              >
                <Link href="/register">Make Your Profile</Link>
              </Button>
              <Button
                variant="outline"
                className="bg-white text-gray-900 hover:text-white hover:bg-gray-700 border-gray-800"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              {/* Mobile menu button */}
              <button
                className={cn(
                  "md:hidden ml-2 p-2 rounded-md hover:bg-gray-100",
                  navTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700"
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="px-4 sm:px-6 lg:px-8 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Home
              </Link>
              <Link
                href="/businesses"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Businesses
              </Link>
              <Link
                href="/professionals"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Professionals
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Contact Us
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Make Your Profile
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className=" mt-10 mx-auto">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
}