"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Shield, Zap, ArrowRight, CheckCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import HeroSectionOne from "@/components/ui/hero";
import MarqueeSection from "@/components/ui/marquee";
import Footer from "@/components/Footer";
import { Android } from "@/components/ui/android";

import { useState, useEffect } from "react";
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
            name: "Professionals",
            link: "/professionals",
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
          <nav className={cn("fixed inset-x-0 top-0 z-40", navTransparent ? "bg-transparent" : "bg-white border-b border-gray-200")}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
                  <div className="flex justify-between items-center h-16">
                      <div className="flex items-center">
                          <Link
                              href="/"
                              className={cn("relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal", navTransparent ? "text-white" : "text-gray-900")}
                          >
                              <img src="/logo.svg" alt="DigiSence" className={cn("h-7 w-auto", navTransparent ? " filter invert hue-rotate-180" : " ")} />

                              <span className={cn("font-bold text-xl", navTransparent ? "text-white" : "text-primary")}>DigiSence</span>
                          </Link>
                      </div>
                      <div className="hidden md:flex space-x-8">
                          <Link href="/" className={cn("hover:text-primary transition-colors", navTransparent ? "text-white" : "text-gray-700")}>
                              Home
                          </Link>
                          <Link href="/businesses" className={cn("hover:text-primary transition-colors", navTransparent ? "text-white" : "text-gray-700")}>
                              Businesses
                          </Link>
                          <Link href="/professionals" className={cn("hover:text-primary transition-colors", navTransparent ? "text-white" : "text-gray-700")}>
                              Professionals
                          </Link>
                          <Link href="/contact" className={cn("hover:text-primary transition-colors", navTransparent ? "text-white" : "text-gray-700")}>
                              Contact Us
                          </Link>
                      </div>
                      <div className="flex items-center space-x-4">
                          <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800" asChild>
                              <Link href="/dashboard/business">Register</Link>
                          </Button>
                          <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700 border-gray-800" asChild>
                              <Link href="/login">Login</Link>
                          </Button>
                          {/* Mobile menu button */}
                          <button
                              className={cn("md:hidden ml-2 p-2 rounded-md hover:bg-gray-100", navTransparent ? "text-white hover:bg-white/10" : "text-gray-700")}
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
                          <Link href="/contact" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                              Contact Us
                          </Link>
                          <Link href="/dashboard/business" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                              Register
                          </Link>
                          <Link href="/login" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                              Login
                          </Link>
                      </div>
                  </div>
              )}
          </nav>

          <div className=" mx-auto">
              <HeroSectionOne />


              {/* Who Is It For? Section */}
              <section className="py-20 bg-gray-50">
                  <div className="max-w-7xl mx-auto ">
                      <div className="text-center mb-8">
                          <div className="flex items-center w-fit mx-auto rounded-full px-4 py-2 border border-slate-900 shadow-sm mb-2  text-slate-800">
                              <CheckCircle className="h-4 w-4 mr-2 text-slate-900" />
                              Who Is It For
                          </div>
                      </div>
                      <h2 className="text-4xl font-bold text-center mb-20 text-gray-900">
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
                                  <h3 className="text-4xl font-bold text-white mb-3">For Businesses</h3>
                                  <p className="text-md mb-6 text-gray-200 max-w-xs">
                                      Boost your business online.
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
                                  src={'square-bg.svg'}
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
                                  <h3 className="text-4xl font-bold text-white mb-3">For Professionals</h3>
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
                                  src={'square-bg.svg'}
                                  className="h-full scale-200 mx-auto object-cover pointer-events-none relative -bottom-1/3"
                              />

                          </div>
                      </div>
                  </div>
              </section>


              {/* CTA Section */}
              <section className="py-20 max-w-7x mx-autol w-full px-4 sm:px-6 bg-transparent flex justify-center items-center">
                  <div className="max-w-7xl w-full mx-auto">
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
          </div>
          <Footer />
      </div>
  );
}