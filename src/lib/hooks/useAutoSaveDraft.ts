import { useState, useEffect, useCallback, useRef } from 'react';

// Auto-save state interface
export interface AutoSaveState {
  lastSaved: string | null;
  isSaving: boolean;
  hasDraft: boolean;
  draftAge: number | null; // in minutes
}

// Draft data interface
export interface DraftData {
  data: Record<string, any>;
  timestamp: string;
  formId: string;
}

// Configuration interface
export interface AutoSaveConfig {
  storageKey: string;
  formId: string;
  saveInterval?: number; // in milliseconds, default 30000 (30 seconds)
  maxDraftAge?: number; // in minutes, default 1440 (24 hours)
  onDraftLoaded?: (data: Record<string, any>) => void;
  onDraftSaved?: (timestamp: string) => void;
  onDraftCleared?: () => void;
}

// Custom hook for auto-saving form data to localStorage
export const useAutoSaveDraft = (config: AutoSaveConfig) => {
  const {
    storageKey,
    formId,
    saveInterval = 30000, // 30 seconds
    maxDraftAge = 1440, // 24 hours
    onDraftLoaded,
    onDraftSaved,
    onDraftCleared,
  } = config;

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    hasDraft: false,
    draftAge: null,
  });

  const [draftData, setDraftData] = useState<Record<string, any>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate storage key with form ID
  const getFullStorageKey = useCallback(() => {
    return `${storageKey}_${formId}`;
  }, [storageKey, formId]);

  // Calculate draft age in minutes
  const calculateDraftAge = useCallback((timestamp: string): number => {
    const draftTime = new Date(timestamp).getTime();
    const now = Date.now();
    return Math.floor((now - draftTime) / 60000); // Convert to minutes
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(async (data: Record<string, any>) => {
    setAutoSaveState((prev) => ({ ...prev, isSaving: true }));

    try {
      const draft: DraftData = {
        data,
        timestamp: new Date().toISOString(),
        formId,
      };

      await new Promise((resolve) => {
        // Simulate async operation
        setTimeout(resolve, 100);
      });

      localStorage.setItem(getFullStorageKey(), JSON.stringify(draft));

      const age = calculateDraftAge(draft.timestamp);

      setAutoSaveState({
        lastSaved: draft.timestamp,
        isSaving: false,
        hasDraft: true,
        draftAge: age,
      });

      setDraftData(data);

      if (onDraftSaved) {
        onDraftSaved(draft.timestamp);
      }

      return draft.timestamp;
    } catch (error) {
      console.error('Failed to save draft:', error);
      setAutoSaveState((prev) => ({ ...prev, isSaving: false }));
      return null;
    }
  }, [formId, getFullStorageKey, calculateDraftAge, onDraftSaved]);

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(getFullStorageKey());
      
      if (!stored) {
        setAutoSaveState({
          lastSaved: null,
          isSaving: false,
          hasDraft: false,
          draftAge: null,
        });
        return null;
      }

      const draft: DraftData = JSON.parse(stored);

      // Check if draft is too old
      const age = calculateDraftAge(draft.timestamp);
      if (age > maxDraftAge) {
        // Draft is too old, clear it
        clearDraft();
        return null;
      }

      setAutoSaveState({
        lastSaved: draft.timestamp,
        isSaving: false,
        hasDraft: true,
        draftAge: age,
      });

      setDraftData(draft.data);

      if (onDraftLoaded) {
        onDraftLoaded(draft.data);
      }

      return draft.data;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [getFullStorageKey, calculateDraftAge, maxDraftAge, onDraftLoaded]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(getFullStorageKey());

      setAutoSaveState({
        lastSaved: null,
        isSaving: false,
        hasDraft: false,
        draftAge: null,
      });

      setDraftData({});

      if (onDraftCleared) {
        onDraftCleared();
      }
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [getFullStorageKey, onDraftCleared]);

  // Auto-save handler
  const autoSave = useCallback((data: Record<string, any>) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(data);
    }, 2000); // Wait 2 seconds after last change before saving
  }, [saveDraft]);

  // Set up periodic auto-save
  useEffect(() => {
    if (autoSaveState.hasDraft) {
      intervalRef.current = setInterval(() => {
        if (Object.keys(draftData).length > 0) {
          saveDraft(draftData);
        }
      }, saveInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSaveState.hasDraft, draftData, saveInterval, saveDraft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update draft age periodically
  useEffect(() => {
    if (!autoSaveState.lastSaved) return;

    const updateAge = () => {
      const age = calculateDraftAge(autoSaveState.lastSaved!);
      setAutoSaveState((prev) => ({ ...prev, draftAge: age }));
    };

    // Update immediately
    updateAge();

    // Then update every minute
    const interval = setInterval(updateAge, 60000);
    return () => clearInterval(interval);
  }, [autoSaveState.lastSaved, calculateDraftAge]);

  return {
    autoSaveState,
    draftData,
    saveDraft,
    loadDraft,
    clearDraft,
    autoSave,
  };
};

// Hook for managing multiple form drafts
export const useFormDrafts = (prefix: string = 'form-draft') => {
  const [drafts, setDrafts] = useState<Record<string, DraftData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all drafts
  const loadAllDrafts = useCallback(() => {
    setIsLoading(true);
    try {
      const allDrafts: Record<string, DraftData> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${prefix}_`)) {
          const draft = JSON.parse(localStorage.getItem(key)!);
          allDrafts[key] = draft;
        }
      }
      
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prefix]);

  // Get a specific draft
  const getDraft = useCallback((formId: string): DraftData | null => {
    const key = `${prefix}_${formId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, [prefix]);

  // Delete a specific draft
  const deleteDraft = useCallback((formId: string) => {
    const key = `${prefix}_${formId}`;
    localStorage.removeItem(key);
    setDrafts((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, [prefix]);

  // Clear all drafts
  const clearAllDrafts = useCallback(() => {
    Object.keys(drafts).forEach((key) => {
      localStorage.removeItem(key);
    });
    setDrafts({});
  }, [drafts]);

  // Get draft count
  const getDraftCount = useCallback((): number => {
    return Object.keys(drafts).length;
  }, [drafts]);

  // Initialize
  useEffect(() => {
    loadAllDrafts();
  }, [loadAllDrafts]);

  return {
    drafts,
    isLoading,
    loadAllDrafts,
    getDraft,
    deleteDraft,
    clearAllDrafts,
    getDraftCount,
  };
};

// Helper function to format draft age
export const formatDraftAge = (minutes: number): string => {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};
