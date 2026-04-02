import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessQueryParams, ProfessionalApiResponse } from "../types";

interface UseProfessionalTableOptions {
  debouncedSearch: string;
  currentView: string;
  toast: (args: { title: string; description: string; variant?: "destructive" }) => void;
}

export function useProfessionalTable({ debouncedSearch, currentView, toast }: UseProfessionalTableOptions) {
  const [professionalQuery, setProfessionalQuery] = useState<BusinessQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [professionalData, setProfessionalData] = useState<ProfessionalApiResponse | null>(null);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<Set<string>>(new Set());
  const [professionalExportLoading, setProfessionalExportLoading] = useState(false);
  const [professionalSortBy, setProfessionalSortBy] = useState("createdAt");
  const [professionalSortOrder, setProfessionalSortOrder] = useState<"asc" | "desc">("desc");

  const fetchControllerRef = useRef<AbortController | null>(null);
  const fetchRequestRef = useRef(0);

  const fetchProfessionals = useCallback(async () => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    const requestId = ++fetchRequestRef.current;

    setProfessionalLoading(true);
    try {
      const params = new URLSearchParams({
        page: professionalQuery.page.toString(),
        limit: professionalQuery.limit.toString(),
        search: professionalQuery.search,
        status: professionalQuery.status,
        sortBy: professionalSortBy,
        sortOrder: professionalSortOrder,
      });

      const response = await fetch(`/api/admin/professionals?${params}`, {
        signal: controller.signal,
      });

      if (response.ok) {
        const data: ProfessionalApiResponse = await response.json();
        if (fetchRequestRef.current === requestId) {
          setProfessionalData(data);
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      console.error("Failed to fetch professionals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch professionals",
        variant: "destructive",
      });
    } finally {
      if (fetchRequestRef.current === requestId && fetchControllerRef.current === controller) {
        setProfessionalLoading(false);
        fetchControllerRef.current = null;
      }
    }
  }, [professionalQuery, professionalSortBy, professionalSortOrder, toast]);

  useEffect(() => {
    if (currentView === "professionals") {
      fetchProfessionals();
    }
  }, [fetchProfessionals, currentView]);

  useEffect(() => {
    setProfessionalQuery((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  const handleProfessionalSort = useCallback((column: string) => {
    if (professionalSortBy === column) {
      setProfessionalSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setProfessionalSortBy(column);
      setProfessionalSortOrder("desc");
    }
    setProfessionalQuery((prev) => ({ ...prev, page: 1 }));
  }, [professionalSortBy]);

  const handleProfessionalPageChange = useCallback((page: number) => {
    setProfessionalQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleProfessionalLimitChange = useCallback((limit: number) => {
    setProfessionalQuery((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSelectProfessional = useCallback((professionalId: string) => {
    setSelectedProfessionalIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(professionalId)) {
        newSet.delete(professionalId);
      } else {
        newSet.add(professionalId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllProfessionals = useCallback(() => {
    if (professionalData?.professionals) {
      const allIds = professionalData.professionals.map((p) => p.id);
      setSelectedProfessionalIds(new Set(allIds));
    }
  }, [professionalData]);

  const handleDeselectAllProfessionals = useCallback(() => {
    setSelectedProfessionalIds(new Set());
  }, []);

  const handleProfessionalExport = useCallback(async () => {
    setProfessionalExportLoading(true);
    try {
      const response = await fetch("/api/admin/professionals/export?format=csv");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `professionals-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Professionals exported successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export professionals",
        variant: "destructive",
      });
    } finally {
      setProfessionalExportLoading(false);
    }
  }, [toast]);

  return {
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
  };
}
