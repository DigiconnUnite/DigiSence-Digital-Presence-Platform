"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
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
  X,
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
  const [creatingAccount, setCreatingAccount] = useState<string | null>(null);

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


  // Socket.IO connection for real-time updates
  const { socket, isConnected } = useSocket();

  // Real-time updates from Socket.IO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBusinessCreated = (data: any) => {
      console.log('Business created via Socket.IO:', data);
      setBusinesses(prev => [data.business, ...prev]);
      setStats(prev => ({
        ...prev,
        totalBusinesses: prev.totalBusinesses + 1,
        totalUsers: prev.totalUsers + 1,
      }));
      toast({
        title: "Business Created",
        description: `${data.business.name} has been added to the platform.`,
      });
    };

    const handleBusinessUpdated = (data: any) => {
      console.log('Business updated via Socket.IO:', data);
      setBusinesses(prev => prev.map(biz =>
        biz.id === data.business.id ? { ...biz, ...data.business } : biz
      ));
      toast({
        title: "Business Updated",
        description: `${data.business.name} has been updated.`,
      });
    };

    const handleBusinessDeleted = (data: any) => {
      console.log('Business deleted via Socket.IO:', data);
      setBusinesses(prev => prev.filter(biz => biz.id !== data.businessId));
      setStats(prev => ({
        ...prev,
        totalBusinesses: prev.totalBusinesses - 1,
        totalUsers: prev.totalUsers - 1,
        activeBusinesses: prev.activeBusinesses - 1,
      }));
      toast({
        title: "Business Deleted",
        description: "A business has been removed from the platform.",
      });
    };

    const handleBusinessStatusUpdated = (data: any) => {
      console.log('Business status updated via Socket.IO:', data);
      setBusinesses(prev => prev.map(biz =>
        biz.id === data.business.id ? { ...biz, ...data.business } : biz
      ));
      setStats(prev => ({
        ...prev,
        activeBusinesses: data.business.isActive
          ? prev.activeBusinesses + 1
          : prev.activeBusinesses - 1,
      }));
      toast({
        title: "Business Status Updated",
        description: `${data.business.name} is now ${data.business.isActive ? 'active' : 'inactive'}.`,
      });
    };

    const handleProfessionalCreated = (data: any) => {
      console.log('Professional created via Socket.IO:', data);
      setProfessionals(prev => [data.professional, ...prev]);
      setStats(prev => ({
        ...prev,
        totalProfessionals: prev.totalProfessionals + 1,
      }));
      toast({
        title: "Professional Created",
        description: `${data.professional.name} has been added to the platform.`,
      });
    };

    const handleProfessionalUpdated = (data: any) => {
      console.log('Professional updated via Socket.IO:', data);
      setProfessionals(prev => prev.map(pro =>
        pro.id === data.professional.id ? { ...pro, ...data.professional } : pro
      ));
      toast({
        title: "Professional Updated",
        description: `${data.professional.name} has been updated.`,
      });
    };

    const handleProfessionalDeleted = (data: any) => {
      console.log('Professional deleted via Socket.IO:', data);
      setProfessionals(prev => prev.filter(pro => pro.id !== data.professionalId));
      setStats(prev => ({
        ...prev,
        totalProfessionals: prev.totalProfessionals - 1,
        activeProfessionals: prev.activeProfessionals - 1,
      }));
      toast({
        title: "Professional Deleted",
        description: "A professional has been removed from the platform.",
      });
    };

    // Register event listeners
    socket.on('business-created', handleBusinessCreated);
    socket.on('business-updated', handleBusinessUpdated);
    socket.on('business-deleted', handleBusinessDeleted);
    socket.on('business-status-updated', handleBusinessStatusUpdated);
    socket.on('professional-created', handleProfessionalCreated);
    socket.on('professional-updated', handleProfessionalUpdated);
    socket.on('professional-deleted', handleProfessionalDeleted);

    // Cleanup listeners on unmount
    return () => {
      socket.off('business-created', handleBusinessCreated);
      socket.off('business-updated', handleBusinessUpdated);
      socket.off('business-deleted', handleBusinessDeleted);
      socket.off('business-status-updated', handleBusinessStatusUpdated);
      socket.off('professional-created', handleProfessionalCreated);
      socket.off('professional-updated', handleProfessionalUpdated);
      socket.off('professional-deleted', handleProfessionalDeleted);
    };
  }, [socket, isConnected, toast]);

  // Authentication check
  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
      router.push("/login");
      return;
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
    // Ensure categories is an array before filtering
    const categoriesArray = Array.isArray(categories) ? categories : [];
    return categoriesArray.filter(
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


  // Data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setDataFetchError(null);
    
    try {
      const [businessesRes, categoriesRes, inquiriesRes, professionalsRes, businessListingInquiriesRes, registrationInquiriesRes] = await Promise.all([
        fetch("/api/admin/businesses"),
        fetch("/api/admin/categories"),
        fetch("/api/inquiries"),
        fetch("/api/admin/professionals"),
        fetch("/api/business-listing-inquiries"),
        fetch("/api/registration-inquiries"),
      ]);

      // Check if all responses are ok
      const allResponsesOk = [businessesRes, categoriesRes, inquiriesRes, professionalsRes, businessListingInquiriesRes, registrationInquiriesRes].every(res => res.ok);
      
      if (!allResponsesOk) {
        throw new Error("One or more API calls failed");
      }

      const businessesData = await businessesRes.json();
      const categoriesData = await categoriesRes.json();
      const inquiriesData = await inquiriesRes.json();
      const professionalsData = await professionalsRes.json();
      const businessListingInquiriesData = await businessListingInquiriesRes.json();
      const registrationInquiriesData = await registrationInquiriesRes.json();

      // Debug logging
      console.log('API Responses:', {
        businessesData,
        categoriesData,
        inquiriesData,
        professionalsData,
        businessListingInquiriesData,
        registrationInquiriesData
      });

      // Extract data from API responses with proper error handling
      const businessesArray = Array.isArray(businessesData.businesses) ? businessesData.businesses : [];
      const categoriesArray = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
      const inquiriesArray = Array.isArray(inquiriesData.inquiries) ? inquiriesData.inquiries : [];
      const professionalsArray = Array.isArray(professionalsData.professionals) ? professionalsData.professionals : [];
      const businessListingInquiriesArray = Array.isArray(businessListingInquiriesData.businessListingInquiries) ? businessListingInquiriesData.businessListingInquiries : [];
      
      // Fix: Handle registration inquiries response properly
      let registrationInquiriesArray: any[] = [];
      if (registrationInquiriesData && Array.isArray(registrationInquiriesData.inquiries)) {
        registrationInquiriesArray = registrationInquiriesData.inquiries;
      } else if (Array.isArray(registrationInquiriesData)) {
        registrationInquiriesArray = registrationInquiriesData;
      } else if (registrationInquiriesData && registrationInquiriesData.inquiries) {
        registrationInquiriesArray = registrationInquiriesData.inquiries;
      }

      console.log('Extracted arrays:', {
        businessesArray: businessesArray.length,
        categoriesArray: categoriesArray.length,
        inquiriesArray: inquiriesArray.length,
        professionalsArray: professionalsArray.length,
        businessListingInquiriesArray: businessListingInquiriesArray.length,
        registrationInquiriesArray: registrationInquiriesArray.length
      });

      setBusinesses(businessesArray);
      setCategories(categoriesArray);
      setInquiries(inquiriesArray);
      setProfessionals(professionalsArray);
      setBusinessListingInquiries(businessListingInquiriesArray);
      setRegistrationInquiries(registrationInquiriesArray);

      // Calculate stats safely
      const totalInquiries = businessesArray.reduce(
        (sum: number, b: Business) => sum + (b._count?.inquiries || 0),
        0
      );
      const totalProducts = businessesArray.reduce(
        (sum: number, b: Business) => sum + (b._count?.products || 0),
        0
      );
      const activeBusinesses = businessesArray.filter(
        (b: Business) => b.isActive
      ).length;
      const totalActiveProducts = businessesArray
        .filter((b: Business) => b.isActive)
        .reduce((sum: number, b: Business) => sum + (b._count?.products || 0), 0);
      const totalUsers = businessesArray.length;
      const activeProfessionals = professionalsArray.filter(
        (p: Professional) => p.isActive
      ).length;

      setStats({
        totalBusinesses: businessesData.length,
        totalInquiries,
        totalUsers,
        activeBusinesses,
        totalProducts,
        totalActiveProducts,
        totalProfessionals: professionalsData.length,
        activeProfessionals,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDataFetchError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debug logging for registration inquiries specifically
  useEffect(() => {
    if (currentView === "registration-requests") {
      console.log('Registration inquiries data:', {
        length: registrationInquiries.length,
        data: registrationInquiries,
        isLoading,
        dataFetchError
      });
    }
  }, [registrationInquiries, isLoading, dataFetchError, currentView]);

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
          // Reset form safely
          if (e.currentTarget) {
            e.currentTarget.reset();
          }
          // Refresh data to show the new business
          fetchData();
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
    [generatedPassword, generatePassword, toast]
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
          // Reset form safely
          if (e.currentTarget) {
            e.currentTarget.reset();
          }
          // Refresh data to show the new professional
          fetchData();
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
    [generatedPassword, generatePassword, toast]
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
    [toast]
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
    [editingCategory, toast]
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
    [toast]
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

      setCreatingAccount(inquiry.id);

      try {
        // Generate a password for the new account
        const generatedPassword = generatePassword();

        let response;
        let accountData;
        let successMessage;
        
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
          successMessage = "Business account created successfully!";
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
          successMessage = "Professional account created successfully!";
        }

        if (response.ok) {
          const result = await response.json();
          
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
          const statusUpdateResponse = await fetch(`/api/registration-inquiries/${inquiry.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "COMPLETED" }),
          });

          if (statusUpdateResponse.ok) {
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
              description: `${successMessage} Login credentials sent to ${inquiry.email}`,
            });
            
            // Refresh data to ensure the UI is up to date
            fetchData();
          } else {
            console.error("Failed to update inquiry status");
            toast({
              title: "Warning",
              description: `${successMessage} but failed to update inquiry status.`,
              variant: "destructive",
            });
          }
        } else {
          const error = await response.json();
          console.error("Account creation failed:", error);
          toast({
            title: "Error",
            description: `Failed to create account: ${
              error.error || error.message || "Unknown error"
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
      } finally {
        setCreatingAccount(null);
      }
    },
    [generatePassword, toast, fetchData]
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

      setCreatingAccount(inquiry.id);

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
              error.error || error.message || "Unknown error"
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
      } finally {
        setCreatingAccount(null);
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

    // Ensure categories is always an array
    const safeCategories = Array.isArray(categories) ? categories : [];

    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <h1 className="text-lg font-bold text-gray-900 ">
                {" "}
                Admin Dashboard Overview
              </h1>
              <p className="text-md text-gray-600">
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
            {/* Data Fetching Status */}
            {dataFetchError && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Data Fetching Error</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetchData();
                      }}
                      className="rounded-2xl"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
                <p className="text-red-600 text-sm mt-1">{dataFetchError}</p>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-lg font-bold text-gray-900 ">
                Add Businesses
              </h1>
              <p className="text-md text-gray-600">
                Manage and monitor your businesses from this dashboard section.
              </p>
            </div>
            <div className="">
              <div className="">
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
                    <SelectTrigger className="w-full bg-white sm:w-48 rounded-2xl">
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

                <div className="overflow-x-auto hide-scrollbar bg-white rounded-2xl border border-gray-200">
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
              <h1 className="text-lg font-bold text-gray-900 ">
                Professionals
              </h1>
              <p className="text-md text-gray-600">
                Manage and monitor your professionals from this dashboard
                section.
              </p>
            </div>
            <div className="">
              <div className="">
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
                  <Select value={filterStatus}  onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full bg-white sm:w-48 rounded-2xl">
                      <SelectValue placeholder="Filter by Status: Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem  value="all">
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
                    <Download className="h-4 bg-white w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
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
              <h1 className="text-lg font-bold text-gray-900">
                {" "}
                Category Manager
              </h1>
              <p className="text-md text-gray-600">
                Configure business categories and classifications
              </p>
            </div>
            <div className="">
              <div className="">
                <Button
                  onClick={() => {
                    setRightPanelContent("add-category");
                    setShowRightPanel(true);
                  }}
                  variant="outline"
                  className="mb-6 bg-slate-900 border-none text-white rounded-2xl"
                >
                  <Plus className="h-4  w-4 mr-2" />
                  Add New Category
                </Button>

                <div className="space-y-4">
                  {safeCategories
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
                        {safeCategories
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
              <h1 className="text-lg font-bold text-gray-900">
                Inquiries Management
              </h1>
              <p className="text-md text-gray-600">
                View and manage customer inquiries
              </p>
            </div>
            <div className="">
              <div className="">
                <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
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
              <h1 className="text-lg font-bold text-gray-900">
                REGISTRATION REQUESTS
              </h1>
              <p className="text-md text-gray-600">
                Review and approve business and professional registration
                requests
              </p>
            </div>
        <div className="">
              <div className="">
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative bg-white rounded-2xl border border-gray-200 flex-1">
                    <Search className="absolute left-3 top-1/2 transform  -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search registration requests..."
                      className="pl-10 w-full rounded-2xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchData();
                    }}
                    className="rounded-2xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>

                {/* Data Fetching Status for Registration Requests */}
                {dataFetchError && (
                  <div className="bg-red-50 border border-red-200 rounded-3xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">Data Fetching Error</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            fetchData();
                          }}
                          className="rounded-2xl"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{dataFetchError}</p>
                  </div>
                )}
                
                {/* Empty State */}
                {registrationInquiries.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <UserCheck className="h-16 w-16 mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Registration Requests
                    </h3>
                    <p className="text-gray-600">
                      There are currently no business or professional registration requests to review.
                    </p>
                  </div>
                )}
                
                {/* Data Table */}
                {registrationInquiries.length > 0 && (
                  <div className="overflow-x-auto rounded-2xl bg-white border border-gray-200">
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
                        {registrationInquiries
                          .filter((inquiry) => {
                            const matchesSearch =
                              inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inquiry.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inquiry.location?.toLowerCase().includes(searchTerm.toLowerCase());
                            return matchesSearch;
                          })
                          .map((inquiry) => (
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
                                        disabled={creatingAccount === inquiry.id}
                                      >
                                        {creatingAccount === inquiry.id ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                            Creating...
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="h-4 w-4 mr-1" />
                                            Create Account
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => handleRejectInquiry(inquiry)}
                                        disabled={creatingAccount === inquiry.id}
                                      >
                                        {creatingAccount === inquiry.id ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1"></div>
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                            Reject
                                          </>
                                        )}
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
                )}
              </div>
            </div>
          </div>
        );
      case "business-listings":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
             <h1 className="text-lg font-bold text-gray-900">
                BUSINESS LISTING INQUIRIES
              </h1>
              <p className="text-md text-gray-600">
                Manage business listing requests and digital presence
                enhancement inquiries
              </p>
            </div>
            <div className="">
              <div className="">
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
              <h1 className="text-lg font-bold text-gray-900">
                Platform Analytics
              </h1>
              <p className="text-md text-gray-600">
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
              <h1 className="text-lg font-bold text-gray-900">
                System Settings
              </h1>
              <p className="text-md text-gray-600">
                Configure system preferences
              </p>
            </div>
            <div className="p-4 bg-white rounded-3xl sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="DigiSense" className="rounded-2xl" />
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

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  // Common close handler
  const closePanel = () => {
    setShowRightPanel(false);
    setRightPanelContent(null);
    setGeneratedPassword("");
    setGeneratedUsername("");
    setEditingBusiness(null);
    setEditingProfessional(null);
    setCreatingAccount(null);
  };

  // Helper to render standard modal structure
  const ModalLayout = ({
    title,
    description,
    children,
    footerContent,
    formId,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
    footerContent: React.ReactNode;
    formId?: string;
  }) => (
    <div className="flex flex-col h-[90vh]  bg-white relative">
      {/* Fixed Header - shrink-0 ensures it doesn't get squashed */}
      <DialogHeader className="px-6 pt-4 pb-2 border-b shrink-0 space-y-1.5 bg-white z-10">
        <div className="flex justify-between items-start w-full">
          <div className="">
            <DialogTitle className="text-md font-semibold leading-none tracking-tight">{title}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-normal">
              {description}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Scrollable Body - flex-1 makes it fill space, overflow-y-auto enables scrolling */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        {children}
      </div>

      {/* Fixed Footer - shrink-0 keeps it at bottom, border-t separates it */}
      <DialogFooter className="px-6 py-2  flex flex-row justify-center  border-t  bg-white z-10">
        {footerContent}
      </DialogFooter>
    </div>
  );

  // --- ADD BUSINESS ---
  if (rightPanelContent === "add-business") {
    return (
      <ModalLayout
        title="Add New Business"
        description="Create a new business account and listing."
        formId="add-business-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-full w-auto flex-1">
              Cancel
            </Button>
            <Button type="submit" form="add-business-form" className="rounded-full w-auto flex-1">
              Create Business
            </Button>
          </>
        }
      >
        <form id="add-business-form" onSubmit={handleAddBusiness} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-5">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input name="name" required className="rounded-xl" placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" className="rounded-xl" placeholder="Brief business description..." />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select name="categoryId" required>
              <SelectTrigger className="rounded-xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="phone" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input name="website" className="rounded-xl" />
            </div>
          </div>
          
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-4">Admin Account Details</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Name</Label>
                  <Input name="adminName" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Admin Email</Label>
                  <Input name="email" type="email" required className="rounded-xl" />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.getElementById("add-business-form") as HTMLFormElement;
                  const businessName = (form?.querySelector('input[name="name"]') as HTMLInputElement)?.value || "";
                  const adminName = (form?.querySelector('input[name="adminName"]') as HTMLInputElement)?.value || "";
                  handleGenerateCredentials(businessName, adminName);
                }}
                className="w-full rounded-xl"
              >
                <Key className="h-4 w-4 mr-2" /> Generate Credentials
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="rounded-xl" />
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
                      placeholder="Generated or manual password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-2xl"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ModalLayout>
    );
  }

  // --- EDIT BUSINESS ---
  if (rightPanelContent === "edit-business" && editingBusiness) {
    return (
      <ModalLayout
        title="Edit Business"
        description="Update business details and category."
        formId="edit-business-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" form="edit-business-form" className="rounded-2xl">
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-business-form" onSubmit={handleUpdateBusiness} className="space-y-5">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input name="name" defaultValue={editingBusiness.name} required className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={editingBusiness.description} className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input name="logo" defaultValue={editingBusiness.logo} className="rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" defaultValue={editingBusiness.address} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="phone" defaultValue={editingBusiness.phone} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input name="website" defaultValue={editingBusiness.website} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input name="email" defaultValue={editingBusiness.admin.email} type="email" className="rounded-2xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select name="categoryId" defaultValue={editingBusiness.category?.id || ""}>
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
        </form>
      </ModalLayout>
    );
  }

  // --- ADD PROFESSIONAL ---
  if (rightPanelContent === "add-professional") {
    return (
      <ModalLayout
        title="Add Professional"
        description="Register a new professional profile."
        formId="add-professional-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" form="add-professional-form" className="rounded-2xl">
              Create Profile
            </Button>
          </>
        }
      >
        <form id="add-professional-form" onSubmit={handleAddProfessional} className="space-y-5">
          <div className="space-y-2">
            <Label>Professional Name</Label>
            <Input name="name" required className="rounded-2xl" placeholder="Full Name" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input name="phone" placeholder="+91 8080808080" className="rounded-2xl" />
          </div>

          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Login Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input name="adminName" required className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input name="email" type="email" required className="rounded-2xl" />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                const form = e.currentTarget.closest("form") as HTMLFormElement;
                const professionalName = (form?.querySelector('input[name="name"]') as HTMLInputElement)?.value || "";
                const adminName = (form?.querySelector('input[name="adminName"]') as HTMLInputElement)?.value || "";
                handleGenerateCredentials(professionalName, adminName);
              }}
              className="w-full rounded-2xl"
            >
              <Key className="h-4 w-4 mr-2" /> Generate Credentials
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="rounded-2xl" />
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
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ModalLayout>
    );
  }

  // --- EDIT PROFESSIONAL ---
  if (rightPanelContent === "edit-professional" && editingProfessional) {
    return (
      <ModalLayout
        title="Edit Professional"
        description="Update professional details."
        formId="edit-professional-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" form="edit-professional-form" className="rounded-2xl">
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-professional-form" onSubmit={handleUpdateProfessional} className="space-y-5">
          <div className="space-y-2">
            <Label>Professional Name</Label>
            <Input name="name" defaultValue={editingProfessional.name} required className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input name="phone" defaultValue={editingProfessional.phone || ""} className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" defaultValue={editingProfessional.email || ""} type="email" className="rounded-2xl" />
          </div>
        </form>
      </ModalLayout>
    );
  }

  // --- ADD CATEGORY ---
  if (rightPanelContent === "add-category") {
    return (
      <ModalLayout
        title="Add Category"
        description="Create a new business category."
        formId="add-category-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" form="add-category-form" className="rounded-2xl">
              Create Category
            </Button>
          </>
        }
      >
        <form id="add-category-form" onSubmit={handleAddCategory} className="space-y-5">
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
                {categories.filter((c) => !c.parentId).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </ModalLayout>
    );
  }

  // --- EDIT CATEGORY ---
  if (rightPanelContent === "edit-category" && editingCategory) {
    return (
      <ModalLayout
        title="Edit Category"
        description="Update category details."
        formId="edit-category-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl">
              Cancel
            </Button>
            <Button type="submit" form="edit-category-form" className="rounded-2xl">
              Update Category
            </Button>
          </>
        }
      >
        <form id="edit-category-form" onSubmit={handleUpdateCategory} className="space-y-5">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input name="name" defaultValue={editingCategory.name} required className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={editingCategory.description} className="rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select name="parentId" defaultValue={editingCategory.parentId || "none"}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent</SelectItem>
                {safeCategories.filter((c) => !c.parentId && c.id !== editingCategory.id).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </ModalLayout>
    );
  }

  // --- CREATE ACCOUNT FROM INQUIRY ---
  if (rightPanelContent === "create-account-from-inquiry" && (editingBusiness || editingProfessional)) {
    const inquiry = editingBusiness || editingProfessional;
    const isBusiness = !!editingBusiness;

    if (!inquiry) return null;

    return (
      <ModalLayout
        title="Create Account"
        description="Complete account setup from registration request."
        formId="inquiry-account-form"
        footerContent={
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-2xl" disabled={creatingAccount !== null}>
              Cancel
            </Button>
            <Button type="submit" form="inquiry-account-form" className="rounded-2xl bg-green-600 hover:bg-green-700" disabled={creatingAccount !== null}>
              {creatingAccount ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <UserCheck className="h-4 w-4 mr-2" />}
              Create Account
            </Button>
          </>
        }
      >
        <form id="inquiry-account-form" onSubmit={async (e) => { 
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const manualPassword = formData.get("password") as string;
            const password = manualPassword || generatedPassword || generatePassword();

            const accountData = {
              name: isBusiness ? (formData.get("businessName") as string) || (inquiry as any).businessName || inquiry.name : inquiry.name,
              email: inquiry.email,
              password: password,
              adminName: (formData.get("adminName") as string) || inquiry.name,
              phone: inquiry.phone,
              ...(isBusiness && {
                address: (inquiry as any).location,
                description: (formData.get("description") as string),
                categoryId: (formData.get("categoryId") as string),
              }),
            };

            try {
              const response = await fetch(isBusiness ? "/api/admin/businesses" : "/api/admin/professionals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accountData),
              });

              if (response.ok) {
                try {
                    await fetch("/api/notifications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "accountCreation", name: inquiry.name, email: inquiry.email,
                            password: password, accountType: isBusiness ? "business" : "professional",
                            loginUrl: `${window.location.origin}/login`,
                        }),
                    });
                } catch (err) { console.error(err); }

                await fetch(`/api/registration-inquiries/${inquiry.id}`, {
                  method: "PUT", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "COMPLETED" }),
                });

                setRegistrationInquiries((prev) => prev.map((regInquiry) => regInquiry.id === inquiry.id ? { ...regInquiry, status: "COMPLETED" } : regInquiry));
                toast({ title: "Success", description: `Account created! Email sent to ${inquiry.email}` });
                closePanel();
                fetchData();
              }
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to create account.", variant: "destructive" });
            }
          }} className="space-y-5">
          
          <div className="bg-gray-50 p-4 rounded-2xl border">
            <h4 className="font-medium text-sm mb-2">Inquiry Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>Type: <span className="font-medium text-gray-900">{isBusiness ? "Business" : "Professional"}</span></div>
              <div>Name: <span className="font-medium text-gray-900">{inquiry.name}</span></div>
              <div>Email: <span className="font-medium text-gray-900">{inquiry.email}</span></div>
              <div>Location: <span className="font-medium text-gray-900">{(inquiry as any).location || "N/A"}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Account Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input name="adminName" defaultValue={inquiry.name} required className="rounded-2xl" />
              </div>
              {isBusiness && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Business Name</Label>
                    <Input name="businessName" defaultValue={(inquiry as any).businessName || inquiry.name} required className="rounded-2xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Brief description..." className="rounded-2xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Category</Label>
                    <Select name="categoryId">
                      <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                          {safeCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm">Login Credentials</h4>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Input name="password" type={showPassword ? "text" : "password"} value={generatedPassword} onChange={(e) => setGeneratedPassword(e.target.value)} className="pr-10 rounded-2xl" placeholder="Generated or manual password" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                  </div>
                  <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); setGeneratedPassword(generatePassword()); }}>Generate</Button>
              </div>
            </div>
          </div>
        </form>
      </ModalLayout>
    );
  }

  return null;
};



  if (loading || isLoading) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div className="fixed inset-0 bg-linear-to-b from-blue-400 to-white bg-center blur-sm -z-10"></div>
        {/* Top Header Bar */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center px-4 sm:px-6 py-1">
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
            <div className="w-64 border bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-auto hide-scrollbar">
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
      <div className="bg-white border  border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-3 sm:px-4 py-1">
          <div className="flex items-center ">
            <img src="/logo.svg" alt="DigiSense" className="h-8 w-auto" />
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div>
               <span className="font-semibold">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center leading-tight space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <span className="h-8 border-l border-gray-300 mx-2"></span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Real-time connected' : 'Real-time disconnected'}></div>
              <div className="w-8 h-8  rounded-full  bg-black  flex items-center justify-center">
                <Shield className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Column Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        {!isMobile && (
          <div className="w-64    bg-white border-r border-gray-200 flex flex-col shadow-sm">
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
        <div className="flex-1 overflow-auto hide-scrollbar pb-20 md:pb-0">
          <div className="flex-1  p-4 sm:p-6 overflow-auto hide-scrollbar">
            {renderMiddleContent()}
          </div>
        </div>

        {/* Right Editor Panel - Dialog */}
        <Dialog open={showRightPanel} onOpenChange={(open) => {
          if (!open) {
            setShowRightPanel(false);
            setRightPanelContent(null);
            setGeneratedPassword("");
            setGeneratedUsername("");
          }
        }}>
          <DialogContent className="max-w-4xl w-[95%] h-[90vh] border overflow-hidden  bg-white p-0  top-4 bottom-4 left-1/2 translate-x-[-50%] translate-y-0">
            {renderRightPanel()}
          </DialogContent>
        </Dialog>
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
                className="absolute bottom-16 left-0 right-0 bg-white rounded-t-md p-4"
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
        <DialogContent className="max-w-4xl  p-0 overflow-hidden top-4 bottom-4 left-1/2 translate-x-[-50%] translate-y-0">
          {selectedBusinessListingInquiry && (
            <div className="flex flex-col h-full relative">
              {/* Fixed Header */}
              <DialogHeader className="p-6 border-b shrink-0 space-y-0 bg-white">
                <div className="flex justify-between items-start w-full">
                  <div className="">
                    <DialogTitle className="text-md  font-semibold">Business Listing Inquiry Details</DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      Review and manage this business listing inquiry
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-16">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Business Name</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBusinessListingInquiry?.businessName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Contact Name</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBusinessListingInquiry?.contactName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBusinessListingInquiry?.email || "Not provided"}
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
                        {selectedBusinessListingInquiry?.businessDescription ||
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Inquiry Type</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBusinessListingInquiry?.inquiryType ||
                          "Not specified"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Requirements</Label>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                        {selectedBusinessListingInquiry?.requirements || "Not provided"}
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
                            <SelectValue placeholder="Select status" />
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
                            <SelectValue placeholder="Select user or leave unassigned" />
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
                        value={selectedBusinessListingInquiry?.notes || ""}
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
              </div>

              {/* Absolute Footer */}
              <DialogFooter className="px-6 w-full flex flex-col py-2 border-t absolute bottom-0 left-0 right-0 bg-white z-10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBusinessListingInquiryDialog(false);
                    setSelectedBusinessListingInquiry(null);
                  }}
                  className="rounded-2xl w-auto "
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedBusinessListingInquiry) {
                      const updates: any = {
                        status: selectedBusinessListingInquiry?.status,
                        notes: selectedBusinessListingInquiry?.notes,
                      };
                      if (selectedBusinessListingInquiry?.assignedTo) {
                        updates.assignedTo =
                          selectedBusinessListingInquiry.assignedTo;
                      }
                      handleUpdateBusinessListingInquiry(
                        selectedBusinessListingInquiry?.id,
                        updates
                      );
                    }
                  }}
                  className="rounded-2xl w-auto"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
