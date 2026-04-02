"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/lib/hooks/useSocket";
import useDebounce from "@/hooks/useDebounce";
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCategories } from '@/lib/cacheInvalidation';
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
  Filter,
  SlidersHorizontal,
  CheckCircle,
  Power,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Pagination, BulkActionsToolbar } from "@/components/ui/pagination";
import SharedSidebar from "../components/SharedSidebar";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import CredentialsModal from "./panels/CredentialsModal";
import { useSocketSync } from "./hooks/useSocketSync";
import { useBulkActions } from "./hooks/useBulkActions";
import { useBusinessTable } from "./hooks/useBusinessTable";
import { useProfessionalTable } from "./hooks/useProfessionalTable";
import { useAdminAuxiliaryState } from "./hooks/useAdminAuxiliaryState";
import { useInquiryActions } from "./hooks/useInquiryActions";
import { useCategoryActions } from "./hooks/useCategoryActions";
import { useBusinessListingActions } from "./hooks/useBusinessListingActions";
import { useRegistrationActions } from "./hooks/useRegistrationActions";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";
import DashboardOverview from "./components/DashboardOverview";
import BusinessesView from "./components/BusinessesView";
import ProfessionalsView from "./components/ProfessionalsView";
import CategoriesView from "./components/CategoriesView";
import InquiriesView from "./components/InquiriesView";
import RegistrationRequestsView from "./components/RegistrationRequestsView";
import BusinessListingsView from "./components/BusinessListingsView";
import type {
  AdminStats,
  Business,
  Category,
  Professional,
} from "./types";

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  const [showDeleteBusinessDialog, setShowDeleteBusinessDialog] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedBusinessListingInquiry, setSelectedBusinessListingInquiry] =
    useState<any>(null);
  const [
    showBusinessListingInquiryDialog,
    setShowBusinessListingInquiryDialog,
  ] = useState(false);
  
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);
  const [creatingAccount, setCreatingAccount] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [addBusinessLoading, setAddBusinessLoading] = useState(false);
  const [editBusinessLoading, setEditBusinessLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const [professionalBulkActionLoading, setProfessionalBulkActionLoading] = useState(false);
  const [addProfessionalLoading, setAddProfessionalLoading] = useState(false);
  const [editProfessionalLoading, setEditProfessionalLoading] = useState(false);
  const [professionalToggleLoading, setProfessionalToggleLoading] = useState<string | null>(null);
  const [showProfessionalBulkDeleteDialog, setShowProfessionalBulkDeleteDialog] = useState(false);
  const [deletingProfessional, setDeletingProfessional] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [showDeleteProfessionalDialog, setShowDeleteProfessionalDialog] = useState(false);

  const adminDataFetchControllerRef = useRef<AbortController | null>(null);
  const adminDataFetchRequestRef = useRef(0);



  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    businessQuery,
    setBusinessQuery,
    businessData,
    setBusinessData,
    businessLoading,
    selectedBusinessIds,
    setSelectedBusinessIds,
    exportLoading,
    fetchBusinesses,
    handleSort,
    handlePageChange,
    handleLimitChange,
    handleSelectBusiness,
    handleSelectAll,
    handleDeselectAll,
    handleExport,
  } = useBusinessTable({ debouncedSearch, toast });

  const {
    professionalQuery,
    setProfessionalQuery,
    professionalData,
    setProfessionalData,
    professionalLoading,
    selectedProfessionalIds,
    setSelectedProfessionalIds,
    professionalExportLoading,
    professionalSortBy,
    professionalSortOrder,
    fetchProfessionals,
    handleProfessionalSort,
    handleProfessionalPageChange,
    handleProfessionalLimitChange,
    handleSelectProfessional,
    handleSelectAllProfessionals,
    handleDeselectAllProfessionals,
    handleProfessionalExport,
  } = useProfessionalTable({ debouncedSearch, currentView, toast });
  
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
  
  const {
    inquiryToDelete,
    setInquiryToDelete,
    showDeleteInquiryDialog,
    setShowDeleteInquiryDialog,
    selectedInquiries,
    setSelectedInquiries,
    inquiryQuery,
    setInquiryQuery,
    inquiryPagination,
    setInquiryPagination,
    selectedRegistrations,
    setSelectedRegistrations,
    selectedRegistrationInquiry,
    setSelectedRegistrationInquiry,
    showRegistrationInquiryDialog,
    setShowRegistrationInquiryDialog,
    registrationQuery,
    setRegistrationQuery,
    registrationPagination,
    setRegistrationPagination,
    selectedCategories,
    setSelectedCategories,
    categoryQuery,
    setCategoryQuery,
    categoryPagination,
    setCategoryPagination,
    categoryToDelete,
    setCategoryToDelete,
    showDeleteCategoryDialog,
    setShowDeleteCategoryDialog,
    businessListingQuery,
    setBusinessListingQuery,
    businessListingPagination,
    setBusinessListingPagination,
    selectedBusinessListings,
    setSelectedBusinessListings,
  } = useAdminAuxiliaryState();
  
  // Reject inquiry dialog state
  const [showRejectInquiryDialog, setShowRejectInquiryDialog] = useState(false);
  const [inquiryToReject, setInquiryToReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const {
    handleViewInquiry,
    handleReplyInquiry,
    handleDeleteInquiry,
    confirmDeleteInquiry,
    handleSelectAllInquiries,
    handleDeselectAllInquiries,
    handleInquiryBulkActivate,
    handleInquiryBulkSuspend,
    handleInquiryBulkDelete,
  } = useInquiryActions({
    inquiries,
    setInquiries,
    selectedInquiries,
    setSelectedInquiries,
    inquiryToDelete,
    setInquiryToDelete,
    setShowDeleteInquiryDialog,
    setShowBulkDeleteDialog,
    toast,
  });

  const {
    handleUpdateBusinessListingInquiry,
  } = useBusinessListingActions({
    setBusinessListingInquiries,
    setShowBusinessListingInquiryDialog,
    setSelectedBusinessListingInquiry,
    toast,
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
  useSocketSync(socket, isConnected, {
    setBusinesses,
    setBusinessData,
    setProfessionals,
    setProfessionalData,
    setRegistrationInquiries,
    setStats,
  });

  // Authentication check
  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
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

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (businessQuery.sortBy !== column) return <div className="w-4 h-4 opacity-30">↕</div>;
    return businessQuery.sortOrder === 'asc' ? 
      <div className="w-4 h-4">↑</div> : 
      <div className="w-4 h-4">↓</div>;
  };

  // Get professional sort icon
  const getProfessionalSortIcon = (column: string) => {
    if (professionalSortBy !== column) return <div className="w-4 h-4 opacity-30">↕</div>;
    return professionalSortOrder === 'asc' ? 
      <div className="w-4 h-4">↑</div> : 
      <div className="w-4 h-4">↓</div>;
  };

  // Handle toggle professional status
  const handleToggleProfessionalStatus = useCallback(
    async (e: React.MouseEvent, professional: Professional) => {
      e.preventDefault();
      setProfessionalToggleLoading(professional.id);
      try {
        const response = await fetch(`/api/admin/professionals/${professional.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !professional.isActive }),
        });

        if (response.ok) {
          // Update the professional in the professionalData state immediately
          setProfessionalData((prev) =>
            prev
              ? {
                  ...prev,
                  professionals: prev.professionals.map((prof) =>
                    prof.id === professional.id
                      ? { ...prof, isActive: !prof.isActive }
                      : prof
                  ),
                }
              : null
          );
          setStats((prev) => ({
            ...prev,
            activeProfessionals: !professional.isActive
              ? prev.activeProfessionals + 1
              : prev.activeProfessionals - 1,
          }));
          fetchProfessionals();
          toast({
            title: 'Success',
            description: `Professional ${!professional.isActive ? 'activated' : 'deactivated'} successfully`,
          });
        } else {
          const error = await response.json();
          toast({ title: 'Error', description: `Failed to update status: ${error.error || 'Unknown error'}`, variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to toggle status', variant: 'destructive' });
      } finally {
        setProfessionalToggleLoading(null);
      }
    },
    [toast, fetchProfessionals]
  );
  
  // Handle delete professional with dialog
  const handleDeleteProfessional = useCallback(
    async (professional: Professional) => {
      setProfessionalToDelete(professional);
      setShowDeleteProfessionalDialog(true);
    },
    []
  );
  
  // Confirm delete professional
  const confirmDeleteProfessional = useCallback(async () => {
    if (!professionalToDelete) return;
    
    setDeletingProfessional(true);
    setShowDeleteProfessionalDialog(false);
    
    try {
      const response = await fetch(`/api/admin/professionals/${professionalToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the professional in the professionalData state immediately
        setProfessionalData((prev) =>
          prev
            ? {
                ...prev,
                professionals: prev.professionals.filter(
                  (prof) => prof.id !== professionalToDelete.id
                ),
                pagination: {
                  ...prev.pagination,
                  totalItems: prev.pagination.totalItems - 1,
                },
              }
            : null
        );
        setStats((prev) => ({
          ...prev,
          totalProfessionals: prev.totalProfessionals - 1,
          activeProfessionals: professionalToDelete.isActive ? prev.activeProfessionals - 1 : prev.activeProfessionals,
        }));
        fetchProfessionals();
        toast({
          title: 'Success',
          description: 'Professional deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: `Failed to delete professional: ${error.error || 'Unknown error'}`, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete professional', variant: 'destructive' });
    } finally {
      setDeletingProfessional(false);
      setProfessionalToDelete(null);
    }
  }, [professionalToDelete, toast, fetchProfessionals]);

  // Data fetching function - Fixed to handle individual API failures gracefully
  const fetchData = useCallback(async () => {
    adminDataFetchControllerRef.current?.abort();
    const controller = new AbortController();
    adminDataFetchControllerRef.current = controller;
    const requestId = ++adminDataFetchRequestRef.current;

    setIsLoading(true);
    setDataFetchError(null);

    try {
      // Fetch each API separately to avoid Promise.all failure
      const fetchPromises = [
        { name: 'businesses', url: "/api/admin/businesses" },
        { name: 'categories', url: "/api/admin/categories" },
        { name: 'inquiries', url: "/api/inquiries" },
        { name: 'professionals', url: "/api/admin/professionals" },
        { name: 'businessListingInquiries', url: "/api/business-listing-inquiries" },
        { name: 'registrationInquiries', url: "/api/registration-inquiries" },
      ];

      const results: Record<string, any> = {};
      
      // Fetch all data individually
      await Promise.all(
        fetchPromises.map(async (item) => {
          try {
            const response = await fetch(item.url, { signal: controller.signal });
            if (response.ok) {
              results[item.name] = await response.json();
            } else {
              results[item.name] = null;
            }
          } catch (error) {
            results[item.name] = null;
          }
        })
      );

      // Extract data from API responses with proper error handling
      const businessesArray = Array.isArray(results.businesses?.businesses) ? results.businesses.businesses : [];
      const categoriesArray = Array.isArray(results.categories?.categories) ? results.categories.categories : [];
      const inquiriesArray = Array.isArray(results.inquiries?.inquiries) ? results.inquiries.inquiries : [];
      const professionalsArray = Array.isArray(results.professionals?.professionals) ? results.professionals.professionals : [];
      const businessListingInquiriesArray = Array.isArray(results.businessListingInquiries?.businessListingInquiries) 
        ? results.businessListingInquiries.businessListingInquiries 
        : [];
      
      // Fix: Handle registration inquiries response properly
      let registrationInquiriesArray: any[] = [];
      if (results.registrationInquiries) {
        if (Array.isArray(results.registrationInquiries.inquiries)) {
          registrationInquiriesArray = results.registrationInquiries.inquiries;
        } else if (Array.isArray(results.registrationInquiries)) {
          registrationInquiriesArray = results.registrationInquiries;
        } else if (results.registrationInquiries.inquiries) {
          registrationInquiriesArray = results.registrationInquiries.inquiries;
        }
      }

      if (adminDataFetchRequestRef.current !== requestId) {
        return;
      }

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
        totalBusinesses: businessesArray.length,
        totalInquiries: registrationInquiriesArray.length,
        totalUsers,
        activeBusinesses,
        totalProducts,
        totalActiveProducts,
        totalProfessionals: professionalsArray.length,
        activeProfessionals,
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error("Failed to fetch data:", error);
      setDataFetchError("Failed to fetch data. Please try again.");
    } finally {
      if (
        adminDataFetchRequestRef.current === requestId &&
        adminDataFetchControllerRef.current === controller
      ) {
        setIsLoading(false);
        adminDataFetchControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      adminDataFetchControllerRef.current?.abort();
    };
  }, []);

  // Business bulk actions
  const businessBulkActions = useBulkActions('business', selectedBusinessIds, {
    fetchData,
    fetchEntities: fetchBusinesses,
    setSelectedIds: setSelectedBusinessIds,
    setLoading: setBulkActionLoading,
    setShowDeleteDialog: setShowBulkDeleteDialog,
  });

  // Professional bulk actions
  const professionalBulkActions = useBulkActions('professional', selectedProfessionalIds, {
    fetchData,
    fetchEntities: fetchProfessionals,
    setSelectedIds: setSelectedProfessionalIds,
    setLoading: setProfessionalBulkActionLoading,
    setShowDeleteDialog: setShowProfessionalBulkDeleteDialog,
  });

  const {
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  } = useCategoryActions({
    editingCategory,
    setEditingCategory,
    categoryToDelete,
    setCategoryToDelete,
    setCategories,
    setShowDeleteCategoryDialog,
    setShowRightPanel,
    setRightPanelContent,
    fetchData,
    queryClient,
    toast,
  });

  // Generate password utility - cryptographically secure
  const generatePassword = useCallback(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "Adm@";
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(randomValues[i] % chars.length);
    }
    return password;
  }, []);

  const {
    handleCreateAccountFromInquiry,
    handleCreateAccountFromInquiryWithSidebar,
    handleRejectInquiry,
    confirmRejectInquiry,
  } = useRegistrationActions({
    setCreatingAccount,
    setRegistrationInquiries,
    setEditingBusiness,
    setEditingProfessional,
    setRightPanelContent,
    setShowRightPanel,
    setInquiryToReject,
    setRejectReason,
    setShowRejectInquiryDialog,
    inquiryToReject,
    rejectReason,
    fetchData,
    toast,
  });

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [generatedPassword, setGeneratedPassword] = useState("");
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    name?: string;
    type?: 'business' | 'professional';
  } | null>(null);

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
      setAddBusinessLoading(true);
      const formData = new FormData(e.currentTarget);

      const manualUsername = formData.get("username") as string;
      const manualPassword = formData.get("password") as string;

      const businessData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: manualPassword || generatedPassword || generatePassword(),
        adminName: formData.get("adminName") as string,
        categoryId: formData.get("categoryId") as string,
        description: (formData.get("description") as string) || "",
        address: (formData.get("address") as string) || "",
        phone: (formData.get("phone") as string) || "",
        website: (formData.get("website") as string) || "",
      };

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
          // Show credentials in modal instead of toast
          setCredentials({
            email: businessData.email,
            password: businessData.password,
            name: businessData.name,
            type: 'business'
          });
          setShowCredentialsModal(true);
          setShowRightPanel(false);
          setRightPanelContent(null);
          setGeneratedPassword("");
          setGeneratedUsername("");
          // Reset form safely
          if (e.currentTarget) {
            e.currentTarget.reset();
          }
          // Refresh paginated data to show the new business
          fetchBusinesses();
          // Also refresh full data
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
      } finally {
        setAddBusinessLoading(false);
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

      setEditBusinessLoading(true);
      const formData = new FormData(e.currentTarget);

      const updateData = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || "",
        logo: (formData.get("logo") as string) || "",
        address: (formData.get("address") as string) || "",
        phone: (formData.get("phone") as string) || "",
        email: formData.get("email") as string,
        website: (formData.get("website") as string) || "",
        categoryId: formData.get("categoryId") as string,
      };

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
          // Update the business in the local state immediately
          setBusinesses((prev) =>
            prev.map((biz) =>
              biz.id === editingBusiness.id
                ? { ...biz, ...updateData }
                : biz
            )
          );

          // Also refresh paginated data to ensure consistency
          fetchBusinesses();

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
        setEditBusinessLoading(false);
      }
    },
    [editingBusiness, toast, fetchBusinesses]
  );

  // Handle delete business with improved error handling
  const handleDeleteBusiness = useCallback(
    async (business: Business) => {
      // Show dialog instead of browser alert
      setDeleteBusiness(business);
      setShowDeleteBusinessDialog(true);
    },
    []
  );

  // Confirm and perform delete business
  const confirmDeleteBusiness = useCallback(async () => {
    if (!deleteBusiness) return;
    
    setDeletingBusiness(true);
    setShowDeleteBusinessDialog(false);
    
    try {
      const response = await fetch(`/api/admin/businesses/${deleteBusiness.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted business from the local state immediately
        setBusinesses((prev) => {
          const updatedBusinesses = prev.filter((biz) => biz.id !== deleteBusiness.id);
          return updatedBusinesses;
        });

        // Update stats immediately
        setStats((prev) => ({
          ...prev,
          totalBusinesses: prev.totalBusinesses - 1,
          totalUsers: prev.totalUsers - 1,
          activeBusinesses: deleteBusiness.isActive
            ? prev.activeBusinesses - 1
            : prev.activeBusinesses,
          totalProducts: prev.totalProducts - deleteBusiness._count.products,
          totalActiveProducts: deleteBusiness.isActive
            ? prev.totalActiveProducts - deleteBusiness._count.products
            : prev.totalActiveProducts,
        }));



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
    } finally {
      setDeletingBusiness(false);
      setDeleteBusiness(null);
    }
  }, [deleteBusiness, toast, fetchBusinesses]);

  // Handle toggle business status
  const handleToggleBusinessStatus = useCallback(
    async (e: React.MouseEvent, business: Business) => {
      e.preventDefault();
      setToggleLoading(business.id);
      try {
        const response = await fetch(`/api/admin/businesses/${business.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !business.isActive }),
        });

        if (response.ok) {
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
      } finally {
        setToggleLoading(null);
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
        const response = await fetch(`/api/admin/businesses/${business.id}/duplicate`, {
          method: "POST",
        });

        if (response.ok) {
          const result = await response.json();
          // Refresh data to show the new business
          fetchBusinesses();
          fetchData();

          // Show credentials in modal instead of toast
          setCredentials({
            email: result.loginCredentials.email,
            password: result.loginCredentials.password,
            name: result.name,
            type: 'business'
          });
          setShowCredentialsModal(true);
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
          // Show credentials in modal instead of toast
          setCredentials({
            email: professionalData.email,
            password: professionalData.password,
            name: professionalData.name,
            type: 'professional'
          });
          setShowCredentialsModal(true);
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
          fetchProfessionals();
          setProfessionalQuery(prev => ({ ...prev, page: 1 }));
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

      try {
        const response = await fetch(
          `/api/admin/professionals/${editingProfessional.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          // Update the professional in the professionalData state immediately
          setProfessionalData((prev) =>
            prev
              ? {
                  ...prev,
                  professionals: prev.professionals.map((prof) =>
                    prof.id === editingProfessional.id
                      ? { ...prof, ...updateData }
                      : prof
                  ),
                }
              : null
          );

          // Refresh from API to ensure consistency
          fetchProfessionals();

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
    [editingProfessional, toast, fetchProfessionals]
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
            <Button type="submit" form={formId} disabled={rightPanelContent === "add-business" ? addBusinessLoading : editBusinessLoading} className="rounded-md w-auto flex-1 bg-black text-white hover:bg-gray-800">
              {rightPanelContent === "add-business" ? (
                addBusinessLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Business"
                )
              ) : (
                editBusinessLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )
              )}
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
      title: "Contact Inquiry",
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
            {/* Stats Overview - Match actual 8-column grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
              {/* 4 Stats cards - each spans 2 columns in 8-grid */}
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white border border-gray-200 shadow-sm rounded-3xl xl:col-span-2"
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
              {/* New Businesses Card - spans 4 columns */}
              <Card className="flex flex-col  overflow-hidden text-black bg-[#080322]  px-0 pb-0 border-none shadow-sm rounded-xl xl:col-span-4 min-h-[300px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32 bg-white/50" />
                  <Skeleton className="h-4 w-4 rounded bg-white/50" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white">
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32 flex-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* New Professionals Card - spans 4 columns */}
              <Card className="flex flex-col  overflow-hidden text-black bg-[#080322]  px-0 pb-0 border-none shadow-sm rounded-xl xl:col-span-4 min-h-[300px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32 bg-white/50" />
                  <Skeleton className="h-4 w-4 rounded bg-white/50" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white">
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32 flex-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Registration Requests Card - spans 6 columns */}
              <Card className="flex flex-col  overflow-hidden text-black bg-[#080322]  px-0 pb-0 border-none shadow-sm rounded-xl xl:col-span-6 min-h-[300px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-48 bg-white/50" />
                  <Skeleton className="h-4 w-4 rounded bg-white/50" />
                </CardHeader>
                <CardContent className="flex-1 px-0 bg-white">
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32 flex-1" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Quick Actions Card - spans 2 columns */}
              <Card className="flex flex-col  overflow-hidden text-black bg-[#080322]  px-0 pb-0 border-none shadow-sm rounded-xl xl:col-span-2 min-h-[300px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-28 bg-white/50" />
                  <Skeleton className="h-4 w-4 rounded bg-white/50" />
                </CardHeader>
                <CardContent className="flex-1 px-0">
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-full bg-white/30" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "businesses":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            {/* Toolbar */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Data Table - Match actual table structure */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-12"><Skeleton className="h-4 w-4 bg-white/50" /></TableHead>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-16 bg-white/50 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "professionals":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            {/* Toolbar */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Data Table - Match actual professionals table structure */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-12"><Skeleton className="h-4 w-4 bg-white/50" /></TableHead>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-16 bg-white/50 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            {/* Toolbar */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Data Table - Match AdminTable structure */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-32 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-28 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-20 bg-white/50 mx-auto" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                            {i === 1 && <Skeleton className="h-5 w-10 rounded-full" />}
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-6 w-10 rounded-full mx-auto" />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "inquiries":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-56 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            {/* Toolbar */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Data Table */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-32 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-16 bg-white/50 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "registration-requests":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            {/* Search */}
            <Skeleton className="h-10 w-full rounded-xl" />
            {/* Data Table */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-28 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-16 bg-white/50 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "business-listings":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-6">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            {/* Toolbar */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            {/* Data Table */}
            <div className="bg-white rounded-md  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#080322]">
                    <TableRow>
                      <TableHead className="w-12"><Skeleton className="h-4 w-4 bg-white/50" /></TableHead>
                      <TableHead className="w-14"><Skeleton className="h-4 w-8 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-32 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24 bg-white/50" /></TableHead>
                      <TableHead className="text-center"><Skeleton className="h-4 w-16 bg-white/50 mx-auto" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-20 bg-white/50" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-16 bg-white/50" /></TableHead>
                      <TableHead className="text-right w-32"><Skeleton className="h-4 w-16 bg-white/50 ml-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-40 w-full" />
                </Card>
              ))}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6 pb-20 md:pb-0">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-64" />
            </div>
            <Card className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-10 w-32 rounded-2xl" />
              </div>
            </Card>
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



    // Ensure categories is always an array
    const safeCategories = Array.isArray(categories) ? categories : [];

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardOverview
            stats={stats}
            businesses={businesses}
            professionals={professionals}
            registrationInquiries={registrationInquiries}
            onAddBusiness={() => {
              setRightPanelContent("add-business");
              setShowRightPanel(true);
            }}
            onAddProfessional={() => {
              setRightPanelContent("add-professional");
              setShowRightPanel(true);
            }}
            onAddCategory={() => {
              setRightPanelContent("add-category");
              setShowRightPanel(true);
            }}
          />
        );
      case "businesses":
        return (
          <BusinessesView
            dataFetchError={dataFetchError}
            fetchData={fetchData}
            fetchBusinesses={fetchBusinesses}
            businessQuery={businessQuery}
            setBusinessQuery={setBusinessQuery}
            businessData={businessData}
            filteredBusinesses={filteredBusinesses}
            handleExport={handleExport}
            exportLoading={exportLoading}
            onOpenAddBusiness={() => {
              setRightPanelContent("add-business");
              setShowRightPanel(true);
            }}
            addBusinessLoading={addBusinessLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedBusinessIds={selectedBusinessIds}
            handleSelectAll={handleSelectAll}
            handleDeselectAll={handleDeselectAll}
            handleSelectBusiness={handleSelectBusiness}
            businessBulkActions={businessBulkActions}
            businessLoading={businessLoading}
            toggleLoading={toggleLoading}
            handleToggleBusinessStatus={handleToggleBusinessStatus}
            handleEditBusiness={handleEditBusiness}
            handleDeleteBusiness={handleDeleteBusiness}
            handlePageChange={handlePageChange}
            handleLimitChange={handleLimitChange}
          />
        );
      case "professionals":
        return (
          <ProfessionalsView
            dataFetchError={dataFetchError}
            fetchData={fetchData}
            fetchProfessionals={fetchProfessionals}
            professionalQuery={professionalQuery}
            setProfessionalQuery={setProfessionalQuery}
            professionalData={professionalData}
            professionals={professionals}
            handleProfessionalExport={handleProfessionalExport}
            professionalExportLoading={professionalExportLoading}
            onOpenAddProfessional={() => {
              setRightPanelContent("add-professional");
              setShowRightPanel(true);
            }}
            addProfessionalLoading={addProfessionalLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedProfessionalIds={selectedProfessionalIds}
            handleSelectAllProfessionals={handleSelectAllProfessionals}
            handleDeselectAllProfessionals={handleDeselectAllProfessionals}
            handleSelectProfessional={handleSelectProfessional}
            professionalBulkActions={professionalBulkActions}
            professionalLoading={professionalLoading}
            handleProfessionalSort={handleProfessionalSort}
            getProfessionalSortIcon={getProfessionalSortIcon}
            professionalToggleLoading={professionalToggleLoading}
            handleToggleProfessionalStatus={handleToggleProfessionalStatus}
            handleEditProfessional={handleEditProfessional}
            handleDeleteProfessional={handleDeleteProfessional}
            handleProfessionalPageChange={handleProfessionalPageChange}
            handleProfessionalLimitChange={handleProfessionalLimitChange}
          />
        );
      case "categories":
        return (
          <CategoriesView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onOpenAddCategory={() => {
              setRightPanelContent("add-category");
              setShowRightPanel(true);
            }}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            safeCategories={safeCategories}
            filteredCategories={filteredCategories}
            onInfoToast={(description) => {
              toast({ title: "Info", description });
            }}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
        );
      case "inquiries":
        return (
          <InquiriesView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            inquiries={inquiries}
            selectedInquiries={selectedInquiries}
            handleSelectAllInquiries={handleSelectAllInquiries}
            handleDeselectAllInquiries={handleDeselectAllInquiries}
            handleInquiryBulkActivate={handleInquiryBulkActivate}
            handleInquiryBulkSuspend={handleInquiryBulkSuspend}
            handleInquiryBulkDelete={handleInquiryBulkDelete}
            handleViewInquiry={handleViewInquiry}
            handleReplyInquiry={handleReplyInquiry}
            handleDeleteInquiry={handleDeleteInquiry}
            inquiryQuery={inquiryQuery}
            setInquiryQuery={setInquiryQuery}
            inquiryPagination={inquiryPagination}
          />
        );
      case "registration-requests":
        return (
          <RegistrationRequestsView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            registrationInquiries={registrationInquiries}
            isLoading={isLoading}
            dataFetchError={dataFetchError}
            fetchData={fetchData}
            selectedRegistrationInquiry={selectedRegistrationInquiry}
            setSelectedRegistrationInquiry={setSelectedRegistrationInquiry}
            showRegistrationInquiryDialog={showRegistrationInquiryDialog}
            setShowRegistrationInquiryDialog={setShowRegistrationInquiryDialog}
            handleCreateAccountFromInquiryWithSidebar={handleCreateAccountFromInquiryWithSidebar}
            handleRejectInquiry={handleRejectInquiry}
            confirmRejectInquiry={confirmRejectInquiry}
            creatingAccount={creatingAccount}
            inquiryToReject={inquiryToReject}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            setInquiryToReject={setInquiryToReject}
            showRejectInquiryDialog={showRejectInquiryDialog}
            setShowRejectInquiryDialog={setShowRejectInquiryDialog}
            toast={toast}
          />
        );
      case "business-listings":
        return (
          <BusinessListingsView
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            businessListingInquiries={businessListingInquiries}
            selectedBusinessListings={selectedBusinessListings}
            setSelectedBusinessListings={setSelectedBusinessListings}
            fetchData={fetchData}
            setSelectedBusinessListingInquiry={setSelectedBusinessListingInquiry}
            setShowBusinessListingInquiryDialog={setShowBusinessListingInquiryDialog}
            businessListingBulkToast={(description) => toast({ title: "Info", description })}
          />
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
          <div className="space-y-4 ">
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
           
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="relative">
                  <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="pl-10 pr-20 rounded-md" placeholder="Auto-generated" />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 rounded-none hover:bg-transparent border-l"
                    onClick={(e) => {
                      e.preventDefault();
                      const form = document.getElementById("add-business-form") as HTMLFormElement;
                      const businessName = (form?.querySelector('input[name="name"]') as HTMLInputElement)?.value || "";
                      const adminName = (form?.querySelector('input[name="adminName"]') as HTMLInputElement)?.value || "";
                      const baseUsername = adminName.toLowerCase().replace(/[^a-z0-9]/g, "") || businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
                      setGeneratedUsername(`${baseUsername}_${Date.now().toString().slice(-4)}`);
                    }}
                  >
                    <Key className="h-3 w-3" />
                  </Button>
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
                    className="pl-10 pr-20 rounded-md"
                    placeholder="Generated or manual password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <div className="absolute  right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent border-l rounded-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent border-l rounded-none"
                      onClick={(e) => {
                        e.preventDefault();
                        setGeneratedPassword(generatePassword());
                      }}
                    >
                      <Key className="h-3 w-3" />
                    </Button>
                  </div>
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
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="pl-10 pr-20 rounded-md" placeholder="Auto-generated" />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 border-l rounded-none bg-none"
                  onClick={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget.closest("form") as HTMLFormElement;
                    const professionalName = (form?.querySelector('input[name="name"]') as HTMLInputElement)?.value || "";
                    const adminName = (form?.querySelector('input[name="adminName"]') as HTMLInputElement)?.value || "";
                    const baseUsername = adminName.toLowerCase().replace(/[^a-z0-9]/g, "") || professionalName.toLowerCase().replace(/[^a-z0-9]/g, "");
                    setGeneratedUsername(`${baseUsername}_${Date.now().toString().slice(-4)}`);
                  }}
                >
                  <Key className="h-3 w-3" />
                </Button>
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
                  className="pl-10 pr-20 rounded-md"
                  placeholder="Generated or manual password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent border-l rounded-none" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent border-l rounded-none" onClick={(e) => { e.preventDefault(); setGeneratedPassword(generatePassword()); }} aria-label="Generate password">
                    <Key className="h-3 w-3" />
                  </Button>
                </div>
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
          try {
            const response = await fetch(`/api/admin/registration-inquiries/${inquiry.id}/approve`, {
              method: "POST",
            });

            if (response.ok) {
              setRegistrationInquiries((prev) => prev.map((regInquiry) => regInquiry.id === inquiry.id ? { ...regInquiry, status: "COMPLETED" } : regInquiry));
              toast({ title: "Success", description: `Account created! Credentials sent to ${inquiry.email}` });
              closePanel();
              fetchData();
            } else {
              const error = await response.json().catch(() => ({}));
              toast({ title: "Error", description: error.error || "Failed to create account.", variant: "destructive" });
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
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              const form = e.currentTarget.closest("form") as HTMLFormElement;
              const adminNameInput = form?.querySelector('input[name="adminName"]') as HTMLInputElement;
              const name = adminNameInput?.value || "";
              const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
              setGeneratedUsername(`${baseUsername}_${Date.now().toString().slice(-4)}`);
            }}
            className="w-full rounded-md"
          >
            <User className="h-4 w-4 mr-2" /> Generate Username
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <Input name="username" value={generatedUsername} onChange={(e) => setGeneratedUsername(e.target.value)} className="pl-10 pr-20 rounded-md" placeholder="Auto-generated" />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 rounded-md"
                  onClick={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget.closest("form") as HTMLFormElement;
                    const adminNameInput = form?.querySelector('input[name="adminName"]') as HTMLInputElement;
                    const name = adminNameInput?.value || "";
                    const baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
                    setGeneratedUsername(`${baseUsername}_${Date.now().toString().slice(-4)}`);
                  }}
                >
                  <Key className="h-3 w-3" />
                </Button>
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
                  className="pl-10 pr-20 rounded-md"
                  placeholder="Generated or manual password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8 px-2 rounded-md" onClick={(e) => { e.preventDefault(); setGeneratedPassword(generatePassword()); }} aria-label="Generate password">
                    <Key className="h-3 w-3" />
                  </Button>
                </div>
              </div>
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
        <div className="fixed inset-0     bg-center bg-slate-200  -z-10"></div>
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
            <div className="flex-1   p-4 max-w-7xl mx-auto sm:p-6 overflow-auto hide-scrollbar">
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
      <div className="fixed inset-0    bg-slate-200  -z-10"></div>

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
                <img src="/logo.png" alt="DigiSense" className="h-8 w-auto" />
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
            <div className="p-4 max-w-7xl mx-auto sm:p-6">{renderMiddleContent()}</div>
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
      <DeleteConfirmationDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Confirm Bulk Delete"
        description={`Delete ${selectedBusinessIds.size} businesses? This action cannot be undone.`}
        items={["Selected business accounts", "Associated admin users & data"]}
        onConfirm={businessBulkActions.confirmBulkDelete}
        loading={bulkActionLoading}
        confirmText="Delete"
        itemCount={selectedBusinessIds.size}
      />

      <DeleteConfirmationDialog
        open={showProfessionalBulkDeleteDialog}
        onOpenChange={setShowProfessionalBulkDeleteDialog}
        title="Confirm Bulk Delete"
        description={`Delete ${selectedProfessionalIds.size} professionals? This action cannot be undone.`}
        items={["Selected professional accounts", "Associated profile data"]}
        onConfirm={professionalBulkActions.confirmBulkDelete}
        loading={professionalBulkActionLoading}
        confirmText="Delete"
        itemCount={selectedProfessionalIds.size}
      />

      {/* Delete Business Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteBusinessDialog}
        onOpenChange={setShowDeleteBusinessDialog}
        title="Delete Business"
        description={`Delete "${deleteBusiness?.name}"? This action cannot be undone.`}
        items={["Business account & listing", "Associated admin user & data"]}
        onConfirm={confirmDeleteBusiness}
        onCancel={() => setDeleteBusiness(null)}
        loading={deletingBusiness}
      />

      {/* Delete Professional Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteProfessionalDialog}
        onOpenChange={setShowDeleteProfessionalDialog}
        title="Delete Professional"
        description={`Delete "${professionalToDelete?.name}"? This action cannot be undone.`}
        items={["Professional profile & account", "Skills, education & portfolio"]}
        onConfirm={confirmDeleteProfessional}
        onCancel={() => setProfessionalToDelete(null)}
        loading={deletingProfessional}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteCategoryDialog}
        onOpenChange={setShowDeleteCategoryDialog}
        title="Delete Category"
        description={`Delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        items={["Category & subcategories", "Associated business references"]}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />

      {/* Reject Registration Request Dialog */}
      <Dialog open={showRejectInquiryDialog} onOpenChange={setShowRejectInquiryDialog}>
        <DialogContent className="rounded-2xl max-w-sm p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Reject Registration Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reject request from "{inquiryToReject?.name}"? A notification will be sent.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-900 ml-1">{inquiryToReject?.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 ml-1 truncate">{inquiryToReject?.email}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rejectReason" className="text-xs font-medium text-gray-900">
              Reason (optional)
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              className="rounded-xl resize-none text-xs h-16"
            />
          </div>
          <DialogFooter className="pt-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowRejectInquiryDialog(false);
                setInquiryToReject(null);
                setRejectReason("");
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={confirmRejectInquiry}
              disabled={creatingAccount === inquiryToReject?.id}
              className="rounded-xl"
            >
              {creatingAccount === inquiryToReject?.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Inquiry Details Dialog */}
      <Dialog open={showRegistrationInquiryDialog} onOpenChange={setShowRegistrationInquiryDialog}>
        <DialogContent className="rounded-2xl max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Registration Request Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Full details of the registration request
            </DialogDescription>
          </DialogHeader>
          {selectedRegistrationInquiry && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Type</span>
                    <p className="font-medium text-gray-900">
                      {selectedRegistrationInquiry.type === 'BUSINESS' ? 'Business' : 'Professional'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Status</span>
                    <p className="font-medium text-gray-900">
                      <StatusBadge
                        status={selectedRegistrationInquiry.status}
                        variant={selectedRegistrationInquiry.status === 'PENDING' ? 'warning' : selectedRegistrationInquiry.status === 'COMPLETED' ? 'success' : selectedRegistrationInquiry.status === 'REJECTED' ? 'error' : 'info'}
                      />
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Name</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Email</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Phone</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Location</span>
                    <p className="font-medium text-gray-900">{selectedRegistrationInquiry.location || 'Not provided'}</p>
                  </div>
                  {selectedRegistrationInquiry.type === 'BUSINESS' && (
                    <>
                      <div className="col-span-2">
                        <span className="text-gray-500 text-xs">Business Name</span>
                        <p className="font-medium text-gray-900">{selectedRegistrationInquiry.businessName || 'Not provided'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 text-xs">Business Description</span>
                        <p className="font-medium text-gray-900">{selectedRegistrationInquiry.businessDescription || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Website</span>
                        <p className="font-medium text-gray-900">{selectedRegistrationInquiry.website || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                  {selectedRegistrationInquiry.type === 'PROFESSIONAL' && (
                    <>
                      <div>
                        <span className="text-gray-500 text-xs">Profession</span>
                        <p className="font-medium text-gray-900">{selectedRegistrationInquiry.profession || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">About Me</span>
                        <p className="font-medium text-gray-900">{selectedRegistrationInquiry.aboutMe || 'Not provided'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-500 text-xs">Submitted On</span>
                    <p className="font-medium text-gray-900">
                      {selectedRegistrationInquiry.createdAt ? new Date(selectedRegistrationInquiry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not provided'}
                    </p>
                  </div>
                  {selectedRegistrationInquiry.status === 'REJECTED' && selectedRegistrationInquiry.rejectReason && (
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs">Reject Reason</span>
                      <p className="font-medium text-red-600">{selectedRegistrationInquiry.rejectReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowRegistrationInquiryDialog(false);
                setSelectedRegistrationInquiry(null);
              }}
              className="rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={credentials}
      />
    </div>
  );
}
