"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import {
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
} from "@/lib/image-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Send,
  X,
  Image,
  Menu,
  Search,
  Fullscreen,
  ImageOff,
  Home,
  ShoppingBag,
  Grid3X3,
  MessageSquare,
  User,
  Briefcase,
  UserPlus,
  Share2,
  Download,
  Building2,
} from "lucide-react";
import { FaWhatsapp, FaWhatsappSquare } from "react-icons/fa";
import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiLinkedin,
  SiWhatsapp,
} from "react-icons/si";
import { LampContainer } from "./ui/lamp";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define Business type since Prisma doesn't export it for MongoDB
interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  about: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  catalogPdf: string | null;
  openingHours: any;
  gstNumber: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  adminId: string;
  categoryId: string | null;
  heroContent: any;
  brandContent: any;
  portfolioContent: any;
}

// Define custom Product type to match the updated schema
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  image: string | null;
  inStock: boolean;
  isActive: boolean;
  additionalInfo: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  categoryId: string | null;
  brandName: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface BusinessProfileProps {
  business: Business & {
    admin: { name?: string | null; email: string };
    category?: { name: string } | null;
    portfolioContent?: any;
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    about?: string | null;
    catalogPdf?: string | null;
    openingHours?: any[];
    gstNumber?: string | null;
    products: (Product & {
      category?: { id: string; name: string } | null;
    })[];
  };
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    _count?: {
      products: number;
    };
  }>;
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  productId?: string;
}

