import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessApiResponse, BusinessQueryParams } from "../types";

interface UseBusinessTableOptions {
  debouncedSearch: string;
  toast: (args: { title: string; description: string; variant?: "destructive" }) => void;
}

export function useBusinessTable({ debouncedSearch, toast }: UseBusinessTableOptions) {
  const [businessQuery, setBusinessQuery] = useState<BusinessQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [businessData, setBusinessData] = useState<BusinessApiResponse | null>(null);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);

  const fetchControllerRef = useRef<AbortController | null>(null);
  const fetchRequestRef = useRef(0);

  const fetchBusinesses = useCallback(async () => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    const requestId = ++fetchRequestRef.current;

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

      const response = await fetch(`/api/admin/businesses?${params}`, {
        signal: controller.signal,
      });

      if (response.ok) {
        const data: BusinessApiResponse = await response.json();
        if (fetchRequestRef.current === requestId) {
          setBusinessData(data);
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("Failed to fetch businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive",
      });
    } finally {
      if (fetchRequestRef.current === requestId && fetchControllerRef.current === controller) {
        setBusinessLoading(false);
        fetchControllerRef.current = null;
      }
    }
  }, [businessQuery, toast]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    setBusinessQuery((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  const handleSort = useCallback((column: string) => {
    setBusinessQuery((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setBusinessQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setBusinessQuery((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSelectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (businessData?.businesses) {
      const allIds = businessData.businesses.map((b) => b.id);
      setSelectedBusinessIds(new Set(allIds));
    }
  }, [businessData]);

  const handleDeselectAll = useCallback(() => {
    setSelectedBusinessIds(new Set());
  }, []);

  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const response = await fetch("/api/admin/businesses/export?format=csv");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `businesses-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Businesses exported successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export businesses",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  }, [toast]);

  return {
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
  };
}
