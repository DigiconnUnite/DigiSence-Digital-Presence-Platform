import { useCallback } from "react";
import { invalidateCategories } from "@/lib/cacheInvalidation";
import type { Category } from "../types";

interface UseCategoryActionsOptions {
  editingCategory: Category | null;
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  categoryToDelete: Category | null;
  setCategoryToDelete: React.Dispatch<React.SetStateAction<Category | null>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setShowDeleteCategoryDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRightPanel: React.Dispatch<React.SetStateAction<boolean>>;
  setRightPanelContent: React.Dispatch<React.SetStateAction<"add-business" | "edit-business" | "add-professional" | "edit-professional" | "add-category" | "edit-category" | "create-account-from-inquiry" | null>>;
  fetchData: () => Promise<void>;
  queryClient: any;
  toast: (args: { title: string; description: string; variant?: "destructive" }) => void;
}

export function useCategoryActions({
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
}: UseCategoryActionsOptions) {
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.category) {
            setCategories((prev) => [...prev, result.category]);
          }

          invalidateCategories(queryClient);
          await fetchData();

          toast({ title: "Success", description: "Category created successfully!" });
          setShowRightPanel(false);
          setRightPanelContent(null);
          e.currentTarget.reset();
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to create category: ${error.error || "Unknown error"}`,
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
    [fetchData, queryClient, setCategories, setRightPanelContent, setShowRightPanel, toast]
  );

  const handleEditCategory = useCallback(
    (category: Category) => {
      setEditingCategory(category);
      setRightPanelContent("edit-category");
      setShowRightPanel(true);
    },
    [setEditingCategory, setRightPanelContent, setShowRightPanel]
  );

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

      try {
        const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.category) {
            setCategories((prev) =>
              prev.map((c) => (c.id === editingCategory.id ? result.category : c))
            );
          }

          invalidateCategories(queryClient);
          await fetchData();

          setShowRightPanel(false);
          setRightPanelContent(null);
          toast({ title: "Success", description: "Category updated successfully!" });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: `Failed to update category: ${error.error || "Unknown error"}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update category. Please try again.",
          variant: "destructive",
        });
      }
    },
    [editingCategory, fetchData, queryClient, setCategories, setRightPanelContent, setShowRightPanel, toast]
  );

  const handleDeleteCategory = useCallback(
    (category: Category) => {
      setCategoryToDelete(category);
      setShowDeleteCategoryDialog(true);
    },
    [setCategoryToDelete, setShowDeleteCategoryDialog]
  );

  const confirmDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setShowDeleteCategoryDialog(false);
        setCategoryToDelete(null);

        invalidateCategories(queryClient);
        await fetchData();

        toast({ title: "Success", description: "Category deleted successfully" });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: `Failed to delete category: ${error.error || "Unknown error"}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  }, [categoryToDelete, fetchData, queryClient, setCategories, setCategoryToDelete, setShowDeleteCategoryDialog, toast]);

  return {
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
  };
}