export default function BusinessProfile({
  business: initialBusiness,
  categories: initialCategories = [],
}: BusinessProfileProps) {
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState(initialBusiness);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModal, setProductModal] = useState(false);
  const [selectedProductModal, setSelectedProductModal] =
    useState<Product | null>(null);
  const [inquiryData, setInquiryData] = useState<InquiryFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewAllBrands, setViewAllBrands] = useState(false);
  const [viewAllProducts, setViewAllProducts] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lastUpdateCheck, setLastUpdateCheck] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Socket.io connection
  const { socket, isConnected } = useSocket(business.id);

  // Refs for smooth scrolling
  const aboutRef = useRef<HTMLDivElement>(null);
  const brandsRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Simulate loading time for skeleton
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for Real-time Updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (payload: any) => {
      console.log("Received update:", payload);

      if (payload.type === "BUSINESS_UPDATE") {
        setBusiness(payload.data);
        setLastUpdateCheck(Date.now());
        console.log("Business data updated from server");
      } else if (payload.type === "PRODUCT_UPDATE") {
        setBusiness((prev: any) => ({
          ...prev,
          products: prev.products.map((p: any) =>
            p.id === payload.data.id ? payload.data : p,
          ),
        }));
        console.log("Product data updated from server");
      }
    };

    socket.on("data-updated", handleUpdate);

    return () => {
      socket.off("data-updated", handleUpdate);
    };
  }, [socket]);

  const forceRefresh = async () => {
    setIsRefreshing(true);
    // Manual refresh by fetching current data
    try {
      const response = await fetch(
        `/api/businesses?${business.slug ? `slug=${business.slug}` : `id=${business.id}`}`,
        {
          cache: "no-store",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setBusiness(data.business);
        setLastUpdateCheck(Date.now());
      }
    } catch (error) {
      console.warn("Failed to force refresh:", error);
    }
    setIsRefreshing(false);
  };

  // Check URL parameters for auto-opening product modal
  useEffect(() => {
    if (!mounted || !business.products) return;

    const productId = searchParams.get("product");
    const modal = searchParams.get("modal");

    if (productId && modal === "open") {
      const product = business.products.find((p) => p.id === productId);
      if (product) {
        setSelectedProductModal(product);
        setProductModal(true);
        // Clear the URL parameters after opening modal
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("product");
          url.searchParams.delete("modal");
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        console.warn("Product not found for ID:", productId);
        // Optionally show an alert for invalid product
        if (typeof window !== "undefined") {
          alert("The requested product could not be found.");
        }
      }
    }
  }, [mounted, business.products, searchParams]);

  // Default hero content if not set
  const heroContent = (business.heroContent as any) || {
    slides: [
      {
        mediaType: "image",
        media: "",
        headline: "Welcome to " + business.name,
        headlineSize: "text-4xl md:text-6xl",
        headlineColor: "#ffffff",
        headlineAlignment: "center",
        subheadline:
          business.description || "Discover our amazing products and services",
        subtextSize: "text-xl md:text-2xl",
        subtextColor: "#ffffff",
        subtextAlignment: "center",
        cta: "Get in Touch",
        ctaLink: "",
      },
    ],
    autoPlay: true,
    transitionSpeed: 5,
  };

  // Autoplay functionality for hero carousel
  useEffect(() => {
    if (
      heroContent.slides &&
      heroContent.slides.length > 1 &&
      heroContent.autoPlay
    ) {
      const interval = setInterval(
        () => {
          setCurrentSlideIndex(
            (prev) => (prev + 1) % heroContent.slides.length,
          );
        },
        (heroContent.transitionSpeed || 5) * 1000,
      );
      return () => clearInterval(interval);
    }
  }, [heroContent.slides, heroContent.autoPlay, heroContent.transitionSpeed]);

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [heroContent.slides?.length]);

  // Default brand content if not set
  const brandContent = (business.brandContent as any) || {
    brands: [],
  };

  // Default category content if not set
  const categoryContent = business.category
    ? {
        categories: [business.category],
      }
    : {
        categories: [],
      };

  // Default portfolio content if not set
  const portfolioContent = (business.portfolioContent as any) || { images: [] };

  // Categories and filtered products for search/filter - memoized for performance
  const { categories, filteredProducts } = useMemo(() => {
    console.log("DEBUG: initialCategories received:", initialCategories);
    const categories = initialCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
    console.log("DEBUG: categories for dropdown:", categories);
    const filteredProducts = business.products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category?.id === selectedCategory;
      const matchesBrand =
        selectedBrand === null || product.brandName === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
    return { categories, filteredProducts };
  }, [
    initialCategories,
    business.products,
    searchTerm,
    selectedCategory,
    selectedBrand,
  ]);

  // Related products for modal - memoized for performance
  const relatedProducts = useMemo(() => {
    if (!selectedProductModal) return [];

    const mainProduct = selectedProductModal;
    const allProducts = business.products.filter(
      (p) => p.id !== mainProduct.id && p.isActive,
    );

    // Keywords that indicate a product is a component/spare part
    const componentKeywords = [
      "spare",
      "part",
      "component",
      "accessory",
      "kit",
      "module",
      "unit",
      "assembly",
      "replacement",
    ];

    // Score products based on relevance
    const scoredProducts = allProducts.map((product) => {
      let score = 0;

      // Higher score for products in same category
      if (product.category?.id === mainProduct.category?.id) {
        score += 3;
      }

      // Higher score for products with same brand
      if (product.brandName === mainProduct.brandName) {
        score += 2;
      }

      // Very high score if product name contains main product name (suggests it's a component)
      const mainProductWords = mainProduct.name.toLowerCase().split(" ");
      const productWords = product.name.toLowerCase().split(" ");

      for (const mainWord of mainProductWords) {
        if (
          mainWord.length > 3 &&
          product.name.toLowerCase().includes(mainWord)
        ) {
          score += 5;
          break;
        }
      }

      // High score for component keywords in product name or description
      const productText = (
        product.name +
        " " +
        (product.description || "")
      ).toLowerCase();
      for (const keyword of componentKeywords) {
        if (productText.includes(keyword)) {
          score += 4;
          break;
        }
      }

      // Medium score for products that share significant words with main product
      const commonWords = mainProductWords.filter(
        (word) => word.length > 3 && productWords.includes(word),
      );
      score += commonWords.length * 2;

      return { product, score };
    });

    // Sort by score (highest first) and return top 4
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map((item) => item.product);
  }, [business.products, selectedProductModal]);

  const handleInquiry = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // Comprehensive validation
        const errors: string[] = [];

        // Name validation
        if (!inquiryData.name.trim()) {
          errors.push("Name is required");
        } else if (inquiryData.name.trim().length < 2) {
          errors.push("Name must be at least 2 characters long");
        } else if (inquiryData.name.trim().length > 100) {
          errors.push("Name must be less than 100 characters");
        }

        // Email validation
        if (!inquiryData.email.trim()) {
          errors.push("Email is required");
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(inquiryData.email.trim())) {
            errors.push("Please enter a valid email address");
          }
        }

        // Phone validation (optional but if provided, validate format)
        if (inquiryData.phone.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(inquiryData.phone.replace(/[\s\-\(\)]/g, ""))) {
            errors.push("Please enter a valid phone number");
          }
        }

        // Message validation
        if (!inquiryData.message.trim()) {
          errors.push("Message is required");
        } else if (inquiryData.message.trim().length < 10) {
          errors.push("Message must be at least 10 characters long");
        } else if (inquiryData.message.trim().length > 2000) {
          errors.push("Message must be less than 2000 characters");
        }

        if (errors.length > 0) {
          alert(`Please fix the following errors:\n${errors.join("\n")}`);
          setIsSubmitting(false);
          return;
        }

        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: inquiryData.name.trim(),
            email: inquiryData.email.trim().toLowerCase(),
            phone: inquiryData.phone.trim() || null,
            message: inquiryData.message.trim(),
            businessId: business.id,
            productId: selectedProduct?.id,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          alert(
            "Inquiry submitted successfully! We will get back to you soon.",
          );
          setInquiryModal(false);
          setInquiryData({ name: "", email: "", phone: "", message: "" });
          setSelectedProduct(null);
        } else {
          alert(
            `Failed to submit inquiry: ${result.error || "Please try again."}`,
          );
        }
      } catch (error) {
        console.error("Inquiry submission error:", error);
        alert(
          "An error occurred while submitting your inquiry. Please check your connection and try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [inquiryData, business.id, selectedProduct],
  );

  const handleShare = useCallback(
    (product: Product) => {
      const shareUrl = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
      const shareData = {
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: shareUrl,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(console.error);
      } else {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            alert("Link copied to clipboard!");
          })
          .catch(() => {
            alert("Failed to copy link");
          });
      }
    },
    [business.slug],
  );

  const openInquiryModal = (product?: Product) => {
    setSelectedProduct(product || null);
    setInquiryData((prev) => ({
      ...prev,
      message: product ? `I'm interested in ${product.name}` : "",
    }));
    setInquiryModal(true);
  };

  const openProductModal = (product: Product) => {
    setSelectedProductModal(product);
    setProductModal(true);
  };

  // Smooth scroll function - memoized for performance
  const scrollToSection = useCallback(
    (ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
      setActiveSection(sectionName);
      if (ref.current) {
        const offset = 80; // Offset for the fixed header
        const elementPosition = ref.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else if (sectionName === "about" && typeof window !== "undefined") {
        // Fallback for mobile if ref is on desktop element
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Close mobile menu if open
      setMobileMenuOpen(false);
    },
    [],
  );

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.id;
            if (sectionName) {
              setActiveSection(sectionName);
            }
          }
        });
      },
      { threshold: 0.3 },
    );

    // Observe all sections
    const sections = [
      aboutRef.current,
      brandsRef.current,
      productsRef.current,
      portfolioRef.current,
      contactRef.current,
    ];
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Helper to render the Business Info Card content (Sidebar)
  const BusinessInfoCard = () => (
    <div className="flex flex-col gap-3 lg:gap-4 w-full">
      <Card className="relative  border border-orange-500 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 lg:p-4 flex flex-col items-center text-center w-full overflow-hidden">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="shrink-0 flex items-center justify-center">
            {business.logo && business.logo.trim() !== "" ? (
              <img
                src={getOptimizedImageUrl(business.logo)}
                srcSet={generateSrcSet(business.logo)}
                sizes="(max-width: 640px) 80px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                alt={business.name}
                className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border shadow-sm">
                <Image className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 w-full min-w-0 text-center">
            <h3 className="font-extrabold text-lg text-gray-800 line-clamp-2 leading-tight">
              {business.name || "Business Name"}
            </h3>
            {business.category && (
              <span className="inline-flex items-center justify-center text-xs px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-medium w-fit mx-auto">
                <Building2 className="w-3 h-3 mr-1 text-orange-700" />
                {business.category.name}
              </span>
            )}
            {business.description && (
              <p className="text-xs text-gray-600 line-clamp-4">
                {business.description}
              </p>
            )}
            {business.admin?.name && (
              <span className="flex items-center justify-center text-xs flex-1 rounded-full py-1 px-3 bg-slate-900 text-gray-200 border border-gray-200 font-semibold w-fit mx-auto">
                <User className="w-3 h-3 mr-1 text-gray-100" />
                {business.admin.name}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
          onClick={() => {
            const vCardData = `BEGIN:VCARD
                        VERSION:3.0
                        FN:${business.name || ""}
                        ORG:${business.category?.name || ""}
                        TEL:${business.phone || ""}
                        EMAIL:${business.email || ""}
                        ADR:;;${business.address || ""};;;;
                        END:VCARD`;

            const blob = new Blob([vCardData], { type: "text/vcard" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${business.name || "contact"}.vcf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          title="Save contact to your device"
        >
          <UserPlus className="h-3 w-3" />
          Save Contact
        </Button>
        <Button
          size="sm"
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors text-xs font-medium shadow-sm border-0 cursor-pointer"
          style={{ backgroundColor: "#25D366" }}
          onClick={() => {
            if (business.phone) {
              const phoneNum = business.phone.replace(/[^\d]/g, "");
              const waUrl = `https://wa.me/${phoneNum}?text=${encodeURIComponent(`Hi, I'm interested in ${business.name}${business.category?.name ? ` (${business.category.name})` : ""}`)}`;
              window.open(waUrl, "_blank");
            } else {
              alert("No WhatsApp number available");
            }
          }}
          title="Contact via WhatsApp"
        >
          <SiWhatsapp className="h-3 w-3" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm cursor-pointer"
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: business.name || "Business Profile",
                  text: business.description || `Check out ${business.name}`,
                  url: window.location.href,
                })
                .catch((err) => console.log("Error sharing:", err));
            } else {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  alert("Link copied to clipboard!");
                })
                .catch((err) => console.log("Error copying link:", err));
            }
          }}
          title="Share this business profile"
        >
          <Share2 className="h-3 w-3" />
          Share
        </Button>
      </div>

      {/* Contact Details Card */}
      <Card className="rounded-2xl shadow-md bg-slate-900 hover:shadow-md transition-shadow duration-300 px-3 py-3 flex flex-col items-stretch h-full w-full relative">
        <div className="flex flex-col gap-3 w-full items-center justify-between relative z-10">
          <div className="flex flex-col flex-1 min-w-0 space-y-2.5 w-full">
            {business.address && business.address.trim() !== "" && (
              <div className="flex items-start gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 mt-0.5 shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors" />
                </span>
                <span className="text-xs text-white hover:text-orange-300 font-semibold leading-snug break-words">
                  {business.address}
                </span>
              </div>
            )}
            {business.phone && business.phone.trim() !== "" && (
              <div className="flex items-center gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 shrink-0">
                  <Phone className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors shrink-0" />
                </span>
                <a
                  href={`tel:${business.phone}`}
                  className="text-xs text-white hover:text-orange-300 hover:underline font-semibold break-all"
                  title="Call this number"
                >
                  {business.phone}
                </a>
              </div>
            )}
            {business.email && business.email.trim() !== "" && (
              <div className="flex items-center gap-2.5 group">
                <span className="inline-flex items-center justify-center rounded-full border bg-white/15 border-orange-300/50 group-hover:border-orange-400 transition-colors w-7 h-7 shrink-0">
                  <Mail className="h-3.5 w-3.5 text-gray-100 group-hover:text-orange-300 transition-colors shrink-0" />
                </span>
                <a
                  href={`mailto:${business.email}`}
                  className="text-xs text-white hover:text-orange-300 hover:underline font-semibold break-all"
                  title="Send email"
                >
                  {business.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {(business.facebook ||
          business.twitter ||
          business.instagram ||
          business.linkedin ||
          business.website) && (
          <div className="w-full border-t pt-4 border-gray-200/80 mt-1 relative z-10">
            <div className="flex flex-wrap gap-2 w-full justify-center items-center">
              {business.website && (
                <a
                  href={
                    business.website.startsWith("http")
                      ? business.website
                      : `https://${business.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                  aria-label="Website"
                >
                  <Globe className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                </a>
              )}
              {business.facebook && (
                <a
                  href={
                    business.facebook.startsWith("http")
                      ? business.facebook
                      : `https://${business.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                </a>
              )}
              {business.twitter && (
                <a
                  href={
                    business.twitter.startsWith("http")
                      ? business.twitter
                      : `https://${business.twitter}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group"
                  aria-label="Twitter"
                >
                  <SiX className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                </a>
              )}
              {business.instagram && (
                <a
                  href={
                    business.instagram.startsWith("http")
                      ? business.instagram
                      : `https://${business.instagram}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors group"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-4 w-4 text-pink-600 group-hover:text-pink-800" />
                </a>
              )}
              {business.linkedin && (
                <a
                  href={
                    business.linkedin.startsWith("http")
                      ? business.linkedin
                      : `https://${business.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors group"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-4 w-4 text-blue-600 group-hover:text-blue-800" />
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const SkeletonLayout = () => (
    <div className="min-h-screen bg-orange-50 grid grid-cols-1 md:grid-cols-3">
      <aside className="hidden md:block md:col-span-1 border-r bg-slate-50">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full mt-4" />
      </aside>
      <main className="md:col-span-2 overflow-y-auto">
        <Skeleton className="h-16 w-full border-b" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </main>
    </div>
  );

  if (isLoading) {
    return <SkeletonLayout />;
  }

  return (
    // DASHBOARD LAYOUT CONTAINER
    <div
      className="h-screen w-full overflow-hidden bg-orange-50 flex flex-col"
      suppressHydrationWarning
    >
      {/* PAGE HEADER - On Top, Not in Main Content */}
      <header className="flex-shrink-0 bg-white shadow-sm border-b z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Business Name */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {business.logo && business.logo.trim() !== "" ? (
                  <img
                    src={getOptimizedImageUrl(business.logo)}
                    alt={business.name}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
              <span className="text-lg font-bold text-gray-900 hidden md:block">
                {business.name}
              </span>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 px-8">
              <div className="flex space-x-2">
                <button
                  className={`flex items-center text-sm font-medium transition-all duration-200 ${
                    activeSection === "home"
                      ? "text-orange-600 bg-orange-50 border border-orange-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } px-3 py-2 rounded-lg`}
                  onClick={() => {
                    setActiveSection("home");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Home
                    className={`w-4 h-4 mr-2 transition-colors ${
                      activeSection === "home"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  />
                  Home
                </button>
                <button
                  className={`flex items-center text-sm font-medium transition-all duration-200 ${
                    activeSection === "about"
                      ? "text-orange-600 bg-orange-50 border border-orange-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } px-3 py-2 rounded-lg`}
                  onClick={() =>
                    scrollToSection(
                      aboutRef as React.RefObject<HTMLDivElement>,
                      "about",
                    )
                  }
                >
                  <User
                    className={`w-4 h-4 mr-2 transition-colors ${
                      activeSection === "about"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  />
                  About
                </button>
                <button
                  className={`flex items-center text-sm font-medium transition-all duration-200 ${
                    activeSection === "brands"
                      ? "text-orange-600 bg-orange-50 border border-orange-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } px-3 py-2 rounded-lg`}
                  onClick={() =>
                    scrollToSection(
                      brandsRef as React.RefObject<HTMLDivElement>,
                      "brands",
                    )
                  }
                >
                  <Grid3X3
                    className={`w-4 h-4 mr-2 transition-colors ${
                      activeSection === "brands"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  />
                  Brands
                </button>
                <button
                  className={`flex items-center text-sm font-medium transition-all duration-200 ${
                    activeSection === "products"
                      ? "text-orange-600 bg-orange-50 border border-orange-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } px-3 py-2 rounded-lg`}
                  onClick={() =>
                    scrollToSection(
                      productsRef as React.RefObject<HTMLDivElement>,
                      "products",
                    )
                  }
                >
                  <ShoppingBag
                    className={`w-4 h-4 mr-2 transition-colors ${
                      activeSection === "products"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  />
                  Products
                </button>
                <button
                  className={`flex items-center text-sm font-medium transition-all duration-200 ${
                    activeSection === "portfolio"
                      ? "text-orange-600 bg-orange-50 border border-orange-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  } px-3 py-2 rounded-lg`}
                  onClick={() =>
                    scrollToSection(
                      portfolioRef as React.RefObject<HTMLDivElement>,
                      "portfolio",
                    )
                  }
                >
                  <Briefcase
                    className={`w-4 h-4 mr-2 transition-colors ${
                      activeSection === "portfolio"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  />
                  Portfolio
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex-shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              <button
                className={`w-full flex items-center text-sm font-medium ${
                  activeSection === "home" ? "text-orange-600" : "text-gray-600"
                } px-3 py-2 rounded-lg hover:bg-gray-50`}
                onClick={() => {
                  setActiveSection("home");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>
              <button
                className={`w-full flex items-center text-sm font-medium ${
                  activeSection === "about"
                    ? "text-orange-600"
                    : "text-gray-600"
                } px-3 py-2 rounded-lg hover:bg-gray-50`}
                onClick={() => {
                  scrollToSection(
                    aboutRef as React.RefObject<HTMLDivElement>,
                    "about",
                  );
                  setMobileMenuOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                About
              </button>
              <button
                className={`w-full flex items-center text-sm font-medium ${
                  activeSection === "brands"
                    ? "text-orange-600"
                    : "text-gray-600"
                } px-3 py-2 rounded-lg hover:bg-gray-50`}
                onClick={() => {
                  scrollToSection(
                    brandsRef as React.RefObject<HTMLDivElement>,
                    "brands",
                  );
                  setMobileMenuOpen(false);
                }}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Brands
              </button>
              <button
                className={`w-full flex items-center text-sm font-medium ${
                  activeSection === "products"
                    ? "text-orange-600"
                    : "text-gray-600"
                } px-3 py-2 rounded-lg hover:bg-gray-50`}
                onClick={() => {
                  scrollToSection(
                    productsRef as React.RefObject<HTMLDivElement>,
                    "products",
                  );
                  setMobileMenuOpen(false);
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Products
              </button>
              <button
                className={`w-full flex items-center text-sm font-medium ${
                  activeSection === "portfolio"
                    ? "text-orange-600"
                    : "text-gray-600"
                } px-3 py-2 rounded-lg hover:bg-gray-50`}
                onClick={() => {
                  scrollToSection(
                    portfolioRef as React.RefObject<HTMLDivElement>,
                    "portfolio",
                  );
                  setMobileMenuOpen(false);
                }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Portfolio
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">
        <aside className="hidden md:block md:col-span-1 h-full overflow-y-auto z-20  ">
          <div className="flex flex-col p-4 lg:gap-4 w-full">
            <BusinessInfoCard />
          </div>
        </aside>
        <main className="md:col-span-3 h-full overflow-y-auto relative scroll-smooth min-w-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6 lg:space-y-8">
            <section className="relative w-full">
              <div className="w-full rounded-2xl  overflow-hidden shadow-sm">
                {heroContent.slides && heroContent.slides.length > 0 ? (
                  <div className="relative w-full">
                    <div className="overflow-hidden rounded-2xl">
                      <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                          transform: `translateX(-${currentSlideIndex * 100}%)`,
                        }}
                      >
                        {heroContent.slides.map((slide: any, index: number) => {
                          const isVideo =
                            slide.mediaType === "video" ||
                            (slide.media &&
                              (slide.media.includes(".mp4") ||
                                slide.media.includes(".webm") ||
                                slide.media.includes(".ogg")));
                          const mediaUrl = slide.media || slide.image;

                          return (
                            <div key={index} className="w-full shrink-0">
                              <div className="relative w-full aspect-3/1 md:max-h-full bg-linear-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden">
                                {isVideo && mediaUrl ? (
                                  <video
                                    src={mediaUrl}
                                    className="w-full h-full object-cover rounded-2xl absolute top-0 left-0"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster={
                                      slide.poster ||
                                      (slide.image && slide.image !== mediaUrl
                                        ? slide.image
                                        : undefined)
                                    }
                                    onError={(e) => {
                                      console.error(
                                        "Video failed to load:",
                                        mediaUrl,
                                      );
                                      const target =
                                        e.target as HTMLVideoElement;
                                      target.style.display = "none";
                                      const fallbackImg =
                                        target.nextElementSibling as HTMLImageElement;
                                      if (fallbackImg) {
                                        fallbackImg.style.display = "block";
                                      }
                                    }}
                                  />
                                ) : null}
                                <img
                                  src={
                                    mediaUrl && mediaUrl.trim() !== ""
                                      ? getOptimizedImageUrl(mediaUrl, {
                                          width: 1200,
                                          height: 600,
                                          quality: 85,
                                          format: "auto",
                                          crop: "fill",
                                          gravity: "auto",
                                        })
                                      : "/placeholder.svg"
                                  }
                                  srcSet={
                                    mediaUrl && mediaUrl.trim() !== ""
                                      ? generateSrcSet(mediaUrl)
                                      : undefined
                                  }
                                  sizes={generateSizes(1200)}
                                  alt={slide.headline || "Hero image"}
                                  className={`w-full h-full object-cover rounded-2xl ${isVideo ? "hidden" : ""} absolute top-0 left-0`}
                                  loading={index === 0 ? "eager" : "lazy"}
                                  decoding="async"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.svg";
                                  }}
                                />
                                {slide.showText !== false && (
                                  <div className="absolute inset-0  bg-opacity-40 flex items-center justify-center rounded-2xl">
                                    <div
                                      className={`
                                          text-white
                                          px-2 py-1
                                          md:px-4 md:py-4
                                          ${
                                            slide.headlineAlignment === "left"
                                              ? "text-left items-start justify-start"
                                              : slide.headlineAlignment ===
                                                  "right"
                                                ? "text-right items-end justify-end"
                                                : "text-center items-center justify-center"
                                          }
                                          max-w-[95vw]
                                          md:max-w-4xl
                                          mx-auto
                                          flex flex-col
                                          h-full
                                          justify-center
                                          `}
                                    >
                                      {slide.headline && (
                                        <h1
                                          className={`
                                              font-bold
                                              leading-tight
                                              drop-shadow-lg
                                              mb-1 xs:mb-2 md:mb-4
                                              tracking-tight
                                              font-display
                                              whitespace-pre-line
                                              ${
                                                slide.headlineSize
                                                  ? slide.headlineSize
                                                  : "text-sm xs:text-base sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl"
                                              }
                                              ${
                                                slide.headlineAlignment ===
                                                "left"
                                                  ? "text-left"
                                                  : slide.headlineAlignment ===
                                                      "right"
                                                    ? "text-right"
                                                    : "text-center"
                                              }
                                              `}
                                          style={{
                                            color:
                                              slide.headlineColor || "#ffffff",
                                            textShadow:
                                              "2px 2px 4px rgba(0,0,0,0.5)",
                                          }}
                                        >
                                          {slide.headline}
                                        </h1>
                                      )}
                                      {slide.subheadline && (
                                        <p
                                          className={`
                                              drop-shadow-md
                                              max-w-2xl
                                              leading-relaxed
                                              tracking-normal
                                              font-normal
                                              font-sans
                                              mb-2 xs:mb-3 sm:mb-4 md:mb-6
                                              ${
                                                slide.subtextSize
                                                  ? slide.subtextSize
                                                  : "text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
                                              }
                                              ${
                                                slide.headlineAlignment ===
                                                "left"
                                                  ? "text-left"
                                                  : slide.headlineAlignment ===
                                                      "right"
                                                    ? "text-right"
                                                    : "text-center"
                                              }
                                              `}
                                          style={{
                                            color:
                                              slide.subtextColor || "#ffffff",
                                            textShadow:
                                              "1px 1px 2px rgba(0,0,0,0.5)",
                                          }}
                                        >
                                          {slide.subheadline}
                                        </p>
                                      )}
                                      {slide.cta && (
                                        <div
                                          className={`
                                              flex w-full
                                              ${
                                                slide.headlineAlignment ===
                                                "left"
                                                  ? "justify-start"
                                                  : slide.headlineAlignment ===
                                                      "right"
                                                    ? "justify-end"
                                                    : "justify-center"
                                              }
                                              mt-0 md:mt-4
                                          `}
                                        >
                                          <Button
                                            size="lg"
                                            onClick={() => openInquiryModal()}
                                            className={`
                                                  text-sm xs:text-base md:text-lg
                                                  px-4 xs:px-6 md:px-8
                                                  py-2 xs:py-3 md:py-4
                                                  font-semibold rounded-xl md:rounded-2xl
                                                  shadow-xl hover:shadow-2xl
                                                  transition-all duration-300
                                                  bg-white text-gray-900 hover:bg-gray-100
                                              `}
                                          >
                                            {slide.cta}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {heroContent.showArrows !== false &&
                      heroContent.slides.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentSlideIndex((prev) =>
                                prev > 0
                                  ? prev - 1
                                  : heroContent.slides.length - 1,
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                          </button>
                          <button
                            onClick={() =>
                              setCurrentSlideIndex((prev) =>
                                prev < heroContent.slides.length - 1
                                  ? prev + 1
                                  : 0,
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full p-2"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    {heroContent.showDots !== false &&
                      heroContent.slides.length > 1 && (
                        <div className="flex absolute bottom-2 mx-auto  w-full justify-center mt-4 space-x-2">
                          {heroContent.slides.map((_: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlideIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${index === currentSlideIndex ? "bg-white" : "bg-white/50"}`}
                            />
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  // Default hero when no slides are configured
                  <div className="relative w-full h-[40vw] min-h-40 max-h-60 md:h-[500px] md:min-h-80 bg-linear-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-2xl">
                      <div className="text-white text-center px-2 py-2 max-w-[95vw] md:max-w-4xl mx-auto flex flex-col justify-center h-full">
                        <h1 className="text-sm xs:text-base sm:text-lg md:text-5xl lg:text-6xl font-bold mb-1 xs:mb-2 md:mb-6 leading-tight drop-shadow-lg whitespace-pre-line">
                          Welcome to {business.name}
                        </h1>
                        <p className="text-xs xs:text-sm sm:text-base md:text-2xl mb-2 xs:mb-3 md:mb-8 leading-relaxed drop-shadow-md max-w-2xl">
                          {business.description ||
                            "Discover our amazing products and services"}
                        </p>
                        <Button
                          size="lg"
                          onClick={() => openInquiryModal()}
                          className="text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-2 xs:py-3 md:py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100"
                        >
                          Get in Touch
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {brandContent.brands?.length > 0 && (
              <section
                id="brands"
                ref={brandsRef}
                className="py-6 md:py-12 px-0"
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4 md:mb-8">
                    <h2 className="text-lg md:text-2xl font-bold">
                      Trusted By
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewAllBrands(!viewAllBrands);
                      }}
                    >
                      {viewAllBrands ? "Show Less" : "View All"}
                    </Button>
                  </div>
                  {viewAllBrands ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                      {brandContent.brands.map((brand: any, index: number) => (
                        <div
                          key={index}
                          className="flex flex-col h-full cursor-pointer transition-all duration-300"
                          onClick={() =>
                            setSelectedBrand(
                              selectedBrand === brand.name ? null : brand.name,
                            )
                          }
                        >
                          <Card
                            className={`overflow-hidden rounded-2xl   p-0 md:rounded-3xl cursor-pointer transition-all duration-300 h-full flex items-center justify-center flex-col ${
                              selectedBrand === brand.name
                                ? "bg-orange-50 border-2 border-orange-400 shadow-2xl"
                                : "bg-white/70 hover:bg-white/90 hover:shadow-md"
                            }`}
                          >
                            {/* Container with Fixed Height and Full Width */}
                            <div className="relative w-full h-[180px] flex items-center justify-center bg-gray-50/50">
                              {brand.logo && brand.logo.trim() !== "" ? (
                                <img
                                  src={getOptimizedImageUrl(brand.logo, {
                                    width: 400,
                                    height: 300,
                                    quality: 85,
                                    format: "auto",
                                  })}
                                  srcSet={generateSrcSet(brand.logo)}
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                  alt={brand.name}
                                  // w-full fills the width, h-auto maintains aspect ratio, object-contain ensures the whole image is visible
                                  className="w-full my-auto mx-auto h-auto object-contain max-h-[180px]"
                                  loading="lazy"
                                />
                              ) : (
                                <Image className="h-10 w-10 text-gray-400" />
                              )}
                            </div>
                          </Card>
                          <p
                            className={`text-center text-xs md:text-base mt-2 font-semibold transition-colors break-words ${
                              selectedBrand === brand.name
                                ? "text-orange-400 font-700"
                                : "text-gray-700 font-semibold"
                            }`}
                          >
                            {brand.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Carousel
                      opts={{
                        loop: true,
                        dragFree: false,
                        align: "start",
                        watchDrag: true,
                        watchResize: true,
                        watchSlides: true,
                      }}
                      className="w-full"
                      suppressHydrationWarning
                    >
                      <CarouselContent>
                        {brandContent.brands.map(
                          (brand: any, index: number) => (
                            <CarouselItem
                              key={index}
                              className="basis-1/2 md:basis-1/4 lg:basis-1/5"
                            >
                              <div
                                className="flex flex-col h-full cursor-pointer transition-all duration-300"
                                onClick={() =>
                                  setSelectedBrand(
                                    selectedBrand === brand.name
                                      ? null
                                      : brand.name,
                                  )
                                }
                              >
                                <Card
                                  className={`overflow-hidden rounded-2xl p-0 md:rounded-3xl cursor-pointer items-center justify-center transition-all duration-300 h-full flex flex-col ${
                                    selectedBrand === brand.name
                                      ? "bg-orange-50 border-2 border-orange-400 shadow-2xl"
                                      : "bg-white/70 hover:bg-white/90 hover:shadow-md"
                                  }`}
                                >
                                  {/* Container with Fixed Height and Full Width */}
                                  <div className="relative w-full h-[180px] flex items-center justify-center bg-gray-50/50">
                                    {brand.logo && brand.logo.trim() !== "" ? (
                                      <img
                                        src={getOptimizedImageUrl(brand.logo, {
                                          width: 400,
                                          height: 300,
                                          quality: 85,
                                          format: "auto",
                                        })}
                                        srcSet={generateSrcSet(brand.logo)}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        alt={brand.name}
                                        // w-full fills the width, h-auto maintains aspect ratio, object-contain ensures the whole image is visible
                                        className="w-full my-auto mx-auto h-auto object-contain max-h-[180px]"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <Image className="h-10 w-10 text-gray-400" />
                                    )}
                                  </div>
                                </Card>
                                <p
                                  className={`text-center text-xs md:text-base mt-2 font-semibold transition-colors break-words ${
                                    selectedBrand === brand.name
                                      ? "text-orange-400 font-700"
                                      : "text-gray-700 font-semibold"
                                  }`}
                                >
                                  {brand.name}
                                </p>
                              </div>
                            </CarouselItem>
                          ),
                        )}
                      </CarouselContent>
                      <div className="hidden md:block">
                        <CarouselPrevious className="left-2 md:left-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                        <CarouselNext className="right-2 md:right-4 bg-white/80 hover:bg-white text-gray-800 border-0 shadow-lg" />
                      </div>
                    </Carousel>
                  )}
                </div>
              </section>
            )}

            {business.products.length > 0 && (
              <section id="products" ref={productsRef} className="">
                <div className="w-full mx-auto">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900">
                        Our Products & Services
                      </h2>
                      {selectedBrand && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none"
                          >
                            Filtered by: {selectedBrand}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBrand(null)}
                            className="text-orange-600 hover:text-orange-800 h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewAllProducts(!viewAllProducts)}
                      className="rounded-full border-gray-300"
                    >
                      {viewAllProducts ? "Show Less" : "View All"}
                    </Button>
                  </div>

                  {/* Sticky Search Bar */}
                  <div className="sticky top-0 z-30 mb-6">
                    {mounted && (
                      <div
                        className="flex flex-col sm:flex-row gap-3 py-2  backdrop-blur-lg"
                        suppressHydrationWarning
                      >
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 bg-gray-50 border-gray-200 focus-visible:ring-orange-500 text-sm"
                          />
                        </div>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className=" sm:w-[180px] h-10 bg-gray-50 border-gray-200 text-sm">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Reusable Product Card Component */}
                  {(() => {
                    const ProductCard = ({ product }) => (
                      <Card
                        id={`product-${product.id}`}
                        className="group overflow-hidden p-0 rounded-2xl border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col h-full bg-white"
                      >
                        {/* Image Section - Fixed Height, Cover, Clean */}
                        <div
                          className="relative w-full h-64 overflow-hidden cursor-pointer bg-gray-100"
                          onClick={() => openProductModal(product)}
                        >
                          {product.image && product.image.trim() !== "" ? (
                            <img
                              src={getOptimizedImageUrl(product.image, {
                                width: 500,
                                height: 500,
                                quality: 85,
                                format: "auto",
                              })}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-50">
                              <ImageOff className="h-10 w-10 text-gray-300" />
                            </div>
                          )}

                          {/* Stock Badge */}
                          <div className="absolute top-0 right-0">
                            <Badge
                              className={`absolute top-3 text-white right-3 ${
                                product.inStock
                                  ? "bg-linear-to-l from-gray-900 to-lime-900"
                                  : "bg-linear-to-l from-gray-900 to-red-900"
                              } text-white border-0`}
                            >
                              {product.inStock ? (
                                <span className="flex items-center gap-1">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                  </span>{" "}
                                  In Stock
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                                  </span>{" "}
                                  Out of Stock
                                </span>
                              )}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3
                              className="font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-orange-600 transition-colors text-sm md:text-base"
                              onClick={() => openProductModal(product)}
                            >
                              {product.name}
                            </h3>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {product.brandName && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 rounded-md border-gray-200 text-gray-500 font-normal"
                              >
                                {product.brandName}
                              </Badge>
                            )}
                            {product.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0.5 rounded-md border-gray-200 text-gray-500 font-normal"
                              >
                                {product.category.name}
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                            {product.description || "No description available."}
                          </p>

                          {/* Actions */}
                          <div className="flex gap-2 mt-auto">
                            <Button
                              className="flex-1 bg-green-500 hover:bg-black text-white h-9 text-xs font-medium rounded-lg"
                              onClick={() => {
                                if (business.phone) {
                                  const productLink = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
                                  const message = `Hi, I'm interested in ${product.name}\n\n${productLink}`;
                                  const whatsappUrl = `https://wa.me/${business.phone.replace(
                                    /[^\d]/g,
                                    "",
                                  )}?text=${encodeURIComponent(message)}`;
                                  window.open(whatsappUrl, "_blank");
                                } else {
                                  alert("Phone number not available");
                                }
                              }}
                            >
                              Inquire
                              <SiWhatsapp className="h-3.5 w-3.5 ml-1.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-lg border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(product);
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );

                    return viewAllProducts ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <Carousel
                        opts={{
                          align: "start",
                          loop: true,
                        }}
                        className="w-full -mx-4 px-4 md:mx-0 md:px-0"
                      >
                        <CarouselContent>
                          {filteredProducts.map((product) => (
                            <CarouselItem
                              key={product.id}
                              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4 md:pl-4"
                            >
                              <ProductCard product={product} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {/* Carousel Navigation */}
                        <div className="hidden md:flex justify-end gap-2 mt-4">
                          <CarouselPrevious className="static w-10 h-10 rounded-full border-gray-200 hover:bg-gray-100" />
                          <CarouselNext className="static w-10 h-10 rounded-full border-gray-200 hover:bg-gray-100" />
                        </div>
                      </Carousel>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* Portfolio Section - Enhanced for Mobile */}
            {portfolioContent.images?.length > 0 && (
              <section
                className="w-full my-8 md:my-12 px-0"
                id="portfolio"
                ref={portfolioRef}
              >
                <div className="flex justify-between items-center mb-4 md:mb-8">
                  <h2 className="text-lg md:text-2xl font-bold">Portfolio</h2>
                </div>

                <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4 md:grid-rows-2">
                  {portfolioContent.images
                    .slice(0, 6)
                    .map((image: any, index: number) => {
                      // Define grid positions for bento layout
                      const gridClasses = [
                        "md:row-span-2 md:col-span-2 col-span-2 row-span-1", // Large top-left
                        "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                        "md:row-span-1 md:col-span-1 col-span-1", // Top-right small
                        "md:row-span-2 md:col-span-2 col-span-2 row-span-1 md:col-start-3 md:row-start-1", // Large bottom
                        "md:row-span-1 md:col-span-1 col-span-1", // Bottom-left small
                        "md:row-span-1 md:col-span-1 col-span-1", // Bottom-right small
                      ];

                      const isVideo =
                        image.url &&
                        (image.url.includes(".mp4") ||
                          image.url.includes(".webm") ||
                          image.url.includes(".ogg"));

                      return (
                        <div
                          key={index}
                          className={`bg-gray-100 border rounded-xl shadow-sm flex items-center justify-center hover:shadow transition-shadow bg-center bg-cover relative overflow-hidden ${gridClasses[index] || "md:row-span-1 md:col-span-1"} ${index === 0 || index === 3 ? "min-h-[140px] md:min-h-[180px]" : "min-h-[100px] md:min-h-[120px]"}`}
                          style={{
                            aspectRatio:
                              index === 0 || index === 3 ? "2/1" : "1/1",
                          }}
                        >
                          {isVideo ? (
                            <video
                              src={image.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              style={{ pointerEvents: "none" }}
                            />
                          ) : image.url ? (
                            <img
                              src={getOptimizedImageUrl(image.url, {
                                width: index === 0 || index === 3 ? 600 : 300,
                                height: index === 0 || index === 3 ? 300 : 300,
                                quality: 85,
                                format: "auto",
                                crop: "fill",
                                gravity: "auto",
                              })}
                              srcSet={generateSrcSet(image.url)}
                              sizes={
                                index === 0 || index === 3
                                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  : "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                              }
                              alt={image.alt || "Portfolio image"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span
                              className={`flex items-center justify-center rounded-full bg-gray-200 ${index === 0 || index === 3 ? "w-[60px] h-[60px] md:w-20 md:h-20" : "w-10 h-10 md:w-14 md:h-14"}`}
                            >
                              <Image
                                className={`text-gray-400 ${index === 0 || index === 3 ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6 md:w-8 md:h-8"}`}
                              />
                            </span>
                          )}

                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black bg-opacity-50 rounded-full p-2">
                                <svg
                                  className="w-4 h-4 md:w-6 md:h-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* About Us Text & Opening Hours (Moved to Main Content) */}
            <section className="w-full py-8 md:py-12 bg-white rounded-3xl shadow-sm px-6 md:px-8">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* Left Side: About Us */}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold mb-3">
                    About Us
                  </h2>
                  <p className="text-gray-700 md:text-base text-sm leading-relaxed whitespace-pre-line">
                    {business.about ||
                      "We are a leading business offering top quality products and services to our customers. Our mission is to deliver excellence and build lasting relationships."}
                  </p>
                </div>
                {/* Separator */}
                <div className="hidden md:flex flex-col items-center justify-center">
                  <Separator orientation="vertical" className="h-32" />
                </div>
                {/* Right Side: Opening Hours & GST Number */}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Opening Hours & Details
                  </h2>
                  <div className="space-y-4 flex justify-between">
                    <div>
                      <Label className="flex flex-2  text-gray-600 mb-1">
                        Opening Hours
                      </Label>
                      {business.openingHours &&
                      business.openingHours.length > 0 ? (
                        <ul className="text-sm flex-1 text-gray-800">
                          {business.openingHours.map(
                            (item: any, idx: number) => (
                              <li
                                key={idx}
                                className="flex flex-1 gap-5 justify-between items-center py-0.5"
                              >
                                <span className="font-medium">{item.day}</span>
                                <span></span>
                                <span></span>
                                <span>
                                  {item.open && item.close
                                    ? `${item.open} - ${item.close}`
                                    : "Closed"}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">Not provided</p>
                      )}
                    </div>
                    <div>
                      <Label className="block text-gray-600 mb-1">
                        GST Number
                      </Label>
                      <p className="text-sm text-gray-800">
                        {business.gstNumber || (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Mobile Menu - Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
            <div className="flex justify-around items-center h-16 px-2">
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeSection === "home"
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">Home</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeSection === "about"
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() =>
                  scrollToSection(
                    aboutRef as React.RefObject<HTMLDivElement>,
                    "about",
                  )
                }
              >
                <User className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">About</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeSection === "brands"
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() =>
                  scrollToSection(
                    brandsRef as React.RefObject<HTMLDivElement>,
                    "brands",
                  )
                }
              >
                <Grid3X3 className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">Brands</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeSection === "products"
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() =>
                  scrollToSection(
                    productsRef as React.RefObject<HTMLDivElement>,
                    "products",
                  )
                }
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">Products</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  activeSection === "portfolio"
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                onClick={() =>
                  scrollToSection(
                    portfolioRef as React.RefObject<HTMLDivElement>,
                    "portfolio",
                  )
                }
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium">Portfolio</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={inquiryModal} onOpenChange={setInquiryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct
                ? `Inquire about ${selectedProduct.name}`
                : "Get in Touch"}
            </DialogTitle>
            <DialogDescription>
              Send us a message and we'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInquiry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={inquiryData.name}
                onChange={(e) =>
                  setInquiryData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={inquiryData.email}
                onChange={(e) =>
                  setInquiryData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={inquiryData.phone}
                onChange={(e) =>
                  setInquiryData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={inquiryData.message}
                onChange={(e) =>
                  setInquiryData((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={4}
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {selectedProductModal?.name}
            </DialogTitle>
            <DialogDescription>
              Product details and related items
            </DialogDescription>
          </DialogHeader>

          {selectedProductModal && (
            <div className="space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm ">
                  {selectedProductModal.image &&
                  selectedProductModal.image.trim() !== "" ? (
                    <img
                      src={getOptimizedImageUrl(selectedProductModal.image, {
                        width: 600,
                        height: 400,
                        quality: 90,
                        format: "auto",
                        crop: "fill",
                        gravity: "center",
                      })}
                      srcSet={generateSrcSet(selectedProductModal.image)}
                      sizes="(max-width: 768px) 100vw, 600px"
                      alt={selectedProductModal.name}
                      className="w-full h-full object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <Image className="h-16 w-16 md:h-24 md:w-24 text-gray-400" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 text-white right-3 ${
                      selectedProductModal.inStock
                        ? "bg-linear-to-l from-gray-900 to-lime-900"
                        : "bg-linear-to-l from-gray-900 to-red-900"
                    } text-white border-0`}
                  >
                    {selectedProductModal.inStock ? (
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>{" "}
                        In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                        </span>{" "}
                        Out of Stock
                      </span>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedProductModal.brandName && (
                    <Badge variant="outline" className="text-sm">
                      {selectedProductModal.brandName}
                    </Badge>
                  )}
                  {selectedProductModal.category && (
                    <Badge variant="outline" className="text-sm">
                      {selectedProductModal.category.name}
                    </Badge>
                  )}
                </div>

                {selectedProductModal.price && (
                  <div className="text-2xl font-bold text-green-600">
                    {selectedProductModal.price}
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProductModal.description ||
                      "No description available"}
                  </p>
                </div>

                {/* Additional Information Section */}
                {selectedProductModal.additionalInfo &&
                  Object.keys(selectedProductModal.additionalInfo).length >
                    0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Additional Information
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                                Property
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {Object.entries(
                              selectedProductModal.additionalInfo,
                            ).map(([key, value], index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm font-medium text-gray-900 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Products Components</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {relatedProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden pt-0 bg-white hover:shadow-lg transition-shadow duration-300 pb-2 cursor-pointer"
                        onClick={() => setSelectedProductModal(product)}
                      >
                        <div className="relative h-32 md:h-48">
                          {product.image && product.image.trim() !== "" ? (
                            <img
                              src={getOptimizedImageUrl(product.image, {
                                width: 400,
                                height: 300,
                                quality: 85,
                                format: "auto",
                                crop: "fill",
                                gravity: "center",
                              })}
                              srcSet={generateSrcSet(product.image)}
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                              alt={product.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Image className="h-10 w-10 md:h-16 md:w-16 text-gray-400" />
                            </div>
                          )}
                          <Badge
                            className={`absolute top-3 text-white right-3 ${
                              selectedProductModal.inStock
                                ? "bg-linear-to-l from-gray-900 to-lime-900"
                                : "bg-linear-to-l from-gray-900 to-red-900"
                            } text-white border-0`}
                          >
                            {product.inStock ? (
                              <span className="flex items-center gap-1">
                                {product.inStock && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                )}{" "}
                                In Stock
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>{" "}
                                Out of Stock
                              </span>
                            )}
                          </Badge>
                        </div>
                        <CardHeader className="pb-2 px-2 md:px-3 ">
                          <CardTitle className="text-xs  md:text-lg line-clamp-1">
                            {product.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 px-2 md:px-3 ">
                          <div className="flex flex-row flex-nowrap gap-1 mb-2 md:mb-3 overflow-x-auto hide-scrollbar">
                            {product.brandName && (
                              <Badge
                                variant="outline"
                                className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max"
                              >
                                {product.brandName}
                              </Badge>
                            )}
                            {product.category && (
                              <Badge
                                variant="outline"
                                className="text-[8px] md:text-xs px-1 md:px-2 py-0.5 h-4 md:h-5 min-w-max"
                              >
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mb-2 md:mb-4 text-[10px]  md:text-sm leading-relaxed line-clamp-2">
                            {product.description || "No description available"}
                          </CardDescription>
                          <Button
                            className="w-full mt-auto bg-green-500 hover:bg-green-700 cursor-pointer text-xs md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (business.phone) {
                                const productLink = `${window.location.origin}/catalog/${business.slug}?product=${product.id}&modal=open`;
                                const message = `${product.name}\n\nDescription: ${product.description}\n\nLink: ${productLink}`;
                                const whatsappUrl = `https://wa.me/${business.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
                                try {
                                  window.open(whatsappUrl, "_blank");
                                } catch (error) {
                                  alert(
                                    "Unable to open WhatsApp. Please ensure WhatsApp is installed or try on a mobile device.",
                                  );
                                }
                              } else {
                                alert("Phone number not available");
                              }
                            }}
                          >
                            Inquire Now
                            <SiWhatsapp className=" h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
