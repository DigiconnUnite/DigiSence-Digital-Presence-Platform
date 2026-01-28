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
import { UnifiedModal } from "@/components/ui/UnifiedModal";

import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Bell,
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
  Zap,
  Image,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Globe,
  MapPin,
  Type,
  Hash,
  Lock,
  UserPlus,
} from "lucide-react";
import { Pagination, BulkActionsToolbar } from "@/components/ui/pagination";
import SharedSidebar from "../components/SharedSidebar";
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

// Pagination, Sorting, and Selection State for Businesses
interface BusinessQueryParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface BusinessApiResponse {
  businesses: Business[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Business management state
  const [businessQuery, setBusinessQuery] = useState<BusinessQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [businessData, setBusinessData] = useState<BusinessApiResponse | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Professional form state

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

  // Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

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
    console.log('[DEBUG] Admin Dashboard - Auth Check:', {
      loading,
      user: user ? { id: user.id, role: user.role, email: user.email } : null,
      currentPath: window.location.pathname
    });
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
      console.log('[DEBUG] Admin Dashboard - Redirecting to login:', {
        reason: !user ? 'No user' : `Wrong role: ${user.role}`,
        redirectingTo: '/login'
      });
      router.push("/login");
      return;
    }
  }, [user, loading, router]);

  // Memoized filtered data (for backwards compatibility)
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


  // Fetch businesses with pagination, search, and sorting
  const fetchBusinesses = useCallback(async () => {
    setBusinessLoading(true);
    try {
      const params = new URLSearchParams({
        page: businessQuery.page.toString(),
        limit: businessQuery.limit.toString(),
        search: businessQuery.search,
        status: businessQuery.status,
        sortBy: businessQuery.sortBy,
        sortOrder: businessQuery.sortOrder,
      });
      
      const response = await fetch(`/api/admin/businesses?${params}`);
      if (response.ok) {
        const data: BusinessApiResponse = await response.json();
        setBusinessData(data);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch businesses',
        variant: 'destructive',
      });
    } finally {
      setBusinessLoading(false);
    }
  }, [businessQuery, toast]);
  
  // Fetch businesses when query changes
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);
  
  // Update query when debounced search changes
  useEffect(() => {
    setBusinessQuery(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Handle sort change
  const handleSort = (column: string) => {
    setBusinessQuery(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setBusinessQuery(prev => ({ ...prev, page }));
  };
  
  // Handle items per page change
  const handleLimitChange = (limit: number) => {
    setBusinessQuery(prev => ({ ...prev, limit, page: 1 }));
  };
  
  // Handle selection
  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinessIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
    if (businessData?.businesses) {
      const allIds = businessData.businesses.map(b => b.id);
      setSelectedBusinessIds(new Set(allIds));
    }
  };
  
  const handleDeselectAll = () => {
    setSelectedBusinessIds(new Set());
  };
  
  // Bulk actions
  const handleBulkActivate = async () => {
    if (selectedBusinessIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/businesses/bulk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedBusinessIds), isActive: true }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: `${selectedBusinessIds.size} businesses activated` });
        setSelectedBusinessIds(new Set());
        fetchBusinesses();
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to activate businesses', variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  const handleBulkDeactivate = async () => {
    if (selectedBusinessIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const response = await fetch('/api/admin/businesses/bulk/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedBusinessIds), isActive: false }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: `${selectedBusinessIds.size} businesses suspended` });
        setSelectedBusinessIds(new Set());
        fetchBusinesses();
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to suspend businesses', variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedBusinessIds.size === 0) return;
    setShowBulkDeleteDialog(true);
  };
  
  const confirmBulkDelete = async () => {
    setBulkActionLoading(true);
    setShowBulkDeleteDialog(false);
    try {
      const response = await fetch('/api/admin/businesses/bulk/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedBusinessIds) }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: `${selectedBusinessIds.size} businesses deleted` });
        setSelectedBusinessIds(new Set());
        fetchBusinesses();
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete businesses', variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  // Export to CSV
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/businesses/export?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `businesses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: 'Success', description: 'Businesses exported successfully' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export businesses', variant: 'destructive' });
    }
  };
  
  // Get sort icon
  const getSortIcon = (column: string) => {
    if (businessQuery.sortBy !== column) return <div className="w-4 h-4 opacity-30">↕</div>;
    return businessQuery.sortOrder === 'asc' ? 
      <div className="w-4 h-4">↑</div> : 
      <div className="w-4 h-4">↓</div>;
  };

  // Data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setDataFetchError(null);

    try {
      console.log('[DEBUG] Admin Dashboard - Starting data fetch');
      const [businessesRes, categoriesRes, inquiriesRes, professionalsRes, businessListingInquiriesRes, registrationInquiriesRes] = await Promise.all([
        fetch("/api/admin/businesses"),
        fetch("/api/admin/categories"),
        fetch("/api/inquiries"),
        fetch("/api/admin/professionals"),
        fetch("/api/business-listing-inquiries"),
        fetch("/api/registration-inquiries"),
      ]);

      console.log('[DEBUG] Admin Dashboard - API responses status:', {
        businesses: businessesRes.status,
        categories: categoriesRes.status,
        inquiries: inquiriesRes.status,
        professionals: professionalsRes.status,
        businessListingInquiries: businessListingInquiriesRes.status,
        registrationInquiries: registrationInquiriesRes.status,
      });

      // Check if all responses are ok
      const allResponsesOk = [businessesRes, categoriesRes, inquiriesRes, professionalsRes, businessListingInquiriesRes, registrationInquiriesRes].every(res => res.ok);

      if (!allResponsesOk) {
        console.error('[DEBUG] Admin Dashboard - Some API calls failed');
        // Log the failed responses
        const failedResponses: string[] = [];
        if (!businessesRes.ok) failedResponses.push(`businesses: ${businessesRes.status} ${await businessesRes.text()}`);
        if (!categoriesRes.ok) failedResponses.push(`categories: ${categoriesRes.status} ${await categoriesRes.text()}`);
        if (!inquiriesRes.ok) failedResponses.push(`inquiries: ${inquiriesRes.status} ${await inquiriesRes.text()}`);
        if (!professionalsRes.ok) failedResponses.push(`professionals: ${professionalsRes.status} ${await professionalsRes.text()}`);
        if (!businessListingInquiriesRes.ok) failedResponses.push(`businessListingInquiries: ${businessListingInquiriesRes.status} ${await businessListingInquiriesRes.text()}`);
        if (!registrationInquiriesRes.ok) failedResponses.push(`registrationInquiries: ${registrationInquiriesRes.status} ${await registrationInquiriesRes.text()}`);
        console.error('[DEBUG] Failed responses:', failedResponses);
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
        totalInquiries: registrationInquiriesArray.length,
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

          // Also refresh paginated data
          fetchBusinesses();

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
    [toast, fetchBusinesses]
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

          // Also refresh paginated data
          fetchBusinesses();

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
    [toast, fetchBusinesses]
  );

  // Handle duplicate business
  const handleDuplicateBusiness = useCallback(
    async (business: Business) => {
      if (
        !confirm(
          `Create a duplicate of "${business.name}"? A new business with a new admin account will be created.`
        )
      ) {
        return;
      }

      try {
        console.log("Duplicating business:", business.id, business.name);
        const response = await fetch(`/api/admin/businesses/${business.id}/duplicate`, {
          method: "POST",
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Business duplication successful:", result);
          
          // Refresh data to show the new business
          fetchBusinesses();
          fetchData();

          toast({
            title: "Success",
            description: `Business duplicated successfully! Login credentials for new admin:\nEmail: ${result.loginCredentials.email}\nPassword: ${result.loginCredentials.password}`,
            duration: 10000,
          });
        } else {
          const error = await response.json();
          console.error("Business duplication failed:", error);
          toast({
            title: "Error",
            description: `Failed to duplicate business: ${
              error.error || "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Business duplication error:", error);
        toast({
          title: "Error",
          description: "Failed to duplicate business. Please try again.",
          variant: "destructive",
        });
      }
    },
    [toast, fetchBusinesses, fetchData]
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
          `Create ${inquiry.type.toLowerCase()} account for ${inquiry.name}? This will send login credentials to ${inquiry.email}.`
        )
      ) {
        return;
      }

      setCreatingAccount(inquiry.id);

      try {
        // First update inquiry status to UNDER_REVIEW
        const reviewResponse = await fetch(`/api/registration-inquiries/${inquiry.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "UNDER_REVIEW" }),
        });

        if (!reviewResponse.ok) {
          throw new Error("Failed to update inquiry status to under review");
        }

        // Update inquiry status in local state
        setRegistrationInquiries((prev) =>
          prev.map((regInquiry) =>
            regInquiry.id === inquiry.id
              ? { ...regInquiry, status: "UNDER_REVIEW" }
              : regInquiry
          )
        );

        // Generate password from stored hash (we'll decrypt or use a new one)
        // Since we stored the hashed password, we need to generate a new one for sending
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
            description: inquiry.businessDescription || "",
            phone: inquiry.phone || "",
            address: inquiry.location || inquiry.address || "",
            website: inquiry.website || "",
            categoryId: inquiry.categoryId || "",
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
            phone: inquiry.phone || "",
            location: inquiry.location || "",
            aboutMe: inquiry.aboutMe || "",
            profession: inquiry.profession || "",
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
          // Reset inquiry status back to PENDING if account creation failed
          await fetch(`/api/registration-inquiries/${inquiry.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "PENDING" }),
          });

          // Update local state back
          setRegistrationInquiries((prev) =>
            prev.map((regInquiry) =>
              regInquiry.id === inquiry.id
                ? { ...regInquiry, status: "PENDING" }
                : regInquiry
            )
          );

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

  // Helper function to get right panel title
  const getRightPanelTitle = () => {
    switch (rightPanelContent) {
      case "add-business":
        return "Add New Business";
      case "edit-business":
        return "Edit Business";
      case "add-professional":
        return "Add Professional";
      case "edit-professional":
        return "Edit Professional";
      case "add-category":
        return "Add Category";
      case "edit-category":
        return "Edit Category";
      case "create-account-from-inquiry":
        return "Create Account";
      default:
        return "Panel";
    }
  };

  // Helper function to get right panel description
  const getRightPanelDescription = () => {
    switch (rightPanelContent) {
      case "add-business":
        return "Create a new business account and listing.";
      case "edit-business":
        return "Update business details and category.";
      case "add-professional":
        return "Register a new professional profile.";
      case "edit-professional":
        return "Update professional details.";
      case "add-category":
        return "Create a new business category.";
      case "edit-category":
        return "Update category details.";
      case "create-account-from-inquiry":
        return "Complete account setup from registration request.";
      default:
        return "";
    }
  };

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

  // Helper function to get right panel footer
  const getRightPanelFooter = () => {
    const formId = getFormId();
    
    switch (rightPanelContent) {
      case "add-business":
      case "edit-business":
        return (
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-md w-auto flex-1">
              Cancel
            </Button>
            <Button type="submit" form={formId} className="rounded-md w-auto flex-1 bg-black text-white hover:bg-gray-800">
              {rightPanelContent === "add-business" ? "Create Business" : "Save Changes"}
            </Button>
          </>
        );
      case "add-professional":
      case "edit-professional":
        return (
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-md w-auto flex-1">
              Cancel
            </Button>
            <Button type="submit" form={formId} className="rounded-md w-auto flex-1 bg-black text-white hover:bg-gray-800">
              {rightPanelContent === "add-professional" ? "Create Profile" : "Save Changes"}
            </Button>
          </>
        );
      case "add-category":
      case "edit-category":
        return (
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-md w-auto flex-1">
              Cancel
            </Button>
            <Button type="submit" form={formId} className="rounded-md w-auto flex-1 bg-black text-white hover:bg-gray-800">
              {rightPanelContent === "add-category" ? "Create Category" : "Update Category"}
            </Button>
          </>
        );
      case "create-account-from-inquiry":
        return (
          <>
            <Button type="button" variant="outline" onClick={closePanel} className="rounded-md w-auto flex-1" disabled={creatingAccount !== null}>
              Cancel
            </Button>
            <Button type="submit" form={formId} className="rounded-md w-auto flex-1 bg-green-600 text-white hover:bg-green-700" disabled={creatingAccount !== null}>
              {creatingAccount ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  // Helper function to get form ID
  const getFormId = () => {
    switch (rightPanelContent) {
      case "add-business":
        return "add-business-form";
      case "edit-business":
        return "edit-business-form";
      case "add-professional":
        return "add-professional-form";
      case "edit-professional":
        return "edit-professional-form";
      case "add-category":
        return "add-category-form";
      case "edit-category":
        return "edit-category-form";
      case "create-account-from-inquiry":
        return "inquiry-account-form";
      default:
        return undefined;
    }
  };

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
      icon: FolderTree,
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
              <h1 className="text-lg font-bold text-gray-900">
                Admin Dashboard Overview
              </h1>
              <p className="text-md text-gray-600">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-8 gap-6">
              {/* --- ROW 1: 4 Cards (Each spans 2 columns in the 8-grid) --- */}

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Active Businesses
                  </CardTitle>
                  <Building className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeBusinesses}
                  </div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Active Professionals
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeProfessionals}
                  </div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Registration Requests
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalInquiries}
                  </div>
                  <p className="text-xs text-gray-500">Pending requests</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl transition-all duration-300 hover:shadow-lg xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900">
                    System Status
                  </CardTitle>
                  <Activity className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.activeBusinesses > 0 || stats.activeProfessionals > 0
                      ? "Excellent"
                      : "Growing"}
                  </div>
                  <p className="text-xs text-gray-500">Platform health</p>
                </CardContent>
              </Card>

              {/* --- ROW 2: 3 Cards (Spans: 3, 3, 2) --- */}

              {/* --- ROW 2: 3 Cards (Spans: 3, 3, 2) --- */}

              {/* Card 1: New Businesses */}
              <Card className="flex flex-col bg-linear-90 overflow-hidden text-black from-[#080322] to-[#A89CFE] px-0 pb-0 border-none shadow-sm rounded-xl transition-all duration-300 hover:shadow-lg xl:col-span-3 min-h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    New Businesses
                  </CardTitle>
                  <Building className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    {businesses.length > 0 ? (
                      <Table>
                        <TableHeader className="">
                          <TableRow>
                            <TableHead className="text-xs flex-1">
                              Name
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Category
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Status
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businesses
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                            )
                            .slice(0, 4)
                            .map((business) => (
                              <TableRow key={business.id}>
                                <TableCell className="text-xs font-medium flex-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {business.logo ? (
                                      <img
                                        src={business.logo}
                                        alt={`${business.name} logo`}
                                        className="h-8 w-8 rounded-full object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Building className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <span className="truncate">
                                      {business.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-auto">
                                  {business.category?.name || "N/A"}
                                </TableCell>
                                <TableCell className="w-auto">
                                  <div
                                    className={`flex items-center gap-1.5 px-1.5 w-fit py-0.5 rounded-full border text-xs font-medium ${
                                      business.isActive
                                        ? "bg-lime-500/10 border-lime-500/30 text-lime-700"
                                        : "bg-gray-500/10 border-gray-500/30 text-gray-600"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        business.isActive
                                          ? "bg-lime-500"
                                          : "bg-gray-500"
                                      }`}
                                    ></span>
                                    {business.isActive ? "Active" : "Inactive"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-auto">
                                  {new Date(
                                    business.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <Building className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">No Data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: New Professionals (Updated Style) */}
              <Card className="flex flex-col bg-linear-90 overflow-hidden text-black from-[#080322] to-[#A89CFE] px-0 pb-0 border-none shadow-sm rounded-xl transition-all duration-300 hover:shadow-lg xl:col-span-3 min-h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    New Professionals
                  </CardTitle>
                  <User className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    {professionals.length > 0 ? (
                      <Table>
                        <TableHeader className="">
                          <TableRow>
                            <TableHead className="text-xs flex-1">
                              Name
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Profession
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Status
                            </TableHead>
                            <TableHead className="text-xs w-auto">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {professionals
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                            )
                            .slice(0, 4)
                            .map((professional) => (
                              <TableRow key={professional.id}>
                                <TableCell className="text-xs font-medium flex-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {professional.profilePicture ? (
                                      <img
                                        src={professional.profilePicture}
                                        alt={`${professional.name} profile`}
                                        className="h-8 w-8 rounded-full object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <span className="truncate">
                                      {professional.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-auto max-w-[150px] truncate">
                                  {professional.professionalHeadline || "N/A"}
                                </TableCell>
                                <TableCell className="w-auto">
                                  <div
                                    className={`flex items-center gap-1.5 px-1.5 w-fit py-0.5 rounded-full border text-xs font-medium ${
                                      professional.isActive
                                        ? "bg-lime-500/10 border-lime-500/30 text-lime-700"
                                        : "bg-gray-500/10 border-gray-500/30 text-gray-600"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        professional.isActive
                                          ? "bg-lime-500"
                                          : "bg-gray-500"
                                      }`}
                                    ></span>
                                    {professional.isActive
                                      ? "Active"
                                      : "Inactive"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs w-auto">
                                  {new Date(
                                    professional.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <User className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">No Data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Latest Contact (Updated Style) */}
              <Card className="flex flex-col bg-linear-90 overflow-hidden text-black from-[#080322] to-[#A89CFE] px-0 pb-0 border-none shadow-sm rounded-xl transition-all duration-300 hover:shadow-lg xl:col-span-2 min-h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Latest Contact
                  </CardTitle>
                  <Mail className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    {inquiries.length > 0 ? (
                      <Table>
                        <TableHeader className="">
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inquiries
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                            )
                            .slice(0, 4)
                            .map((inquiry) => (
                              <TableRow key={inquiry.id}>
                                <TableCell className="text-xs font-medium">
                                  {inquiry.name}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {inquiry.email}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {new Date(
                                    inquiry.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <Mail className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">No Data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* --- ROW 3: 2 Cards (Spans: 6, 2) --- */}

              {/* Card 4: Latest Registration Requests (Updated Style) */}
              <Card className="flex flex-col bg-linear-90 overflow-hidden text-black from-[#080322] to-[#A89CFE] px-0 pb-0 border-none shadow-sm rounded-xl transition-all duration-300 hover:shadow-lg xl:col-span-6 min-h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Latest Registration Requests
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    {registrationInquiries.length > 0 ? (
                      <Table>
                        <TableHeader className="">
                          <TableRow>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">
                              Business/Profession
                            </TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrationInquiries
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                            )
                            .slice(0, 5)
                            .map((inquiry) => (
                              <TableRow  key={inquiry.id}>
                                <TableCell >
                                  <div
                                    className={`flex  items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit  ${
                                      inquiry.type === "BUSINESS"
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-700"
                                        : "bg-purple-500/10 border-purple-500/30 text-purple-700"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        inquiry.type === "BUSINESS"
                                          ? "bg-blue-500"
                                          : "bg-purple-500"
                                      }`}
                                    ></span>
                                    {inquiry.type}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs  font-medium">
                                  {inquiry.name}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {inquiry.type === "BUSINESS"
                                    ? inquiry.businessName || "N/A"
                                    : inquiry.profession || "N/A"}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {inquiry.email}
                                </TableCell>
                                <TableCell>
                                  <div
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit  ${
                                      inquiry.status === "PENDING"
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                                        : inquiry.status === "COMPLETED"
                                          ? "bg-lime-500/10 border-lime-500/30 text-lime-700"
                                          : inquiry.status === "REJECTED"
                                            ? "bg-red-500/10 border-red-500/30 text-red-700"
                                            : "bg-blue-500/10 border-blue-500/30 text-blue-700"
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        inquiry.status === "PENDING"
                                          ? "bg-amber-500"
                                          : inquiry.status === "COMPLETED"
                                            ? "bg-lime-500"
                                            : inquiry.status === "REJECTED"
                                              ? "bg-red-500"
                                              : "bg-blue-500"
                                      }`}
                                    ></span>
                                    {inquiry.status}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {new Date(
                                    inquiry.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                        <UserCheck className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">
                          No Registration Requests
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Quick Actions with card-bg */}
              <Card className="flex flex-col bg-linear-90 overflow-hidden text-black from-[#080322] to-[#A89CFE] px-0 pb-0 border-none shadow-sm rounded-xl transition-all duration-300 hover:shadow-lg xl:col-span-2 min-h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Quick Actions
                  </CardTitle>
                  <Zap className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent className="flex-1 px-0  flex flex-col">
                  <div className="space-y-3 p-4">
                    <button
                      onClick={() => {
                        setRightPanelContent("add-business");
                        setShowRightPanel(true);
                      }}
                      className="w-full py-2.5 cursor-pointer px-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center shadow-lg"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Create Business
                    </button>
                    <button
                      onClick={() => {
                        setRightPanelContent("add-professional");
                        setShowRightPanel(true);
                      }}
                      className="w-full py-2.5 px-4  cursor-pointer rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center shadow-lg"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Create Professional
                    </button>
                    <button
                      onClick={() => {
                        setRightPanelContent("add-category");
                        setShowRightPanel(true);
                      }}
                      className="w-full py-2.5 px-4 cursor-pointer rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center shadow-lg"
                    >
                      <FolderTree className="h-4 w-4 mr-2" />
                      Create Category
                    </button>
                  </div>
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
                    <span className="text-red-600 font-medium">
                      Data Fetching Error
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetchData();
                        fetchBusinesses();
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
              <h1 className="text-lg font-bold text-gray-900">
                Add Businesses
              </h1>
              <p className="text-md text-gray-600">
                Manage and monitor your businesses from this dashboard section.
              </p>
            </div>
            <div className="p-4 sm:p-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                  onClick={() => {
                    setRightPanelContent("add-business");
                    setShowRightPanel(true);
                  }}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-full shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>

                {/* Search Input with Debounce */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    placeholder="Search businesses..."
                    className="pl-10 w-full rounded-full bg-transparent border-none text-white placeholder:text-white/50 focus-visible:ring-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={businessQuery.status}
                  onValueChange={(value) => {
                    setBusinessQuery((prev) => ({
                      ...prev,
                      status: value,
                      page: 1,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full focus-visible:ring-0">
                    <SelectValue
                      placeholder="Filter by Status"
                      className="text-white"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-gray-900">
                      All (
                      {businessData?.pagination.totalItems ||
                        filteredBusinesses.length}
                      )
                    </SelectItem>
                    <SelectItem value="active" className="text-gray-900">
                      Active (
                      {filteredBusinesses.filter((b) => b.isActive).length})
                    </SelectItem>
                    <SelectItem value="inactive" className="text-gray-900">
                      Inactive (
                      {filteredBusinesses.filter((b) => !b.isActive).length})
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="rounded-full border-white/20 text-white hover:bg-white/10 bg-white/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedBusinessIds.size > 0 && (
                <div className="mb-4">
                  <BulkActionsToolbar
                    selectedCount={selectedBusinessIds.size}
                    totalCount={
                      businessData?.pagination.totalItems ||
                      filteredBusinesses.length
                    }
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onBulkActivate={handleBulkActivate}
                    onBulkDeactivate={handleBulkDeactivate}
                    onBulkDelete={handleBulkDelete}
                  />
                </div>
              )}
            </div>

            <div className="bg-white overflow-hidden border-none shadow-sm rounded-xl">
              {/* Data Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-linear-90 from-[#080322] to-[#A89CFE]">
                    <TableRow>
                      <TableHead className="text-white w-12">
                        <Checkbox
                          checked={
                            businessData?.businesses.every((b) =>
                              selectedBusinessIds.has(b.id),
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            if (checked) handleSelectAll();
                            else handleDeselectAll();
                          }}
                          className="border-gray-400"
                        />
                      </TableHead>
                      <TableHead
                        className="text-white cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Business Name
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead className="text-white w-12">Logo</TableHead>
                      <TableHead className="text-white">Admin Email</TableHead>
                      <TableHead
                        className="text-white cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center gap-2">
                          Category
                          {getSortIcon("category")}
                        </div>
                      </TableHead>
                      <TableHead className="text-white text-center"></TableHead>
                      <TableHead className="text-white text-center"></TableHead>
                      <TableHead
                        className="text-white cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort("isActive")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Status
                          {getSortIcon("isActive")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {getSortIcon("createdAt")}
                        </div>
                      </TableHead>
                      <TableHead className="text-white text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessLoading
                      ? // Loading skeleton
                        Array.from({ length: businessQuery.limit }).map(
                          (_, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Skeleton className="h-4 w-4" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-32" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-40" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-12" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-12" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-6 w-16 rounded-full" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-20" />
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2 justify-end">
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                  <Skeleton className="h-8 w-8" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )
                      : businessData?.businesses.map((business) => (
                          <TableRow key={business.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedBusinessIds.has(business.id)}
                                onCheckedChange={() =>
                                  handleSelectBusiness(business.id)
                                }
                                className="border-gray-400"
                              />
                            </TableCell>
                            <TableCell className="text-gray-900 font-medium">
                              {business.name}
                            </TableCell>
                            <TableCell>
                              {business.logo ? (
                                <img
                                  src={business.logo}
                                  alt={`${business.name} logo`}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Building className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {business.admin.email}
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {business.category?.name || "None"}
                            </TableCell>
                            <TableCell className="text-gray-900 text-center">
                              <Badge
                                variant="outline"
                                className="rounded-full bg-amber-50 border-amber-200"
                              >
                                {business._count.products}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-900 text-center">
                              <Badge
                                variant="outline"
                                className="rounded-full bg-blue-50 border-blue-200"
                              >
                                {business._count.inquiries}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit mx-auto ${
                                  business.isActive
                                    ? "bg-lime-500/10 border-lime-500/30 text-lime-700"
                                    : "bg-gray-500/10 border-gray-500/30 text-gray-600"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    business.isActive
                                      ? "bg-lime-500"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                {business.isActive ? "Active" : "Suspended"}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-900">
                              {new Date(
                                business.createdAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                                  onClick={() =>
                                    window.open(
                                      `/catalog/${business.slug}`,
                                      "_blank",
                                    )
                                  }
                                  title="View Business"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                                  onClick={() => handleEditBusiness(business)}
                                  title="Edit Business"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                                  onClick={() =>
                                    handleDuplicateBusiness(business)
                                  }
                                  title="Duplicate Business"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-xl"
                                  onClick={() => handleDeleteBusiness(business)}
                                  title="Delete Business"
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

              {/* Pagination */}
              {businessData && (
                <div className="p-4 sm:p-6 pt-4">
                  <Pagination
                    currentPage={businessData.pagination.page}
                    totalPages={businessData.pagination.totalPages}
                    totalItems={businessData.pagination.totalItems}
                    itemsPerPage={businessData.pagination.limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleLimitChange}
                  />
                </div>
              )}
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full bg-white sm:w-48 rounded-2xl">
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
                                      "_blank",
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
                        <span className="text-red-600 font-medium">
                          Data Fetching Error
                        </span>
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
                    <p className="text-red-600 text-sm mt-1">
                      {dataFetchError}
                    </p>
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
                      There are currently no business or professional
                      registration requests to review.
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
                          <TableHead className="text-gray-900">
                            Contact
                          </TableHead>
                          <TableHead className="text-gray-900">
                            Location
                          </TableHead>
                          <TableHead className="text-gray-900">
                            Status
                          </TableHead>
                          <TableHead className="text-gray-900">Date</TableHead>
                          <TableHead className="text-gray-900">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrationInquiries
                          .filter((inquiry) => {
                            const matchesSearch =
                              inquiry.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              inquiry.email
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              inquiry.businessName
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              inquiry.location
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());
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
                                {new Date(
                                  inquiry.createdAt,
                                ).toLocaleDateString()}
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
                                            inquiry,
                                          )
                                        }
                                        disabled={
                                          creatingAccount === inquiry.id
                                        }
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
                                        onClick={() =>
                                          handleRejectInquiry(inquiry)
                                        }
                                        disabled={
                                          creatingAccount === inquiry.id
                                        }
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

  // --- ADD BUSINESS ---
  if (rightPanelContent === "add-business") {
    return (
      <form id="add-business-form" onSubmit={handleAddBusiness} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <div className="relative">
            <Input name="name" required className="pl-10 rounded-md" placeholder="e.g. Acme Corp" />
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <div className="relative">
            <Textarea name="description" className="pl-10 rounded-md" placeholder="Brief business description..." />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="relative">
            <Select name="categoryId" required>
              <SelectTrigger className="pl-10 rounded-md">
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
            <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="relative">
              <Input name="phone" className="pl-10 rounded-md" placeholder="+91 8080808080" />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <div className="relative">
              <Input name="website" className="pl-10 rounded-md" placeholder="https://example.com" />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <Separator />
        <div>
          <h4 className="font-medium text-sm mb-4">Admin Account Details</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <div className="relative">
                  <Input name="adminName" required className="pl-10 rounded-md" placeholder="Full Name" />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <div className="relative">
                  <Input name="email" type="email" required className="pl-10 rounded-md" placeholder="admin@example.com" />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
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
              className="w-full rounded-md"
            >
              <Key className="h-4 w-4 mr-2" /> Generate Credentials
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="relative">
                  <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="pl-10 rounded-md" placeholder="Auto-generated" />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={generatedPassword}
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-md"
                    placeholder="Generated or manual password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent rounded-md"
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
    );
  }

  // --- EDIT BUSINESS ---
  if (rightPanelContent === "edit-business" && editingBusiness) {
    return (
      <form id="edit-business-form" onSubmit={handleUpdateBusiness} className="space-y-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <div className="relative">
            <Input name="name" defaultValue={editingBusiness.name} required className="pl-10 rounded-md" placeholder="Business name" />
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <div className="relative">
            <Textarea name="description" defaultValue={editingBusiness.description} className="pl-10 rounded-md" placeholder="Business description" />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <div className="relative">
            <Input name="logo" defaultValue={editingBusiness.logo} className="pl-10 rounded-md" placeholder="https://example.com/logo.png" />
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <div className="relative">
              <Input name="address" defaultValue={editingBusiness.address} className="pl-10 rounded-md" placeholder="Business address" />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="relative">
              <Input name="phone" defaultValue={editingBusiness.phone} className="pl-10 rounded-md" placeholder="+91 8080808080" />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <div className="relative">
              <Input name="website" defaultValue={editingBusiness.website} className="pl-10 rounded-md" placeholder="https://example.com" />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <div className="relative">
              <Input name="email" defaultValue={editingBusiness.admin.email} type="email" className="pl-10 rounded-md" placeholder="admin@example.com" />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="relative">
            <Select name="categoryId" defaultValue={editingBusiness.category?.id || ""}>
              <SelectTrigger className="pl-10 rounded-md">
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
            <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </form>
    );
  }

  // --- ADD PROFESSIONAL ---
  if (rightPanelContent === "add-professional") {
    return (
      <form id="add-professional-form" onSubmit={handleAddProfessional} className="space-y-4">
        <div className="space-y-2">
          <Label>Professional Name</Label>
          <div className="relative">
            <Input name="name" required className="pl-10 rounded-md" placeholder="Full Name" />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <div className="relative">
            <Input name="phone" placeholder="+91 8080808080" className="pl-10 rounded-md" />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Separator />
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Login Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admin Name</Label>
              <div className="relative">
                <Input name="adminName" required className="pl-10 rounded-md" placeholder="Admin name" />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <div className="relative">
                <Input name="email" type="email" required className="pl-10 rounded-md" placeholder="admin@example.com" />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
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
            className="w-full rounded-md"
          >
            <Key className="h-4 w-4 mr-2" /> Generate Credentials
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="pl-10 rounded-md" placeholder="Auto-generated" />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={generatedPassword}
                  onChange={(e) => setGeneratedPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-md"
                  placeholder="Generated or manual password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // --- EDIT PROFESSIONAL ---
  if (rightPanelContent === "edit-professional" && editingProfessional) {
    return (
      <form id="edit-professional-form" onSubmit={handleUpdateProfessional} className="space-y-4">
        <div className="space-y-2">
          <Label>Professional Name</Label>
          <div className="relative">
            <Input name="name" defaultValue={editingProfessional.name} required className="pl-10 rounded-md" placeholder="Full Name" />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <div className="relative">
            <Input name="phone" defaultValue={editingProfessional.phone || ""} className="pl-10 rounded-md" placeholder="+91 8080808080" />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Input name="email" defaultValue={editingProfessional.email || ""} type="email" className="pl-10 rounded-md" placeholder="email@example.com" />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </form>
    );
  }

  // --- ADD CATEGORY ---
  if (rightPanelContent === "add-category") {
    return (
      <form id="add-category-form" onSubmit={handleAddCategory} className="space-y-4">
        <div className="space-y-2">
          <Label>Category Name</Label>
          <div className="relative">
            <Input name="name" required className="pl-10 rounded-md" placeholder="Category name" />
            <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <div className="relative">
            <Textarea name="description" className="pl-10 rounded-md" placeholder="Category description..." />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Parent Category</Label>
          <div className="relative">
            <Select name="parentId">
              <SelectTrigger className="pl-10 rounded-md">
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
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </form>
    );
  }

  // --- EDIT CATEGORY ---
  if (rightPanelContent === "edit-category" && editingCategory) {
    return (
      <form id="edit-category-form" onSubmit={handleUpdateCategory} className="space-y-4">
        <div className="space-y-2">
          <Label>Category Name</Label>
          <div className="relative">
            <Input name="name" defaultValue={editingCategory.name} required className="pl-10 rounded-md" placeholder="Category name" />
            <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <div className="relative">
            <Textarea name="description" defaultValue={editingCategory.description} className="pl-10 rounded-md" placeholder="Category description..." />
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Parent Category</Label>
          <div className="relative">
            <Select name="parentId" defaultValue={editingCategory.parentId || "none"}>
              <SelectTrigger className="pl-10 rounded-md">
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
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </form>
    );
  }

  // --- CREATE ACCOUNT FROM INQUIRY ---
  if (rightPanelContent === "create-account-from-inquiry" && (editingBusiness || editingProfessional)) {
    const inquiry = editingBusiness || editingProfessional;
    const isBusiness = !!editingBusiness;

    if (!inquiry) return null;

    return (
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
        }} className="space-y-4">
        
        <div className="bg-gray-50 p-4 rounded-md border">
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
              <div className="relative">
                <Input name="adminName" defaultValue={inquiry.name} required className="pl-10 rounded-md" placeholder="Admin name" />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            {isBusiness && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <Label>Business Name</Label>
                  <div className="relative">
                    <Input name="businessName" defaultValue={(inquiry as any).businessName || inquiry.name} required className="pl-10 rounded-md" placeholder="Business name" />
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <div className="relative">
                    <Textarea name="description" placeholder="Brief description..." className="pl-10 rounded-md" />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Category</Label>
                  <div className="relative">
                    <Select name="categoryId">
                      <SelectTrigger className="pl-10 rounded-md">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                          {safeCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
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
                    <Input name="password" type={showPassword ? "text" : "password"} value={generatedPassword} onChange={(e) => setGeneratedPassword(e.target.value)} className="pl-10 pr-10 rounded-md" placeholder="Generated or manual password" />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); setGeneratedPassword(generatePassword()); }} className="rounded-md">
                  <Key className="h-4 w-4 mr-2" />Generate
                </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return null;
};



  if (loading || isLoading) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div className="fixed inset-0  bg-[url('/dashbaord-bg-2.png')]  bg-center blur-lg  -z-10"></div>
        <div className="fixed inset-0    bg-center bg-white/50  -z-10"></div>
        {/* Top Header Bar */}
        <div className="bg-white border border-gray-200 shadow-sm">
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
    <div className="max-h-screen min-h-screen relative flex">
      <div className="fixed inset-0  bg-[url('/dashbaord-bg-2.png')]  bg-center blur-lg  -z-10"></div>
      <div className="fixed inset-0    bg-center bg-white/50  -z-10"></div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SharedSidebar
          navLinks={menuItems}
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={async () => {
            await logout();
            router.push("/login");
          }}
          onSettings={() => setCurrentView("settings")}
          onCollapsedChange={setSidebarCollapsed}
          isMobile={isMobile}
          headerTitle="Super Admin"
          headerIcon={Shield}
        />

        {/* Middle Content with Header */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar - Now inside content area */}
          <div className="bg-white border-b border-gray-200 shadow-sm shrink-0 h-13 ">
            <div className="flex justify-between items-center px-4 sm:px-6 py-2">
              <div className="hidden md:flex"></div>
              <div className="flex items-center md:hidden">
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
                  <div className="w-8 h-8  rounded-full  bg-black  flex items-center justify-center">
                    <Shield className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto hide-scrollbar pb-20 md:pb-0">
            <div className="p-4 sm:p-6">{renderMiddleContent()}</div>
          </div>
        </div>

        {/* Right Editor Panel - UnifiedModal */}
        <UnifiedModal
          isOpen={showRightPanel}
          onClose={(open) => {
            if (!open) {
              setShowRightPanel(false);
              setRightPanelContent(null);
              setGeneratedPassword("");
              setGeneratedUsername("");
            }
          }}
          title={getRightPanelTitle()}
          description={getRightPanelDescription()}
          footer={getRightPanelFooter()}
        >
          {renderRightPanel()}
        </UnifiedModal>
      </div>


      {/* Business Listing Inquiry Dialog - Now uses UnifiedModal */}
      <UnifiedModal
        isOpen={showBusinessListingInquiryDialog}
        onClose={(open) => {
          if (!open) {
            setShowBusinessListingInquiryDialog(false);
            setSelectedBusinessListingInquiry(null);
          }
        }}
        title="Business Listing Inquiry Details"
        description="Review and manage this business listing inquiry"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowBusinessListingInquiryDialog(false);
                setSelectedBusinessListingInquiry(null);
              }}
              className="rounded-md w-auto px-6"
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
                    updates,
                  );
                }
              }}
              className="rounded-md w-auto px-6 bg-black text-white hover:bg-gray-800"
            >
              Save Changes
            </Button>
          </>
        }
      >
        {selectedBusinessListingInquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Business Name
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry?.businessName ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Contact Name
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry?.contactName ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Email
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry?.email ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Phone
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry.phone || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-900">
                  Business Description
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry?.businessDescription ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">
                  Inquiry Type
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBusinessListingInquiry?.inquiryType ||
                    "Not specified"}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-900">
                  Requirements
                </Label>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                  {selectedBusinessListingInquiry?.requirements ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Update Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="relative">
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
                      <SelectTrigger className="rounded-md pl-10">
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
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <div className="relative">
                    <Select
                      value={
                        selectedBusinessListingInquiry.assignedTo || ""
                      }
                      onValueChange={(value) => {
                        const updated = {
                          ...selectedBusinessListingInquiry,
                          assignedTo: value || null,
                        };
                        setSelectedBusinessListingInquiry(updated);
                      }}
                    >
                      <SelectTrigger className="rounded-md pl-10">
                        <SelectValue placeholder="Select user or leave unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {/* You would fetch users here */}
                        <SelectItem value="admin1">Admin 1</SelectItem>
                        <SelectItem value="admin2">Admin 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
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
                  className="min-h-[100px] rounded-md pl-3"
                />
              </div>
            </div>
          </div>
        )}
      </UnifiedModal>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedBusinessIds.size} businesses? 
              This action cannot be undone and will permanently remove all selected businesses and their associated users.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> This will permanently delete:
            </p>
            <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
              <li>All selected business accounts</li>
              <li>Associated admin users</li>
              <li>All business data (products, inquiries, etc.)</li>
              <li>This action is irreversible</li>
            </ul>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkDeleteDialog(false)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmBulkDelete}
              disabled={bulkActionLoading}
              className="rounded-2xl"
            >
              {bulkActionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedBusinessIds.size} Businesses
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
