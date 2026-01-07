"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import {
  ArrayFieldManager,
  WorkExperienceForm,
  EducationForm,
  SkillForm,
  ServiceForm,
  PortfolioItemForm,
} from "@/components/ui/array-field-manager";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Building,
  MessageSquare,
  Key,
  BarChart3,
  FileText,
  Mail,
  Shield,
  Search,
  Download,
  Settings,
  Package,
  TrendingUp,
  Activity,
  Crown,
  Globe,
  UserCheck,
  AlertTriangle,
  Home,
  Grid3X3,
  FolderTree,
  MessageCircle,
  LineChart,
  Cog,
  MoreHorizontal,
  LogOut,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Image,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: string;
    email: string;
    name?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
    inquiries: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  _count: {
    businesses: number;
  };
}

interface AdminStats {
  totalBusinesses: number;
  totalInquiries: number;
  totalUsers: number;
  activeBusinesses: number;
  totalProducts: number;
  totalActiveProducts: number;
  totalProfessionals: number;
  activeProfessionals: number;
}

interface Professional {
  id: string;
  name: string;
  slug: string;
  professionalHeadline: string | null;
  aboutMe: string | null;
  profilePicture: string | null;
  banner: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  workExperience?: any[];
  education?: any[];
  skills?: string[];
  servicesOffered?: any[];
  portfolio?: any[];
  admin: {
    id: string;
    email: string;
    name?: string;
  };
}

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [businessListingInquiries, setBusinessListingInquiries] = useState<
    any[]
  >([]);
  const [registrationInquiries, setRegistrationInquiries] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalBusinesses: 0,
    totalInquiries: 0,
    totalUsers: 0,
    activeBusinesses: 0,
    totalProducts: 0,
    totalActiveProducts: 0,
    totalProfessionals: 0,
    activeProfessionals: 0,
  });
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<
    | "add-business"
    | "edit-business"
    | "add-professional"
    | "edit-professional"
    | "add-category"
    | "edit-category"
    | "create-account-from-inquiry"
    | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [deleteBusiness, setDeleteBusiness] = useState<Business | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedBusinessListingInquiry, setSelectedBusinessListingInquiry] =
    useState<any>(null);
  const [
    showBusinessListingInquiryDialog,
    setShowBusinessListingInquiryDialog,
  ] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);

  // Professional form state
  const [professionalWorkExperience, setProfessionalWorkExperience] = useState<
    any[]
  >([]);
  const [professionalEducation, setProfessionalEducation] = useState<any[]>([]);
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([]);
  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [professionalPortfolio, setProfessionalPortfolio] = useState<any[]>([]);
  const [professionalSocialMedia, setProfessionalSocialMedia] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  // Responsive design hook
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Authentication check
  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
      router.push("/login");
      return;
    }

    if (user?.role === "SUPER_ADMIN") {
      fetchData();
    }
  }, [user, loading, router]);

  // Memoized filtered data
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && business.isActive) ||
        (filterStatus === "inactive" && !business.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchTerm, filterStatus]);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const filteredStats = useMemo(() => {
    return {
      total: filteredBusinesses.length,
      active: filteredBusinesses.filter((b) => b.isActive).length,
      inactive: filteredBusinesses.filter((b) => !b.isActive).length,
    };
  }, [filteredBusinesses]);

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setDataFetchError(null);

      // Use Promise.allSettled to handle partial failures
      const [
        businessesResult,
        categoriesResult,
        inquiriesResult,
        professionalsResult,
        businessListingInquiriesResult,
        registrationInquiriesResult,
      ] = await Promise.allSettled([
        fetch("/api/admin/businesses"),
        fetch("/api/admin/categories"),
        fetch("/api/inquiries"),
        fetch("/api/professionals"),
        fetch("/api/business-listing-inquiries"),
        fetch("/api/registration-inquiries"),
      ]);

      // Process businesses data
      if (
        businessesResult.status === "fulfilled" &&
        businessesResult.value.ok
      ) {
        const data = await businessesResult.value.json();
        console.log("Fetched businesses:", data.businesses.length);
        setBusinesses(data.businesses);

        // Calculate stats
        const totalInquiries = data.businesses.reduce(
          (sum: number, b: Business) => sum + b._count.inquiries,
          0
        );
        const totalProducts = data.businesses.reduce(
          (sum: number, b: Business) => sum + b._count.products,
          0
        );
        const activeBusinesses = data.businesses.filter(
          (b) => b.isActive
        ).length;
        const totalActiveProducts = data.businesses
          .filter((b) => b.isActive)
          .reduce((sum: number, b: Business) => sum + b._count.products, 0);
        const totalUsers = data.businesses.length;

        setStats((prev) => ({
          ...prev,
          totalBusinesses: data.businesses.length,
          totalInquiries,
          totalUsers,
          activeBusinesses,
          totalProducts,
          totalActiveProducts,
        }));
      } else {
        console.error(
          "Failed to fetch businesses:",
          businessesResult.status === "rejected"
            ? businessesResult.reason
            : businessesResult.value.status
        );
        setDataFetchError("Failed to load businesses data");
      }

      // Process categories data
      if (
        categoriesResult.status === "fulfilled" &&
        categoriesResult.value.ok
      ) {
        const data = await categoriesResult.value.json();
        console.log("Fetched categories:", data.categories.length);
        setCategories(data.categories);
      } else {
        console.error(
          "Failed to fetch categories:",
          categoriesResult.status === "rejected"
            ? categoriesResult.reason
            : categoriesResult.value.status
        );
      }

      // Process inquiries data
      if (inquiriesResult.status === "fulfilled" && inquiriesResult.value.ok) {
        const data = await inquiriesResult.value.json();
        console.log("Fetched inquiries:", data.inquiries.length);
        setInquiries(data.inquiries);
      } else {
        console.error(
          "Failed to fetch inquiries:",
          inquiriesResult.status === "rejected"
            ? inquiriesResult.reason
            : inquiriesResult.value.status
        );
      }

      // Process professionals data
      if (
        professionalsResult.status === "fulfilled" &&
        professionalsResult.value.ok
      ) {
        const data = await professionalsResult.value.json();
        console.log("Fetched professionals:", data.professionals.length);
        setProfessionals(data.professionals);

        // Calculate professional stats
        const activeProfessionals = data.professionals.filter(
          (p: Professional) => p.isActive
        ).length;
        setStats((prev) => ({
          ...prev,
          totalProfessionals: data.professionals.length,
          activeProfessionals,
        }));
      } else {
        console.error(
          "Failed to fetch professionals:",
          professionalsResult.status === "rejected"
            ? professionalsResult.reason
            : professionalsResult.value.status
        );
      }

      // Process business listing inquiries data
      if (
        businessListingInquiriesResult.status === "fulfilled" &&
        businessListingInquiriesResult.value.ok
      ) {
        const data = await businessListingInquiriesResult.value.json();
        console.log(
          "Fetched business listing inquiries:",
          data.inquiries.length
        );
        setBusinessListingInquiries(data.inquiries);
      } else {
        console.error(
          "Failed to fetch business listing inquiries:",
          businessListingInquiriesResult.status === "rejected"
            ? businessListingInquiriesResult.reason
            : businessListingInquiriesResult.value.status
        );
      }

      // Process registration inquiries data
      if (
        registrationInquiriesResult.status === "fulfilled" &&
        registrationInquiriesResult.value.ok
      ) {
        const data = await registrationInquiriesResult.value.json();
        console.log("Fetched registration inquiries:", data.inquiries.length);
        setRegistrationInquiries(data.inquiries);
      } else {
        console.error(
          "Failed to fetch registration inquiries:",
          registrationInquiriesResult.status === "rejected"
            ? registrationInquiriesResult.reason
            : registrationInquiriesResult.value.status
        );
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setDataFetchError("An unexpected error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate password utility
  const generatePassword = useCallback(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "Adm@";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }, []);

  const [generatedPassword, setGeneratedPassword] = useState("");
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Generate credentials utility
  const handleGenerateCredentials = useCallback(
    (businessName: string, adminName: string) => {
      const baseUsername =
        adminName.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const username = `${baseUsername}_${Date.now().toString().slice(-4)}`;
      const password = generatePassword();
      setGeneratedPassword(password);
      setGeneratedUsername(username);
    },
    [generatePassword]
  );

  // Handle add business with improved error handling
  const handleAddBusiness = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const manualUsername = formData.get("username") as string;
      const manualPassword = formData.get("password") as string;

      const businessData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: manualPassword || generatedPassword || generatePassword(),
        adminName: formData.get("adminName") as string,
        categoryId: formData.get("categoryId") as string,
        description: formData.get("description") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        website: formData.get("website") as string,
      };

      console.log("Creating business:", businessData);

      try {
        const response = await fetch("/api/admin/businesses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(businessData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Business creation successful");
          toast({
            title: "Success",
            description: `Business created successfully! Login credentials: Email: ${businessData.email}, Password: ${businessData.password}`,
          });
          setShowRightPanel(false);
          setRightPanelContent(null);
          setGeneratedPassword("");
          setGeneratedUsername("");
          fetchData();
          e.currentTarget.reset();
        } else {
          const error = await response.json();
          console.error("Business creation failed:", error);
          toast({
            title: "Error",
            description: `Failed to create business: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Business creation error:", error);
        toast({
          title: "Error",
          description: "Failed to create business. Please try again.",
          variant: "destructive",
        });
      }
    },
    [generatedPassword, generatePassword, toast, fetchData]
  );

  // Handle edit business
  const handleEditBusiness = useCallback((business: Business) => {
    setEditingBusiness(business);
    setRightPanelContent("edit-business");
    setShowRightPanel(true);
  }, []);

  // Handle update business with improved error handling
  const handleUpdateBusiness = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingBusiness) return;

      setIsLoading(true);
      const formData = new FormData(e.currentTarget);

      const updateData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        logo: formData.get("logo") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string,
        categoryId: formData.get("categoryId") as string,
      };

      console.log("Updating business:", editingBusiness.id, updateData);

      try {
        const response = await fetch(
          `/api/admin/businesses/${editingBusiness.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          console.log("Update successful, updating state...");
          
          // Update the business in the local state immediately
          setBusinesses((prev) =>
            prev.map((biz) =>
              biz.id === editingBusiness.id
                ? { ...biz, ...updateData }
                : biz
            )
          );

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          setShowRightPanel(false);
          setRightPanelContent(null);
          toast({
            title: "Success",
            description: "Business updated successfully!",
          });
        } else {
          const error = await response.json();
          console.error("Update failed:", error);
          toast({
            title: "Error",
            description: `Failed to update business: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description: "Failed to update business. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editingBusiness, toast]
  );

  // Handle delete business with improved error handling
  const handleDeleteBusiness = useCallback(
    async (business: Business) => {
      if (
        !confirm(
          `Are you sure you want to delete "${business.name}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      try {
        console.log("Deleting business:", business.id, business.name);
        const response = await fetch(`/api/admin/businesses/${business.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("Business deletion successful, updating state...");

          // Remove the deleted business from the local state immediately
          setBusinesses((prev) => {
            const updatedBusinesses = prev.filter((biz) => biz.id !== business.id);
            console.log("Updated businesses list:", updatedBusinesses.length, "businesses remaining");
            return updatedBusinesses;
          });

          // Update stats immediately
          setStats((prev) => ({
            ...prev,
            totalBusinesses: prev.totalBusinesses - 1,
            totalUsers: prev.totalUsers - 1,
            activeBusinesses: business.isActive
              ? prev.activeBusinesses - 1
              : prev.activeBusinesses,
            totalProducts: prev.totalProducts - business._count.products,
            totalActiveProducts: business.isActive
              ? prev.totalActiveProducts - business._count.products
              : prev.totalActiveProducts,
          }));

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          // Show success message with enhanced details
          toast({
            title: "Success",
            description: "Business and associated user deleted successfully",
          });
        } else {
          const error = await response.json();
          console.error("Business deletion failed:", error);
          toast({
            title: "Error",
            description: `Failed to delete business: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Business deletion error:", error);
        toast({
          title: "Error",
          description: "Failed to delete business. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Handle toggle business status
  const handleToggleBusinessStatus = useCallback(
    async (business: Business) => {
      console.log(
        "Toggling business status for:",
        business.id,
        "current isActive:",
        business.isActive
      );
      try {
        const response = await fetch(`/api/admin/businesses/${business.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !business.isActive }),
        });

        if (response.ok) {
          console.log("Toggle successful, updating state...");
          
          // Update the business in the local state immediately
          setBusinesses((prev) =>
            prev.map((biz) =>
              biz.id === business.id
                ? { ...biz, isActive: !biz.isActive }
                : biz
            )
          );

          // Update stats immediately
          setStats((prev) => ({
            ...prev,
            activeBusinesses: !business.isActive
              ? prev.activeBusinesses + 1
              : prev.activeBusinesses - 1,
            totalActiveProducts: !business.isActive
              ? prev.totalActiveProducts + business._count.products
              : prev.totalActiveProducts - business._count.products,
          }));

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          toast({
            title: "Success",
            description: `Business ${!business.isActive ? 'activated' : 'suspended'} successfully`,
          });
        } else {
          const error = await response.json();
          console.error("Toggle failed:", error);
          toast({
            title: "Error",
            description: `Failed to update business status: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Toggle error:", error);
        toast({
          title: "Error",
          description: "Failed to toggle business status. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Handle edit professional
  const handleEditProfessional = useCallback((professional: Professional) => {
    setEditingProfessional(professional);
    setRightPanelContent("edit-professional");
    setShowRightPanel(true);
  }, []);

  // Handle delete professional with improved error handling
  const handleDeleteProfessional = useCallback(
    async (id: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this professional profile? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        console.log("Deleting professional:", id);
        const response = await fetch(`/api/professionals/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("Professional deletion successful, updating state...");

          // Remove the deleted professional from the local state immediately
          setProfessionals((prev) => {
            const updatedProfessionals = prev.filter((prof) => prof.id !== id);
            console.log("Updated professionals list:", updatedProfessionals.length, "professionals remaining");
            return updatedProfessionals;
          });

          // Update stats immediately
          setStats((prev) => ({
            ...prev,
            totalProfessionals: prev.totalProfessionals - 1,
            activeProfessionals: prev.activeProfessionals - 1,
          }));

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          // Show success message with enhanced details
          toast({
            title: "Success",
            description: "Professional and associated user deleted successfully",
          });
        } else {
          const error = await response.json();
          console.error("Professional deletion failed:", error);
          toast({
            title: "Error",
            description: `Failed to delete professional: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Professional deletion error:", error);
        toast({
          title: "Error",
          description: "Failed to delete professional. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Handle toggle professional status
  const handleToggleProfessionalStatus = useCallback(
    async (professional: Professional) => {
      console.log(
        "Toggling professional status for:",
        professional.id,
        "current isActive:",
        professional.isActive
      );
      try {
        const response = await fetch(`/api/professionals/${professional.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !professional.isActive }),
        });

        if (response.ok) {
          console.log("Toggle successful, updating state...");
          
          // Update the professional in the local state immediately
          setProfessionals((prev) =>
            prev.map((prof) =>
              prof.id === professional.id
                ? { ...prof, isActive: !prof.isActive }
                : prof
            )
          );

          // Update stats immediately
          setStats((prev) => ({
            ...prev,
            activeProfessionals: !professional.isActive
              ? prev.activeProfessionals + 1
              : prev.activeProfessionals - 1,
          }));

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          toast({
            title: "Success",
            description: `Professional ${!professional.isActive ? 'activated' : 'deactivated'} successfully`,
          });
        } else {
          const error = await response.json();
          console.error("Toggle failed:", error);
          toast({
            title: "Error",
            description: `Failed to update professional status: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Toggle error:", error);
        toast({
          title: "Error",
          description:
            "Failed to toggle professional status. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Handle add professional with improved error handling
  const handleAddProfessional = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const manualPassword = formData.get("password") as string;

      const professionalData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: manualPassword || generatedPassword || generatePassword(),
        adminName: formData.get("adminName") as string,
        phone: formData.get("phone") as string,
      };

      console.log("Creating professional account:", professionalData);

      try {
        const response = await fetch("/api/admin/professionals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(professionalData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Professional account creation successful");
          toast({
            title: "Success",
            description: `Professional account created successfully! Login credentials: Email: ${professionalData.email}, Password: ${professionalData.password}`,
          });
          setShowRightPanel(false);
          setRightPanelContent(null);
          setGeneratedPassword("");
          setGeneratedUsername("");
          fetchData();
          e.currentTarget.reset();
        } else {
          const error = await response.json();
          console.error("Professional creation failed:", error);
          toast({
            title: "Error",
            description: `Failed to create professional account: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Professional creation error:", error);
        toast({
          title: "Error",
          description:
            "Failed to create professional account. Please try again.",
          variant: "destructive",
        });
      }
    },
    [generatedPassword, generatePassword, toast, fetchData]
  );

  // Handle update professional with improved error handling
  const handleUpdateProfessional = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingProfessional) return;

      setIsLoading(true);
      const formData = new FormData(e.currentTarget);

      const updateData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
      };

      console.log(
        "Updating professional account:",
        editingProfessional.id,
        updateData
      );

      try {
        const response = await fetch(
          `/api/professionals/${editingProfessional.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          console.log("Account update successful, updating state...");
          
          // Update the professional in the local state immediately
          setProfessionals((prev) =>
            prev.map((prof) =>
              prof.id === editingProfessional.id
                ? { ...prof, ...updateData }
                : prof
            )
          );

          // Force re-render to ensure UI updates
          setForceRerender((prev) => prev + 1);

          setShowRightPanel(false);
          setRightPanelContent(null);
          toast({
            title: "Success",
            description: "Professional account updated successfully!",
          });
        } else {
          const error = await response.json();
          console.error("Update failed:", error);
          toast({
            title: "Error",
            description: `Failed to update professional account: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Update error:", error);
        toast({
          title: "Error",
          description:
            "Failed to update professional account. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editingProfessional, toast]
  );

  // Handle add category with improved error handling
  const handleAddCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const rawParentId = formData.get("parentId") as string;
      const categoryData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        parentId: rawParentId === "none" ? null : rawParentId || undefined,
      };

      try {
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        });

        if (response.ok) {
          const result = await response.json();
          toast({
            title: "Success",
            description: "Category created successfully!",
          });
          setShowRightPanel(false);
          setRightPanelContent(null);
          fetchData();
          e.currentTarget.reset();
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to create category: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category. Please try again.",
          variant: "destructive",
        });
      }
    },
    [fetchData, toast]
  );

  // Handle edit category
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setRightPanelContent("edit-category");
    setShowRightPanel(true);
  }, []);

  // Handle update category with improved error handling
  const handleUpdateCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingCategory) return;

      const formData = new FormData(e.currentTarget);

      const rawParentId = formData.get("parentId") as string;
      const updateData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        parentId: rawParentId === "none" ? null : rawParentId || null,
      };

      console.log("Updating category:", editingCategory.id, updateData);

      try {
        const response = await fetch(
          `/api/admin/categories/${editingCategory.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          console.log("Category update successful");
          fetchData();
          setShowRightPanel(false);
          setRightPanelContent(null);
          toast({
            title: "Success",
            description: "Category updated successfully!",
          });
        } else {
          const error = await response.json();
          console.error("Category update failed:", error);
          toast({
            title: "Error",
            description: `Failed to update category: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Category update error:", error);
        toast({
          title: "Error",
          description: "Failed to update category. Please try again.",
          variant: "destructive",
        });
      }
    },
    [editingCategory, fetchData, toast]
  );

  // Handle delete category with improved error handling
  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      if (
        !confirm(
          `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      console.log("Deleting category:", category.id);

      try {
        const response = await fetch(`/api/admin/categories/${category.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("Category delete successful");
          fetchData();
          toast({
            title: "Success",
            description: "Category deleted successfully",
          });
        } else {
          const error = await response.json();
          console.error("Category delete failed:", error);
          toast({
            title: "Error",
            description: `Failed to delete category: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Category delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    },
    [fetchData, toast]
  );

  // Handle update business listing inquiry with improved error handling
  const handleUpdateBusinessListingInquiry = useCallback(
    async (inquiryId: string, updates: any) => {
      try {
        const response = await fetch(
          `/api/business-listing-inquiries/${inquiryId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Update the inquiry in the list
          setBusinessListingInquiries((prev) =>
            prev.map((inquiry) =>
              inquiry.id === inquiryId ? data.inquiry : inquiry
            )
          );
          toast({
            title: "Success",
            description: "Inquiry updated successfully!",
          });
          setShowBusinessListingInquiryDialog(false);
          setSelectedBusinessListingInquiry(null);
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to update inquiry: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to update inquiry:", error);
        toast({
          title: "Error",
          description: "Failed to update inquiry. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Handle create account from inquiry with improved error handling
  const handleCreateAccountFromInquiry = useCallback(
    async (inquiry: any) => {
      if (
        !confirm(
          `Create ${inquiry.type.toLowerCase()} account for ${inquiry.name}?`
        )
      ) {
        return;
      }

      try {
        // Generate a password for the new account
        const generatedPassword = generatePassword();

        let response;
        let accountData;
        if (inquiry.type === "BUSINESS") {
          accountData = {
            name: inquiry.businessName || inquiry.name,
            email: inquiry.email,
            password: generatedPassword,
            adminName: inquiry.name,
            phone: inquiry.phone,
            address: inquiry.location,
          };
          response = await fetch("/api/admin/businesses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(accountData),
          });
        } else {
          accountData = {
            name: inquiry.name,
            email: inquiry.email,
            password: generatedPassword,
            adminName: inquiry.name,
            phone: inquiry.phone,
          };
          response = await fetch("/api/admin/professionals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(accountData),
          });
        }

        if (response.ok) {
          // Send email notification with credentials
          try {
            const emailResponse = await fetch("/api/notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "accountCreation",
                name: inquiry.name,
                email: inquiry.email,
                password: generatedPassword,
                accountType: inquiry.type.toLowerCase(),
                loginUrl: `${window.location.origin}/login`,
              }),
            });

            if (!emailResponse.ok) {
              console.error("Failed to send account creation email");
            }
          } catch (emailError) {
            console.error("Email notification error:", emailError);
          }

          // Update inquiry status to COMPLETED
          await fetch(`/api/registration-inquiries/${inquiry.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "COMPLETED" }),
          });

          // Update the inquiry in the list
          setRegistrationInquiries((prev) =>
            prev.map((regInquiry) =>
              regInquiry.id === inquiry.id
                ? { ...regInquiry, status: "COMPLETED" }
                : regInquiry
            )
          );

          toast({
            title: "Success",
            description: `${inquiry.type} account created successfully! Login credentials sent to ${inquiry.email}`,
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to create account: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to create account:", error);
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    },
    [generatePassword, toast]
  );

  // Handle create account from inquiry with sidebar
  const handleCreateAccountFromInquiryWithSidebar = useCallback(
    (inquiry: any) => {
      // Set the inquiry data for the sidebar
      setEditingBusiness(inquiry.type === "BUSINESS" ? inquiry : null);
      setEditingProfessional(inquiry.type === "PROFESSIONAL" ? inquiry : null);

      // Open the account creation sidebar
      setRightPanelContent("create-account-from-inquiry");
      setShowRightPanel(true);
    },
    []
  );

  // Handle reject inquiry with improved error handling
  const handleRejectInquiry = useCallback(
    async (inquiry: any) => {
      if (!confirm("Reject this registration request?")) {
        return;
      }

      try {
        const response = await fetch(
          `/api/registration-inquiries/${inquiry.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "REJECTED" }),
          }
        );

        if (response.ok) {
          // Update the inquiry in the list immediately
          setRegistrationInquiries((prev) =>
            prev.map((regInquiry) =>
              regInquiry.id === inquiry.id
                ? { ...regInquiry, status: "REJECTED" }
                : regInquiry
            )
          );

          toast({
            title: "Success",
            description: "Registration request rejected.",
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to reject inquiry: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to reject inquiry:", error);
        toast({
          title: "Error",
          description: "Failed to reject inquiry. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      mobileIcon: Home,
      value: "dashboard",
      mobileTitle: "Home",
    },
    {
      title: "Businesses",
      icon: Building,
      mobileIcon: Grid3X3,
      value: "businesses",
      mobileTitle: "Business",
    },
    {
      title: "Professionals",
      icon: User,
      mobileIcon: User,
      value: "professionals",
      mobileTitle: "Professional",
    },
    {
      title: "Categories",
      icon: Settings,
      mobileIcon: FolderTree,
      value: "categories",
      mobileTitle: "Category",
    },
    {
      title: "Inquiries",
      icon: MessageSquare,
      mobileIcon: MessageCircle,
      value: "inquiries",
      mobileTitle: "Inquiry",
    },
    {
      title: "Registration Requests",
      icon: UserCheck,
      mobileIcon: UserCheck,
      value: "registration-requests",
      mobileTitle: "Registrations",
    },
    {
      title: "Business Listings",
      icon: FileText,
      mobileIcon: FileText,
      value: "business-listings",
      mobileTitle: "Listings",
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      mobileIcon: LineChart,
      value: "analytics",
      mobileTitle: "Analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      mobileIcon: Cog,
      value: "settings",
      mobileTitle: "Settings",
    },
  ];


  const renderSkeletonContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white border border-gray-200 shadow-sm rounded-3xl"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "businesses":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-80" />
            </div>
            <div className="bg-white border overflow-hidden rounded-3xl border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Skeleton className="h-10 w-24 rounded-2xl" />
                  <Skeleton className="h-10 w-48 rounded-2xl" />
                  <Skeleton className="h-10 w-32 rounded-2xl" />
                </div>
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <div className="bg-amber-100 p-4">
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <Skeleton className="h-8 w-8 rounded-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-6 w-72" />
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <div className="p-4 sm:p-6">
                <Skeleton className="h-10 w-40 mb-6 rounded-2xl" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center space-x-2 p-4 border rounded-2xl bg-gray-50">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-5 w-32" />
                        <div className="ml-auto flex space-x-2">
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <Skeleton className="h-8 w-8 rounded-xl" />
                        </div>
                      </div>
                      {i === 0 && (
                        <div className="ml-8 flex items-center space-x-2 p-3 border-l-2 border-gray-200">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-24" />
                          <div className="ml-auto flex space-x-2">
                            <Skeleton className="h-8 w-8 rounded-xl" />
                            <Skeleton className="h-8 w-8 rounded-xl" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        );
    }
  };

  const renderMiddleContent = () => {
    if (isLoading) {
      return renderSkeletonContent();
    }

    // Use forceRerender to ensure UI updates immediately
    const _ = forceRerender;

    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {" "}
                Admin Dashboard Overview
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Total Businesses
                  </CardTitle>
                  <Building className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalBusinesses}
                  </div>
                  <p className="text-xs text-gray-500">Registered businesses</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Active Businesses
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeBusinesses}
                  </div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-gray-500">
                    All products & services
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Total Professionals
                  </CardTitle>
                  <User className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalProfessionals}
                  </div>
                  <p className="text-xs text-gray-500">
                    Registered professionals
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Platform Health
                  </CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeBusinesses > 0 || stats.activeProfessionals > 0
                      ? "Excellent"
                      : "Growing"}
                  </div>
                  <p className="text-xs text-gray-500">System status</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "businesses":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Add Businesses
              </h1>
              <p className="text-xl text-gray-600">
                Manage and monitor your businesses from this dashboard section.
              </p>
            </div>
            <div className="bg-white border overflow-hidden rounded-3xl border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button
                    onClick={() => {
                      setRightPanelContent("add-business");
                      setShowRightPanel(true);
                    }}
                    className="bg-black hover:bg-gray-800 text-white rounded-2xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 rounded-2xl">
                      <SelectValue placeholder="Filter by Status: Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All ({filteredStats.total})
                      </SelectItem>
                      <SelectItem value="active">
                        Active ({filteredStats.active})
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactive ({filteredStats.inactive})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="rounded-2xl">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="overflow-x-auto hide-scrollbar rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader className="bg-amber-100">
                      <TableRow>
                        <TableHead className="text-gray-900">
                          Business Name
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Admin Email
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Category
                        </TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell className="text-gray-900 font-medium">
                            {business.name}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {business.admin.email}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {business.category?.name || "None"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                business.isActive ? "default" : "secondary"
                              }
                              className="rounded-full"
                            >
                              {business.isActive ? "Active" : "Suspended"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() =>
                                  window.open(
                                    `/catalog/${business.slug}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => handleEditBusiness(business)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={() => handleDeleteBusiness(business)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      case "professionals":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Professionals
              </h1>
              <p className="text-xl text-gray-600">
                Manage and monitor your professionals from this dashboard
                section.
              </p>
            </div>
            <div className="bg-white border overflow-hidden rounded-3xl border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button
                    onClick={() => {
                      setRightPanelContent("add-professional");
                      setShowRightPanel(true);
                    }}
                    className="bg-black hover:bg-gray-800 text-white rounded-2xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 rounded-2xl">
                      <SelectValue placeholder="Filter by Status: Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All ({professionals.length})
                      </SelectItem>
                      <SelectItem value="active">
                        Active ({professionals.filter((p) => p.isActive).length}
                        )
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactive (
                        {professionals.filter((p) => !p.isActive).length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="rounded-2xl">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader className="bg-amber-100">
                      <TableRow>
                        <TableHead className="text-gray-900">
                          Professional Name
                        </TableHead>
                        <TableHead className="text-gray-900">Email</TableHead>
                        <TableHead className="text-gray-900">
                          Headline
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Location
                        </TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professionals
                        .filter((professional) => {
                          const matchesSearch =
                            professional.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            professional.admin?.email
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            professional.professionalHeadline
                              ?.toLowerCase()
                              .includes(searchTerm.toLowerCase());
                          const matchesStatus =
                            filterStatus === "all" ||
                            (filterStatus === "active" &&
                              professional.isActive) ||
                            (filterStatus === "inactive" &&
                              !professional.isActive);
                          return matchesSearch && matchesStatus;
                        })
                        .map((professional) => (
                          <TableRow key={professional.id}>
                            <TableCell className="text-gray-900 font-medium">
                              {professional.name}
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {professional.email || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-900 max-w-xs truncate">
                              {professional.professionalHeadline ||
                                "No headline"}
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {professional.location || "Not specified"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  professional.isActive
                                    ? "default"
                                    : "secondary"
                                }
                                className="rounded-full"
                              >
                                {professional.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    window.open(
                                      `/pcard/${professional.slug}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    handleToggleProfessionalStatus(professional)
                                  }
                                >
                                  {professional.isActive ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    handleEditProfessional(professional)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() =>
                                    handleDeleteProfessional(professional.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {" "}
                CATEGORY MANAGER
              </h1>
              <p className="text-xl text-gray-600">
                Configure business categories and classifications
              </p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <div className="p-4 sm:p-6">
                <Button
                  onClick={() => {
                    setRightPanelContent("add-category");
                    setShowRightPanel(true);
                  }}
                  variant="outline"
                  className="mb-6 rounded-2xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>

                <div className="space-y-4">
                  {filteredCategories
                    .filter((c) => !c.parentId)
                    .map((parentCategory) => (
                      <div key={parentCategory.id}>
                        <div className="flex items-center space-x-2 p-4 border rounded-2xl bg-gray-50">
                          <span className="text-lg">📁</span>
                          <span className="font-medium">
                            {parentCategory.name}
                          </span>
                          <div className="ml-auto flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => handleEditCategory(parentCategory)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-xl"
                              onClick={() =>
                                handleDeleteCategory(parentCategory)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {filteredCategories
                          .filter((c) => c.parentId === parentCategory.id)
                          .map((childCategory) => (
                            <div
                              key={childCategory.id}
                              className="ml-8 flex items-center space-x-2 p-3 border-l-2 border-gray-200"
                            >
                              <span className="text-sm">📄</span>
                              <span className="text-sm">
                                {childCategory.name}
                              </span>
                              <div className="ml-auto flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    handleEditCategory(childCategory)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() =>
                                    handleDeleteCategory(childCategory)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "inquiries":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                INQUIRIES MANAGEMENT
              </h1>
              <p className="text-xl text-gray-600">
                View and manage customer inquiries
              </p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900">
                          Customer
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Business
                        </TableHead>
                        <TableHead className="text-gray-900">Message</TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="text-gray-900">
                            <div>
                              <div className="font-medium">{inquiry.name}</div>
                              <div className="text-sm text-gray-500">
                                {inquiry.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {inquiry.business?.name}
                          </TableCell>
                          <TableCell className="text-gray-900 max-w-xs truncate">
                            {inquiry.message}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">
                              {inquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      case "registration-requests":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                REGISTRATION REQUESTS
              </h1>
              <p className="text-xl text-gray-600">
                Review and approve business and professional registration
                requests
              </p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <div className="">
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900">Type</TableHead>
                        <TableHead className="text-gray-900">Name</TableHead>
                        <TableHead className="text-gray-900">
                          Business Name
                        </TableHead>
                        <TableHead className="text-gray-900">Contact</TableHead>
                        <TableHead className="text-gray-900">
                          Location
                        </TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Date</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrationInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <Badge
                              variant={
                                inquiry.type === "BUSINESS"
                                  ? "default"
                                  : "secondary"
                              }
                              className="rounded-full"
                            >
                              {inquiry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900 font-medium">
                            {inquiry.name}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {inquiry.businessName || "N/A"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <div>
                              <div className="text-sm">{inquiry.email}</div>
                              {inquiry.phone && (
                                <div className="text-sm text-gray-500">
                                  {inquiry.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {inquiry.location || "Not specified"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inquiry.status === "REJECTED"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="rounded-full"
                            >
                              {inquiry.status}
                              {inquiry.status === "REJECTED" && (
                                <AlertTriangle className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {inquiry.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="rounded-xl bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleCreateAccountFromInquiryWithSidebar(
                                        inquiry
                                      )
                                    }
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Create Account
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => handleRejectInquiry(inquiry)}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {inquiry.status === "COMPLETED" && (
                                <Badge
                                  variant="default"
                                  className="rounded-full"
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Account Created
                                </Badge>
                              )}
                              {inquiry.status === "REJECTED" && (
                                <Badge
                                  variant="destructive"
                                  className="rounded-full"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      case "business-listings":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                BUSINESS LISTING INQUIRIES
              </h1>
              <p className="text-xl text-gray-600">
                Manage business listing requests and digital presence
                enhancement inquiries
              </p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-3xl">
              <div className="p-4 sm:p-6">
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-900">
                          Business
                        </TableHead>
                        <TableHead className="text-gray-900">Contact</TableHead>
                        <TableHead className="text-gray-900">
                          Requirements
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Inquiry Type
                        </TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">
                          Assigned To
                        </TableHead>
                        <TableHead className="text-gray-900">Date</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businessListingInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="text-gray-900">
                            <div>
                              <div className="font-medium">
                                {inquiry.businessName}
                              </div>
                              {inquiry.businessDescription && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {inquiry.businessDescription}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <div>
                              <div className="font-medium">
                                {inquiry.contactName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {inquiry.email}
                              </div>
                              {inquiry.phone && (
                                <div className="text-sm text-gray-500">
                                  {inquiry.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900 max-w-xs truncate">
                            {inquiry.requirements}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {inquiry.inquiryType || "Not specified"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">
                              {inquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {inquiry.assignedUser
                              ? inquiry.assignedUser.name
                              : "Unassigned"}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedBusinessListingInquiry(inquiry);
                                  setShowBusinessListingInquiryDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedBusinessListingInquiry(inquiry);
                                  setShowBusinessListingInquiryDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Platform Analytics
              </h1>
              <p className="text-xl text-gray-600">
                Detailed analytics and insights
              </p>
            </div>
            <div className="    rounded-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Total Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inquiries.length}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Active Businesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.activeBusinesses}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Total Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalProducts}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                System Settings
              </h1>
              <p className="text-xl text-gray-600">
                Configure system preferences
              </p>
            </div>
            <div className="p-4 bg-white rounded-3xl sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="DigiSence" className="rounded-2xl" />
                </div>
                <div>
                  <Label>Admin Email</Label>
                  <Input
                    defaultValue="admin@digisence.com"
                    className="rounded-2xl"
                  />
                </div>
                <Button className="rounded-2xl">Save Settings</Button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a menu item</div>;
    }
  };

  const renderRightPanel = () => {
    if (!showRightPanel) return null;

    if (rightPanelContent === "add-business") {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ADD BUSINESS</h3>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input name="name" required className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="categoryId">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input name="website" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>--- Admin Account ---</Label>
              </div>
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input name="adminName" required className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  className="rounded-2xl"
                />
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget.closest(
                    "form"
                  ) as HTMLFormElement;
                  const businessName =
                    (
                      form.querySelector(
                        'input[name="name"]'
                      ) as HTMLInputElement
                    )?.value || "";
                  const adminName =
                    (
                      form.querySelector(
                        'input[name="adminName"]'
                      ) as HTMLInputElement
                    )?.value || "";
                  handleGenerateCredentials(businessName, adminName);
                }}
                className="rounded-2xl"
              >
                Generate Credentials
              </Button>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  name="username"
                  value={generatedUsername}
                  onChange={(e) => setGeneratedUsername(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={generatedPassword}
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    className="pr-10 rounded-2xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-2xl"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  (Leave empty to use generated or enter manually)
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                    setGeneratedPassword("");
                    setGeneratedUsername("");
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Create Business
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (rightPanelContent === "edit-business" && editingBusiness) {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EDIT BUSINESS</h3>
            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  name="name"
                  defaultValue={editingBusiness.name}
                  required
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  defaultValue={editingBusiness.description}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  name="logo"
                  defaultValue={editingBusiness.logo}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  defaultValue={editingBusiness.address}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  name="phone"
                  defaultValue={editingBusiness.phone}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  defaultValue={editingBusiness.website}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  name="categoryId"
                  defaultValue={editingBusiness.category?.id}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input
                  name="email"
                  defaultValue={editingBusiness.admin.email}
                  type="email"
                  className="rounded-2xl"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (rightPanelContent === "add-category") {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ADD CATEGORY</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input name="name" required className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select name="parentId">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {categories
                      .filter((c) => !c.parentId)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (rightPanelContent === "edit-category" && editingCategory) {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EDIT CATEGORY</h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  name="description"
                  defaultValue={editingCategory.description}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  name="parentId"
                  defaultValue={editingCategory.parentId || "none"}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {categories
                      .filter((c) => !c.parentId && c.id !== editingCategory.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Update Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (rightPanelContent === "add-professional") {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto hide-scrollbar">
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Create basic account details. The professional will manage their
              profile content through their admin panel.
            </p>
            <form onSubmit={handleAddProfessional} className="space-y-6">
              {/* Basic Account Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Account Details
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Professional Name</Label>
                    <Input name="name" required className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      placeholder="+91 8080808080"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Login Credentials
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Name</Label>
                    <Input name="adminName" required className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Email (Login Email)</Label>
                    <Input
                      name="email"
                      type="email"
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget.closest(
                        "form"
                      ) as HTMLFormElement;
                      const professionalName =
                        (
                          form.querySelector(
                            'input[name="name"]'
                          ) as HTMLInputElement
                        )?.value || "";
                      const adminName =
                        (
                          form.querySelector(
                            'input[name="adminName"]'
                          ) as HTMLInputElement
                        )?.value || "";
                      handleGenerateCredentials(professionalName, adminName);
                    }}
                    className="rounded-2xl"
                  >
                    Generate Credentials
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        name="username"
                        value={generatedUsername}
                        onChange={(e) => setGeneratedUsername(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={generatedPassword}
                          onChange={(e) => setGeneratedPassword(e.target.value)}
                          className="pr-10 rounded-2xl"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-2xl"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    (Leave empty to use generated or enter manually)
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                    setGeneratedPassword("");
                    setGeneratedUsername("");
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Create Professional Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (rightPanelContent === "edit-professional" && editingProfessional) {
      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">EDIT PROFESSIONAL ACCOUNT</h3>
            <p className="text-sm text-gray-600">
              Edit basic account details. Profile content is managed by the
              professional through their admin panel.
            </p>
            <form onSubmit={handleUpdateProfessional} className="space-y-6">
              {/* Basic Account Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Account Details
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Professional Name</Label>
                    <Input
                      name="name"
                      defaultValue={editingProfessional.name}
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      defaultValue={editingProfessional.phone || ""}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      name="email"
                      defaultValue={editingProfessional.email || ""}
                      type="email"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (
      rightPanelContent === "create-account-from-inquiry" &&
      (editingBusiness || editingProfessional)
    ) {
      const inquiry = editingBusiness || editingProfessional;
      const isBusiness = !!editingBusiness;

      if (!inquiry) {
        return null;
      }

      return (
        <div className="w-full h-full rounded-3xl bg-white p-4 sm:p-6 overflow-y-auto hide-scrollbar">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                CREATE ACCOUNT FROM INQUIRY
              </h3>
              <p className="text-sm text-gray-600">
                Complete the account setup for {inquiry.name}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl">
              <h4 className="font-medium text-gray-900 mb-2">
                Inquiry Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {isBusiness ? "Business" : "Professional"}
                </div>
                <div>
                  <span className="font-medium">Name:</span> {inquiry.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {inquiry.email}
                </div>
                {isBusiness && (
                  <div>
                    <span className="font-medium">Business Name:</span>{" "}
                    {(inquiry as any).businessName || "N/A"}
                  </div>
                )}
                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {(inquiry as any).location || "Not specified"}
                </div>
                {inquiry.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {inquiry.phone}
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const manualPassword = formData.get("password") as string;
                const password =
                  manualPassword || generatedPassword || generatePassword();

                const accountData = {
                  name: isBusiness
                    ? (formData.get("businessName") as string) ||
                      (inquiry as any).businessName ||
                      inquiry.name
                    : inquiry.name,
                  email: inquiry.email,
                  password: password,
                  adminName:
                    (formData.get("adminName") as string) || inquiry.name,
                  phone: inquiry.phone,
                  ...(isBusiness && {
                    address: isBusiness ? (inquiry as any).location : undefined,
                    description: isBusiness
                      ? (formData.get("description") as string)
                      : undefined,
                    categoryId: isBusiness
                      ? (formData.get("categoryId") as string)
                      : undefined,
                  }),
                };

                try {
                  const response = await fetch(
                    isBusiness
                      ? "/api/admin/businesses"
                      : "/api/admin/professionals",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(accountData),
                    }
                  );

                  if (response.ok) {
                    // Send email notification with credentials
                    try {
                      const emailResponse = await fetch("/api/notifications", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          type: "accountCreation",
                          name: inquiry.name,
                          email: inquiry.email,
                          password: password,
                          accountType: isBusiness ? "business" : "professional",
                          loginUrl: `${window.location.origin}/login`,
                        }),
                      });

                      if (!emailResponse.ok) {
                        console.error("Failed to send account creation email");
                      }
                    } catch (emailError) {
                      console.error("Email notification error:", emailError);
                    }

                    // Update inquiry status to COMPLETED
                    await fetch(`/api/registration-inquiries/${inquiry.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ status: "COMPLETED" }),
                    });

                    // Update the inquiry in the list
                    setRegistrationInquiries((prev) =>
                      prev.map((regInquiry) =>
                        regInquiry.id === inquiry.id
                          ? { ...regInquiry, status: "COMPLETED" }
                          : regInquiry
                      )
                    );

                    toast({
                      title: "Success",
                      description: `${
                        isBusiness ? "Business" : "Professional"
                      } account created successfully! Login credentials sent to ${
                        inquiry.email
                      }`,
                    });

                    // Close sidebar and refresh data
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                    setEditingBusiness(null);
                    setEditingProfessional(null);
                    setGeneratedPassword("");
                    setGeneratedUsername("");
                    fetchData();
                  } else {
                    const error = await response.json();
                    toast({
                      title: "Error",
                      description: `Failed to create account: ${
                        error.error || "Unknown error"
                      }`,
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  console.error("Failed to create account:", error);
                  toast({
                    title: "Error",
                    description: "Failed to create account. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              className="space-y-6"
            >
              {/* Account Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Account Configuration
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Admin Name</Label>
                    <Input
                      name="adminName"
                      defaultValue={inquiry.name}
                      required
                      className="rounded-2xl"
                    />
                  </div>

                  {isBusiness && (
                    <>
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input
                          name="businessName"
                          defaultValue={
                            isBusiness
                              ? (inquiry as any).businessName || inquiry.name
                              : inquiry.name
                          }
                          required
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          name="description"
                          placeholder="Brief description of the business..."
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select name="categoryId">
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Login Credentials
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Email (Login)</Label>
                    <Input
                      name="email"
                      value={inquiry.email || ""}
                      disabled
                      className="rounded-2xl bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Password</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          const generated = generatePassword();
                          setGeneratedPassword(generated);
                        }}
                        className="rounded-xl"
                      >
                        Generate Password
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={generatedPassword}
                        onChange={(e) => setGeneratedPassword(e.target.value)}
                        className="pr-10 rounded-2xl"
                        placeholder="Enter or generate a password..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-2xl"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password will be sent to the user via email
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRightPanel(false);
                    setRightPanelContent(null);
                    setEditingBusiness(null);
                    setEditingProfessional(null);
                    setGeneratedPassword("");
                    setGeneratedUsername("");
                  }}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div className="fixed inset-0 bg-linear-to-b from-blue-400 to-white bg-center blur-sm -z-10"></div>
        {/* Top Header Bar */}
        <div className="bg-white border rounded-3xl mt-3 mx-3 border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-4 sm:px-6 py-2">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl">
                <Skeleton className="h-8 w-8" />
              </div>
              <div>
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton className="h-8 w-24 rounded-2xl hidden sm:flex" />
              <Skeleton className="h-8 w-20 rounded-2xl hidden sm:flex" />
              <div className="text-right hidden sm:block">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 h-fit overflow-hidden">
          {/* Left Sidebar - Desktop Only */}
          {!isMobile && (
            <div className="w-64 m-4 border rounded-3xl bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-auto hide-scrollbar">
              <div className="p-4 border-b border-gray-200 rounded-t-3xl">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i}>
                      <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t border-gray-200 mb-5 mt-auto">
                <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          )}

          {/* Middle Content */}
          <div
            className={`flex-1 m-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out pb-20 md:pb-0`}
          >
            <div className="flex-1 p-4 sm:p-6 overflow-auto hide-scrollbar">
              {renderSkeletonContent()}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center py-2 px-3 rounded-xl"
                >
                  <Skeleton className="h-5 w-5 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!user || user.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="max-h-screen min-h-screen relative flex flex-col">
      <div className="fixed inset-0 bg-linear-to-b from-blue-400 to-white bg-center blur-sm -z-10"></div>
      {/* Top Header Bar */}
      <div className="bg-white border rounded-3xl mt-3 mx-3 border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-3 sm:px-4 py-2">
          <div className="flex items-center ">
            <img src="/logo.svg" alt="DigiSence" className="h-8 w-auto" />
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                DigiSence
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-48 sm:w-64 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-black rounded-2xl flex items-center justify-center">
              <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Column Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        {!isMobile && (
          <div className="w-64 m-4 border  bg-white border-r   rounded-3xl border-gray-200 flex flex-col shadow-sm">
            <div className="p-4 border-b border-gray-200 rounded-t-3xl">
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6" />
                <span className="font-semibold">Super Admin</span>
              </div>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.value}>
                    <button
                      onClick={() => setCurrentView(item.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors ${
                        currentView === item.value
                          ? " bg-linear-to-r from-orange-400 to-amber-500 text-white"
                          : "text-gray-700 hover:bg-orange-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-200 mb-5 mt-auto">
              <button
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-2xl text-left transition-colors text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Middle Content */}
        <div
          className={`flex-1 m-4 rounded-3xl bg-white/50 backdrop-blur-xl border border-gray-200 shadow-sm overflow-auto hide-scrollbar transition-all duration-300 ease-in-out   pb-20 md:pb-0 ${
            showRightPanel && !isMobile ? "mr-0" : ""
          }`}
        >
          <div className="flex-1  p-4 sm:p-6 overflow-auto hide-scrollbar">
            {renderMiddleContent()}
          </div>
        </div>

        {/* Right Editor Panel - Desktop or Mobile Bottom Sheet */}
        {showRightPanel && (
          <div
            className={`${
              isMobile ? "fixed bottom-0 left-0 right-0 z-50" : "relative"
            } m-4 border rounded-3xl bg-white border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-sm ${
              isMobile ? "h-96" : "w-96"
            }`}
          >
            {isMobile && (
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">Panel</h3>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l8 8M6 14L14 6"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-auto hide-scrollbar">
              {renderRightPanel()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          {/* More Menu Overlay */}
          {showMoreMenu && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMoreMenu(false)}
            >
              <div
                className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  {menuItems.slice(4).map((item) => {
                    const MobileIcon = item.mobileIcon;
                    return (
                      <button
                        key={item.value}
                        onClick={() => {
                          setCurrentView(item.value);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                          currentView === item.value
                            ? "bg-orange-100 text-orange-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <MobileIcon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-200 z-40">
            <div className="flex justify-around items-center py-2">
              {menuItems.slice(0, 4).map((item) => {
                const MobileIcon = item.mobileIcon;
                return (
                  <button
                    key={item.value}
                    onClick={() => setCurrentView(item.value)}
                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                      currentView === item.value
                        ? "text-orange-500"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <MobileIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">
                      {item.mobileTitle}
                    </span>
                  </button>
                );
              })}
              {/* More button for additional items */}
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  showMoreMenu ||
                  menuItems.slice(4).some((item) => item.value === currentView)
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MoreHorizontal className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </button>
            </div>
          </div>
        </>
      )}
      {/* Business Listing Inquiry Dialog */}
      <Dialog
        open={showBusinessListingInquiryDialog}
        onOpenChange={setShowBusinessListingInquiryDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Listing Inquiry Details</DialogTitle>
            <DialogDescription>
              Review and manage this business listing inquiry
            </DialogDescription>
          </DialogHeader>

          {selectedBusinessListingInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.businessName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Name</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.contactName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.phone || "Not provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">
                    Business Description
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.businessDescription ||
                      "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Inquiry Type</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBusinessListingInquiry.inquiryType ||
                      "Not specified"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Requirements</Label>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedBusinessListingInquiry.requirements}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Update Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedBusinessListingInquiry.status}
                      onValueChange={(value) => {
                        const updated = {
                          ...selectedBusinessListingInquiry,
                          status: value,
                        };
                        setSelectedBusinessListingInquiry(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">
                          Under Review
                        </SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Assign To</Label>
                    <Select
                      value={selectedBusinessListingInquiry.assignedTo || ""}
                      onValueChange={(value) => {
                        const updated = {
                          ...selectedBusinessListingInquiry,
                          assignedTo: value || null,
                        };
                        setSelectedBusinessListingInquiry(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {/* You would fetch users here */}
                        <SelectItem value="admin1">Admin 1</SelectItem>
                        <SelectItem value="admin2">Admin 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={selectedBusinessListingInquiry.notes || ""}
                    onChange={(e) => {
                      const updated = {
                        ...selectedBusinessListingInquiry,
                        notes: e.target.value,
                      };
                      setSelectedBusinessListingInquiry(updated);
                    }}
                    placeholder="Add internal notes..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBusinessListingInquiryDialog(false);
                setSelectedBusinessListingInquiry(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedBusinessListingInquiry) {
                  const updates: any = {
                    status: selectedBusinessListingInquiry.status,
                    notes: selectedBusinessListingInquiry.notes,
                  };
                  if (selectedBusinessListingInquiry.assignedTo) {
                    updates.assignedTo =
                      selectedBusinessListingInquiry.assignedTo;
                  }
                  handleUpdateBusinessListingInquiry(
                    selectedBusinessListingInquiry.id,
                    updates
                  );
                }
              }}
            >
              Update Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
