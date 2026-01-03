// app/pcard/[slug]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

// Define Professional type since Prisma doesn't export it for MongoDB
interface Professional {
  id: string;
  name: string;
  slug: string;
  professionalHeadline: string | null;
  aboutMe: string | null;
  profilePicture: string | null;
  banner: string | null;
  resume: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  adminId: string;
  workExperience: any;
  education: any;
  certifications: any;
  skills: any;
  servicesOffered: any;
  contactInfo: any;
  portfolio: any;
  contactDetails: any;
  ctaButton: any;
}

import { Button } from "@/components/ui/button";
import { useOptimizedImage } from "@/lib/image-optimization";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Send,
  X,
  MessageCircle,
  User,
  Building2,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Home,
  Users,
  Image as ImageIcon,
  Download,
  FileText,
  Share2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiLinkedin,
  SiWhatsapp,
} from "react-icons/si";

interface ProfessionalProfileProps {
  professional: Professional & {
    admin: { name?: string | null; email: string };
  };
}

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ProfessionalProfile({
  professional: initialProfessional,
}: ProfessionalProfileProps) {
  const searchParams = useSearchParams();
  const {
    themeSettings,
    getBackgroundClass,
    getCardClass,
    getButtonClass,
    getPrimaryColor,
    getBorderRadius,
  } = useTheme();
  const [professional, setProfessional] = useState(initialProfessional);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryData, setInquiryData] = useState<InquiryFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [currentView, setCurrentView] = useState<
    "home" | "about" | "services" | "portfolio" | "contact"
  >("home");

  // Ensure skills and servicesOffered are arrays
  const skills = Array.isArray(professional.skills) ? professional.skills : [];
  console.log('Skills array:', skills);
  const servicesOffered = Array.isArray(professional.servicesOffered) ? professional.servicesOffered : [];
  console.log('Services array:', servicesOffered);
  const portfolio = Array.isArray(professional.portfolio) ? professional.portfolio : [];
  const workExperience = Array.isArray(professional.workExperience) ? professional.workExperience : [];
  const validWorkExperience = workExperience.filter(exp => exp && typeof exp === 'object');
  console.log('workExperience:', workExperience);
  console.log('validWorkExperience:', validWorkExperience);
  const education = Array.isArray(professional.education) ? professional.education : [];
  const certifications = Array.isArray(professional.certifications) ? professional.certifications : [];

  const calculateTotalTime = (duration: any) => {
    console.log('calculateTotalTime called with:', duration, typeof duration);
    if (!duration || typeof duration !== 'string') {
      console.log('Returning N/A for duration:', duration);
      return "N/A";
    }
    const match = duration.match(/(\d{4})\s*-\s*(\d{4})/);
    console.log('Match result:', match);
    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      const years = end - start;
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
    return duration;
  };

  // Refs for smooth scrolling
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time synchronization
  useEffect(() => {
    if (!mounted || !professional?.id) return;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(
          `/api/professionals?${
            professional.slug
              ? `slug=${professional.slug}`
              : `id=${professional.id}`
          }`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          const updatedProfessional = data.professional;

          const hasChanged =
            updatedProfessional.updatedAt !== professional.updatedAt ||
            updatedProfessional.name !== professional.name ||
            updatedProfessional.professionalHeadline !==
              professional.professionalHeadline ||
            updatedProfessional.aboutMe !== professional.aboutMe ||
            updatedProfessional.profilePicture !==
              professional.profilePicture ||
            updatedProfessional.banner !== professional.banner ||
            updatedProfessional.location !== professional.location ||
            updatedProfessional.phone !== professional.phone ||
            updatedProfessional.email !== professional.email ||
            updatedProfessional.website !== professional.website ||
            updatedProfessional.facebook !== professional.facebook ||
            updatedProfessional.twitter !== professional.twitter ||
            updatedProfessional.instagram !== professional.instagram ||
            updatedProfessional.linkedin !== professional.linkedin ||
            JSON.stringify(updatedProfessional.workExperience) !==
              JSON.stringify(professional.workExperience) ||
            JSON.stringify(updatedProfessional.education) !==
              JSON.stringify(professional.education) ||
            JSON.stringify(updatedProfessional.certifications) !==
              JSON.stringify(professional.certifications) ||
            JSON.stringify(updatedProfessional.skills) !==
              JSON.stringify(professional.skills) ||
            JSON.stringify(updatedProfessional.servicesOffered) !==
              JSON.stringify(professional.servicesOffered) ||
            JSON.stringify(updatedProfessional.portfolio) !==
              JSON.stringify(professional.portfolio);

          if (hasChanged) {
            setProfessional(updatedProfessional);
            console.log("Professional data updated from server");
          }
        }
      } catch (error) {
        console.warn("Failed to check for professional updates:", error);
      }
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 5000);

    return () => clearInterval(interval);
  }, [mounted, professional?.id, professional?.slug]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const errors: string[] = [];

      if (!inquiryData.name.trim()) {
        errors.push("Name is required");
      } else if (inquiryData.name.trim().length < 2) {
        errors.push("Name must be at least 2 characters long");
      } else if (inquiryData.name.trim().length > 100) {
        errors.push("Name must be less than 100 characters");
      }

      if (!inquiryData.email.trim()) {
        errors.push("Email is required");
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(inquiryData.email.trim())) {
          errors.push("Please enter a valid email address");
        }
      }

      if (inquiryData.phone.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(inquiryData.phone.replace(/[\s\-\(\)]/g, ""))) {
          errors.push("Please enter a valid phone number");
        }
      }

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
          businessId: null,
          userId: null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Inquiry submitted successfully! We will get back to you soon.");
        setInquiryModal(false);
        setInquiryData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert(
          `Failed to submit inquiry: ${result.error || "Please try again."}`
        );
      }
    } catch (error) {
      console.error("Inquiry submission error:", error);
      alert(
        "An error occurred while submitting your inquiry. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    sectionName: string
  ) => {
    setActiveSection(sectionName);
    if (ref.current) {
      const offset = 80;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

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
      { threshold: 0.3 }
    );

    const sections = [
      aboutRef.current,
      servicesRef.current,
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

  useEffect(() => {
    if (currentView !== "home") {
      setActiveSection(currentView);
    }
  }, [currentView]);

  const ProfileCard = () => {
    const bannerImage = useOptimizedImage(professional.banner, 400, 200);
    const profileImage = useOptimizedImage(
      professional.profilePicture,
      128,
      128
    );

    return (
      <Card
        className={`${getCardClass()} h-[700px] bg-linear-to-t from-sky-100 via-white to-white rounded-xl p-4 shadow-lg border-0 overflow-hidden`}
      >
        {/* Banner */}
        <div className="relative h-auto bg-linear-to-r from-sky-200 to-sky-300 aspect-3/1 rounded-2xl overflow-hidden">
          {professional.banner && (
            <img
              src={bannerImage.src}
              srcSet={bannerImage.srcSet}
              sizes={bannerImage.sizes}
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Profile Image */}
        <div className="relative -mt-8 flex justify-center">
          {professional.profilePicture ? (
            <img
              src={profileImage.src}
              srcSet={profileImage.srcSet}
              sizes={profileImage.sizes}
              alt={professional.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
              <User className="w-16 h-16 text-gray-600" />
            </div>
          )}
        </div>

        <CardContent className="text-center flex flex-col px-0">
          <div className=" pb-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {professional.name}
            </h1>
            {professional.professionalHeadline && (
              <p className="text-gray-600 mb-4">
                {professional.professionalHeadline}
              </p>
            )}
            {professional.location && (
              <div className="flex items-center justify-center mb-6">
                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {professional.location}
                </span>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {professional.phone && (
              <Button
                onClick={() =>
                  window.open(`tel:${professional.phone}`, "_self")
                }
                className={`flex items-center w-auto bg-sky-400 hover:bg-sky-500 cursor-pointer shadow-sm text-white ${getBorderRadius()} px-4 py-2`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Make Call
              </Button>
            )}
            {professional.phone && (
              <Button
                onClick={() =>
                  window.open(
                    `https://wa.me/${professional.phone!.replace(/\D/g, "")}`,
                    "_blank"
                  )
                }
                className={`flex items-center w-auto bg-green-400 hover:bg-green-500 cursor-pointer shadow-sm text-white ${getBorderRadius()} px-4 py-2`}
              >
                <FaWhatsapp className="w-8 h-8 mr-2 font-extrabold" />
                WhatsApp
              </Button>
            )}
            {professional.email && (
              <Button
                onClick={() =>
                  window.open(`mailto:${professional.email}`, "_self")
                }
                className={`flex items-center bg-blue-500 hover:bg-blue-600 cursor-pointer text-white shadow-sm ${getBorderRadius()} px-4 py-2`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
          </div>

          {/* Additional Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {professional.resume ? (
              <Button
                onClick={() => window.open(professional.resume!, '_blank')}
                className={`flex flex-row gap-2 items-center shadow-sm text-gray-700 space-y-1 p-3 bg-white ${getBorderRadius()} hover:bg-sky-200 cursor-pointer transition-colors`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                className={`flex flex-row gap-2 items-center shadow-sm text-gray-400 space-y-1 p-3 bg-gray-100 ${getBorderRadius()} cursor-not-allowed transition-colors`}
                disabled
              >
                <FileText className="w-4 h-4 mr-2" />
                No Resume
              </Button>
            )}
            <Button
              className={`flex flex-row gap-2 items-center text-gray-700 space-y-1 p-3 bg-white ${getBorderRadius()} hover:bg-sky-200 cursor-pointer transition-colors`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Card
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-5 mb-6">
            {professional.facebook && (
              <a
                href={professional.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 bg-linear-to-b from-sky-100 to-white ${getBorderRadius()} hover:from-sky-200 hover:to-gray-50 border shadow-sm flex items-center justify-center transition-colors`}
              >
                <SiFacebook className="w-6 h-6 text-blue-600" />
              </a>
            )}
            {professional.twitter && (
              <a
                href={professional.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 bg-linear-to-b from-sky-100 to-white ${getBorderRadius()} hover:from-sky-200 hover:to-gray-50 border shadow-sm flex items-center justify-center transition-colors`}
              >
                <SiX className="w-6 h-6 text-black" />
              </a>
            )}
            {professional.instagram && (
              <a
                href={professional.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 bg-linear-to-b from-sky-100 to-white ${getBorderRadius()} hover:from-sky-200 hover:to-gray-50 border shadow-sm flex items-center justify-center transition-colors`}
              >
                <SiInstagram className="w-6 h-6 text-pink-600" />
              </a>
            )}
            {professional.linkedin && (
              <a
                href={professional.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 bg-linear-to-b from-sky-100 to-white ${getBorderRadius()} hover:from-sky-200 hover:to-gray-50 border shadow-sm flex items-center justify-center transition-colors`}
              >
                <SiLinkedin className="w-6 h-6 text-blue-700" />
              </a>
            )}
          </div>

          {/* Share Button */}
          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${professional.name} - Professional Profile`,
                  text: `Check out ${professional.name}'s professional profile`,
                  url: window.location.href,
                });
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                  alert("Profile link copied to clipboard!");
                });
              }
            }}
            className={`w-full mb-5 flex items-center cursor-pointer justify-center bg-white shadow-md hover:bg-sky-200 text-gray-700 ${getBorderRadius()} p-3 transition-colors`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>

          {/* Footer Note */}
          <p className="text-xs text-gray-500">
            Profile Created By @DigiSence.io
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} ${
        themeSettings.fontFamily
      } ${themeSettings.fontSize}`}
      suppressHydrationWarning
    >
      {/* Top Navigation Bar - Desktop */}
      <nav className="hidden md:block fixed top-4 left-1/2 max-w-7xl w-screen transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between mx-auto">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-lg font-bold text-gray-900">
              {professional.name}
            </span>
          </div>

          {/* Center Navigation */}
          <div className="flex space-x-8">
            <button
              className="flex items-center text-sm font-medium transition-colors text-gray-600 hover:text-gray-800"
              onClick={() => {
                setCurrentView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
            <button
              className="flex items-center text-sm font-medium transition-colors text-gray-600 hover:text-gray-800"
              onClick={() => setCurrentView("about")}
            >
              <User className="w-4 h-4 mr-2" />
              About
            </button>
            <button
              className="flex items-center text-sm font-medium transition-colors text-gray-600 hover:text-gray-800"
              onClick={() => setCurrentView("services")}
            >
              <Users className="w-4 h-4 mr-2" />
              Services
            </button>
            <button
              className="flex items-center text-sm font-medium transition-colors text-gray-600 hover:text-gray-800"
              onClick={() => setCurrentView("portfolio")}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Portfolio
            </button>
          </div>

          {/* Right Side */}
          <Button
            onClick={() => setCurrentView("contact")}
            className={`bg-sky-600 hover:bg-sky-700 text-white ${getBorderRadius()} px-4 py-2 shadow-md`}
          >
            Let's Talk
          </Button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeSection === "home"
                ? "text-sky-500 bg-sky-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => {
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeSection === "about"
                ? "text-sky-500 bg-sky-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setCurrentView("about")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">About</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeSection === "services"
                ? "text-sky-500 bg-sky-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setCurrentView("services")}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Services</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeSection === "portfolio"
                ? "text-sky-500 bg-sky-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setCurrentView("portfolio")}
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Portfolio</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              activeSection === "contact"
                ? "text-sky-500 bg-sky-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setCurrentView("contact")}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Contact</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-8 md:pt-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {currentView === "about" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <ProfileCard />
              </div>
              {/* About Card */}
              <div className="md:col-span-2">
                <Card
                  className={`${getCardClass()} rounded-2xl p-6 shadow-lg border-0 h-full`}
                >
                  <CardContent className="p-0">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">
                      About
                    </h2>
                    <div className="space-y-6">
                      {/* About Me Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                          <User className="w-5 h-5 mr-2 text-sky-600" />
                          About Me
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {professional.aboutMe ||
                            "No about information available."}
                        </p>
                      </div>

                      {/* Education Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-sky-600" />
                          Education
                        </h3>
                        {professional.education &&
                        professional.education.length > 0 ? (
                          <div className="space-y-4">
                            {professional.education.map(
                              (edu: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5 text-sky-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {edu.degree || edu.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {edu.institution || edu.school}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {edu.year || edu.duration}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            No education information available.
                          </p>
                        )}
                      </div>

                      {/* Certifications Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-sky-600" />
                          Certifications
                        </h3>
                        {professional.certifications &&
                        professional.certifications.length > 0 ? (
                          <div className="space-y-4">
                            {professional.certifications.map(
                              (cert: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5 text-sky-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {cert.name || cert.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {cert.issuer || cert.organization}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {cert.year || cert.date}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            No certifications available.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : currentView === "services" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <ProfileCard />
              </div>
              {/* Services Card */}
              <div className="md:col-span-2">
                <Card
                  className={`${getCardClass()} p-6 rounded-2xl shadow-lg border-0`}
                >
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">
                        Services
                      </h2>
                      <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {servicesOffered
                          .slice(0, 5)
                        .map((service: any, index: number) => (
                          <div
                            key={index}
                            className={`flex flex-col items-center p-4 bg-gray-50 ${getBorderRadius()} hover:bg-gray-100 transition-colors`}
                          >
                            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-3">
                              <Award className="w-6 h-6 text-sky-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 text-center">
                              {service.name?.name || service.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : currentView === "portfolio" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <ProfileCard />
              </div>
              {/* Portfolio Card */}
              <div className="md:col-span-2">
                <Card
                  className={`${getCardClass()} rounded-2xl p-6 shadow-lg border-0 h-full`}
                >
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-slate-800">
                        Portfolio
                      </h2>
                      <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="space-y-4">
                          {portfolio
                            .slice(0, 2)
                        .map((item: any, index: number) => {
                          const isVideo = item.type === 'video' || (item.url && (item.url.includes('.mp4') || item.url.includes('.webm') || item.url.includes('.ogg')));
                          return (
                            <div
                              key={index}
                              className="relative p-7 px-10 bg-linear-to-t border from-sky-100/80 to-transparent rounded-xl overflow-hidden"
                            >
                              <div className="relative bg-white h-full w-full border top-full -bottom-10 aspect-4/3 rounded-t-lg overflow-hidden">
                                {isVideo ? (
                                  <video
                                    src={item.url}
                                    controls
                                    className="h-full w-full object-cover absolute -bottom-2"
                                    poster={item.thumbnail || undefined}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  (() => {
                                    const optimizedImage = useOptimizedImage(
                                      item.url,
                                      400,
                                      250
                                    );
                                    return (
                                      <img
                                        src={optimizedImage.src}
                                        srcSet={optimizedImage.srcSet}
                                        sizes={optimizedImage.sizes}
                                        alt={item.title}
                                        className="h-full p-0 object-cover absolute -bottom-2"
                                      />
                                    );
                                  })()
                                )}
                              </div>
                              <div className="absolute bottom-3 left-3 border bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  {item.title}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : currentView === "contact" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <ProfileCard />
              </div>
              {/* Contact Card */}
              <div className="md:col-span-2">
                <Card
                  className={`${getCardClass()} p-6 rounded-2xl shadow-lg border-0`}
                >
                  <CardContent className="p-0">
                          <h2 className="text-xl font-bold text-slate-800 mb-4">
                      Let's Talk
                    </h2>
                    <div className="w-full h-12 bg-gray-100 rounded-2xl"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <>
              {/* Main Grid */}
              <div className="grid grid-cols-1 relative md:grid-cols-3 gap-6 mb-12">
                {/* Left Column - Profile Card */}
                <div ref={aboutRef} id="about" className="md:col-span-1">
                  <ProfileCard />
                </div>
                {/* Middle Column */}
                <div className="md:col-span-1 space-y-6">
                  <div className="h-[700px] flex gap-5 flex-col">
                    {/* Work Experience */}
                    <Card
                      className={`${getCardClass()} rounded-2xl p-6 h-[50%] shadow-lg border-0`}
                    >
                      <CardContent className="p-0 overflow-hidden h-full">
                        <div className="flex justify-between items-center mb-5">
                                  <h2 className="text-xl font-bold text-slate-800">
                            Work Experience
                          </h2>
                          <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                        <div className="overflow-hidden">
                          <div
                            className={`flex flex-col space-y-4 ${
                                      workExperience.length > 3
                                ? "animate-marquee"
                                : ""
                            }`}
                          >
                                    {console.log('workExperience:', workExperience)}
                                    {validWorkExperience.map(
                                      (exp: any, index: number) => {
                                return (
                                  <div
                                    key={`exp-${index}`}
                                    className="flex items-start space-x-4 rounded-lg"
                                  >
                                    <div className="w-15 h-15 bg-linear-to-b from-sky-50 to-white rounded-lg flex items-center justify-center shrink-0 border border-gray-700/10">
                                      <Building2 className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div className="flex-1 flex justify-items-end gap-1 w-full">
                                      <div className="grid grid-cols-1 gap-1">
                                        <p className="text-gray-900 font-medium text-sm">
                                          {exp.company}
                                        </p>
                                        <p className="text-gray-700 text-xs">
                                          {exp.position}
                                        </p>
                                        <p className="text-gray-600 text-xs">
                                          {exp.location}
                                        </p>
                                      </div>
                                      <div className="flex items-end flex-col ml-auto justify-between mt-2">
                                        <span className="text-gray-500 text-xs">
                                          {exp.duration}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          Total:{" "}
                                          {exp.duration ? calculateTotalTime(exp.duration) : "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                            {professional.workExperience &&
                                      validWorkExperience.length > 3 &&
                                      validWorkExperience.map(
                                        (exp: any, index: number) => {
                                  return (
                                    <div
                                      key={`exp-dup-${index}`}
                                      className="flex items-start space-x-4 rounded-lg"
                                    >
                                      <div className="w-15 h-15 bg-linear-to-b from-sky-50 to-white rounded-lg flex items-center justify-center border border-gray-700/10 shrink-0 shadow-sm">
                                        <Building2 className="w-5 h-5 text-sky-600" />
                                      </div>
                                      <div className="flex-1 flex justify-items-end gap-1 w-full">
                                        <div className="grid grid-cols-1 gap-1">
                                          <p className="text-gray-900 font-medium text-sm">
                                            {exp.company}
                                          </p>
                                          <p className="text-gray-700 text-xs">
                                            {exp.position}
                                          </p>
                                          <p className="text-gray-600 text-xs">
                                            {exp.location}
                                          </p>
                                        </div>
                                        <div className="flex items-end flex-col ml-auto justify-between mt-2">
                                          <span className="text-gray-500 text-xs">
                                            {exp.duration}
                                          </span>
                                          <span className="text-gray-400 text-xs">
                                            Total:{" "}
                                            {exp.duration ? calculateTotalTime(exp.duration) : "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card
                      className={`${getCardClass()} rounded-2xl h-full p-6 shadow-lg border-0`}
                    >
                      <CardContent className="p-0">
                        <div className="flex justify-between items-center mb-5">
                                  <h2 className="text-xl font-bold text-slate-800">
                            Expert Area
                          </h2>
                          <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3 overflow-hidden">
                                  {skills
                                    .slice(0, 12)
                                    .map((skill: any, index: number) => (
                              <div
                                key={index}
                                className={`flex items-center bg-white ${getBorderRadius()} px-4 py-1 border border-gray-200`}
                              >
                                <Award className="w-5 h-5 text-sky-600 mr-2" />
                                <span className="text-sm text-gray-700">
                                          {skill.name?.name || skill.name}
                                </span>
                              </div>
                            ))}
                                  {skills.length > 12 && (
                                    <div
                                      className={`flex items-center bg-white ${getBorderRadius()} px-4 py-2 border border-gray-200`}
                                    >
                                      <span className="text-sm text-gray-700">
                                        ...
                                      </span>
                                    </div>
                                  )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Right Column - Portfolio */}
                <div className="md:col-span-1">
                  <Card
                    className={`${getCardClass()} rounded-2xl p-6 shadow-lg border-0 h-full`}
                  >
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">
                          Portfolio
                        </h2>
                        <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                          View All <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                      <div className="space-y-4">
                                {portfolio
                                  .slice(0, 2)
                          .map((item: any, index: number) => {
                            const isVideo = item.type === 'video' || (item.url && (item.url.includes('.mp4') || item.url.includes('.webm') || item.url.includes('.ogg')));
                            return (
                              <div
                                key={index}
                                className="relative p-7 px-10 bg-linear-to-t border from-sky-100/80 to-transparent rounded-xl overflow-hidden"
                              >
                                <div className="relative bg-white h-full w-full border top-full -bottom-10 aspect-4/3 rounded-t-lg overflow-hidden">
                                  {isVideo ? (
                                    <video
                                      src={item.url}
                                      controls
                                      className="h-full w-full object-cover absolute -bottom-2"
                                      poster={item.thumbnail || undefined}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    (() => {
                                        const optimizedImage = useOptimizedImage(
                                          item.url,
                                          400,
                                          250
                                        );
                                        return (
                                          <img
                                            src={optimizedImage.src}
                                            srcSet={optimizedImage.srcSet}
                                            sizes={optimizedImage.sizes}
                                            alt={item.title}
                                            className="h-full object-cover absolute -bottom-2"
                                          />
                                      );
                                    })()
                                  )}
                                </div>
                                <div className="absolute bottom-3 left-3 border bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {item.title}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Services Section - 2 cols */}
                <div ref={servicesRef} id="services" className="md:col-span-2">
                  <Card
                    className={`${getCardClass()} p-6 rounded-2xl shadow-lg border-0`}
                  >
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">
                          Services
                        </h2>
                        <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
                          View All <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {servicesOffered
                                  .slice(0, 5)
                          .map((service: any, index: number) => (
                            <div
                              key={index}
                              className={`flex flex-col items-center p-4 bg-gray-50 ${getBorderRadius()} hover:bg-gray-100 transition-colors`}
                            >
                              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-sky-600" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 text-center">
                                {service.name}
                              </span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Let's Talk Section - 1 col */}
                <div ref={contactRef} id="contact">
                  <Card
                    className={`${getCardClass()} p-6 rounded-2xl shadow-lg border-0`}
                  >
                    <CardContent className="p-0">
                              <h2 className="text-xl font-bold text-slate-800 mb-4">
                        Let's Talk
                      </h2>
                      <div className="w-full h-12 bg-gray-100 rounded-2xl"></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-linear-to-r py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium">
            Developed By{" "}
            <a
              href="https://digiconnunite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors duration-200 font-semibold"
            >
              Digiconn Unite Pvt. Ltd.
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2025 All rights reserved.
          </p>
        </div>
      </footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `,
        }}
      />

      {/* Inquiry Modal */}
      <Dialog open={inquiryModal} onOpenChange={setInquiryModal}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Contact {professional.name}</DialogTitle>
            <DialogDescription>
              Send a message and we'll get back to you soon.
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
                className={getBorderRadius()}
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
                className={getBorderRadius()}
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
                className={getBorderRadius()}
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
                className={getBorderRadius()}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 ${getButtonClass()}`}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInquiryModal(false)}
                className={getBorderRadius()}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
