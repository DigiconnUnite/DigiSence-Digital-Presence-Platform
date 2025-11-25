'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe } from "lucide-react";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Footer from "@/components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: {
    name: string;
  } | null;
  products: {
    id: string;
  }[];
};

export default function BusinessListingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
      name: "Contact Us",
      link: "/contact",
    },
  ];

  useEffect(() => {
    fetch("/api/businesses")
      .then((res) => res.json())
      .then((data) => setBusinesses(data.businesses || []))
      .catch((err) => console.error("Error fetching businesses:", err));
  }, []);

  return (
    <>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <a
            href="/"
            className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
          </a>
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="dark" as={Link} href="/dashboard/admin">Login</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <a
              href="/"
              className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-gray-900"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">DigiSence</span>
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
            {navItems.map((item, idx) => {
              const isActive = pathname === item.link;
              return (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative text-neutral-600 dark:text-neutral-300",
                    isActive && "text-blue-600 dark:text-blue-400 font-semibold"
                  )}
                >
                  <span className="block">{item.name}</span>
                </a>
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

      <AuroraBackground className="pt-24 min-h-screen">
        <div className="relative z-10">
          <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Discover Businesses
              </h1>
              <p className="text-xl text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                Explore our directory of professional businesses. Find the services and products you need.
              </p>
            </div>

            {businesses.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[20vh] py-8">
                <p className="text-gray-500 text-lg">No businesses found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businesses.map((business) => (
                  <Card
                    key={business.id}
                    className="h-full flex flex-col bg-white/80 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-4">
                        {business.logo ? (
                          <img
                            src={business.logo}
                            alt={business.name}
                            className="w-14 h-14 rounded-lg object-cover border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                            <span className="text-neutral-500 dark:text-neutral-400 text-xl font-semibold">
                              {business.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {business.name}
                          </CardTitle>
                          {business.category && (
                            <Badge variant="secondary" className="mt-1">
                              {business.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-0 flex flex-col">
                      {business.description && (
                        <CardDescription className="text-gray-600 dark:text-neutral-400 mb-4 line-clamp-2">
                          {business.description}
                        </CardDescription>
                      )}

                      <div className="space-y-2 mb-4">
                        {business.address && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-neutral-400">
                            <MapPin className="h-4 w-4 mr-2 shrink-0" />
                            <span className="truncate">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-neutral-400">
                            <Phone className="h-4 w-4 mr-2 shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-neutral-400">
                            <Globe className="h-4 w-4 mr-2 shrink-0" />
                            <a
                              href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate underline decoration-dotted hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                              {business.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-500 dark:text-neutral-400">
                          {business.products.length > 0 && (
                            <span>{business.products.length}+ products</span>
                          )}
                        </div>
                        <Button asChild>
                          <Link href={`/catalog/${business.slug}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
            )}
          </section>
        </div>
      </AuroraBackground>
      <Footer />
    </>
  );
}