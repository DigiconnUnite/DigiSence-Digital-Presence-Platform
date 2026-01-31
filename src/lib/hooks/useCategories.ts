"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { invalidateCategories } from '@/lib/cacheInvalidation';

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: {
    id: string;
    name: string;
  }[];
  _count?: {
    businesses: number;
  };
}

export interface CategoryQueryParams {
  type?: string;
  parentId?: string | null;
}

// API Functions
const fetchCategories = async (params: CategoryQueryParams = {}): Promise<Category[]> => {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.append('type', params.type);
  if (params.parentId) searchParams.append('parentId', params.parentId);

  const response = await fetch(`/api/categories?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.categories || [];
};

const fetchAdminCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/admin/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch admin categories');
  }
  const data = await response.json();
  return data.categories || [];
};

const fetchCategory = async (id: string): Promise<Category> => {
  // For now, fetch from admin categories and find the specific one
  // Or we could create a dedicated /api/admin/categories/[id] endpoint
  const response = await fetch('/api/admin/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  const data = await response.json();
  const category = data.categories?.find((c: Category) => c.id === id);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }
  const result = await response.json();
  return result.category;
};

const updateCategory = async ({ id, data }: { id: string; data: Partial<Category> }): Promise<Category> => {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }
  const result = await response.json();
  return result.category;
};

const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
};

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryQueryParams) => [...categoryKeys.lists(), params] as const,
  adminLists: () => [...categoryKeys.all, 'admin', 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hooks

/**
 * Hook to fetch public categories with optional filtering
 */
export function useCategories(params: CategoryQueryParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => fetchCategories(params),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Hook to fetch admin categories
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.adminLists(),
    queryFn: fetchAdminCategories,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to create a new category with optimistic update
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.adminLists() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<Category[]>(categoryKeys.adminLists());

      // Optimistically update
      queryClient.setQueryData<Category[]>(categoryKeys.adminLists(), (old) => {
        if (!old) return old;
        const optimisticCategory: Category = {
          ...newCategory as Category,
          id: `temp-${Date.now()}`,
          slug: newCategory.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
          _count: { businesses: 0 },
        };
        return [optimisticCategory, ...old];
      });

      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.adminLists(), context.previousCategories);
      }
      toast({
        title: 'Error',
        description: err.message || 'Failed to create category',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Invalidate all category queries
      invalidateCategories(queryClient);
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Category "${data.name}" created successfully!`,
      });
    },
  });
}

/**
 * Hook to update a category with optimistic update
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateCategory,
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.adminLists() });
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(id) });

      // Snapshot previous values
      const previousCategories = queryClient.getQueryData<Category[]>(categoryKeys.adminLists());
      const previousCategory = queryClient.getQueryData<Category>(categoryKeys.detail(id));

      // Optimistically update admin lists
      queryClient.setQueryData<Category[]>(categoryKeys.adminLists(), (old) => {
        if (!old) return old;
        return old.map((cat) =>
          cat.id === id ? { ...cat, ...data } : cat
        );
      });

      // Optimistically update detail
      if (previousCategory) {
        queryClient.setQueryData(categoryKeys.detail(id), (old: Category | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        });
      }

      return { previousCategories, previousCategory };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.adminLists(), context.previousCategories);
      }
      if (context?.previousCategory) {
        queryClient.setQueryData(categoryKeys.detail(id), context.previousCategory);
      }
      toast({
        title: 'Error',
        description: err.message || 'Failed to update category',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, { id }) => {
      // Invalidate all category queries
      invalidateCategories(queryClient);
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Category "${data.name}" updated successfully!`,
      });
    },
  });
}

/**
 * Hook to delete a category with optimistic update
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.adminLists() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<Category[]>(categoryKeys.adminLists());

      // Optimistically update
      queryClient.setQueryData<Category[]>(categoryKeys.adminLists(), (old) => {
        if (!old) return old;
        return old.filter((cat) => cat.id !== id);
      });

      return { previousCategories, deletedId: id };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.adminLists(), context.previousCategories);
      }
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete category',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Invalidate all category queries
      invalidateCategories(queryClient);
    },
    onSuccess: (_, id) => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
  });
}
