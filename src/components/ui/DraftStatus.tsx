"use client";

import React from 'react';
import { AutoSaveState } from '@/lib/hooks/useAutoSaveDraft';
import { formatDraftAge } from '@/lib/hooks/useAutoSaveDraft';
import { cn } from '@/lib/utils';
import { Save, Loader2, AlertCircle, CheckCircle2, Trash2, RotateCcw } from 'lucide-react';

interface DraftStatusProps {
  autoSaveState: AutoSaveState;
  onLoadDraft: () => void;
  onClearDraft: () => void;
  className?: string;
}

export const DraftStatus = ({
  autoSaveState,
  onLoadDraft,
  onClearDraft,
  className,
}: DraftStatusProps) => {
  if (!autoSaveState.hasDraft) return null;

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      {/* Saving indicator */}
      {autoSaveState.isSaving ? (
        <>
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving draft...</span>
          </div>
        </>
      ) : (
        <>
          {/* Draft indicator */}
          <div className="flex items-center gap-2 text-amber-600">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </div>
            <span>Draft saved</span>
            {autoSaveState.draftAge !== null && (
              <span className="text-amber-500">
                ({formatDraftAge(autoSaveState.draftAge)})
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Actions */}
          <button
            onClick={onLoadDraft}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Load saved draft"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Load</span>
          </button>

          <button
            onClick={onClearDraft}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
            title="Discard saved draft"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Discard</span>
          </button>
        </>
      )}
    </div>
  );
};

// Draft indicator badge for showing draft count
interface DraftBadgeProps {
  draftCount: number;
  onClick?: () => void;
  className?: string;
}

export const DraftBadge = ({ draftCount, onClick, className }: DraftBadgeProps) => {
  if (draftCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'bg-amber-100 text-amber-700 border border-amber-200',
        'hover:bg-amber-200 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <Save className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{draftCount} draft{draftCount !== 1 ? 's' : ''}</span>
      {draftCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {draftCount}
        </span>
      )}
    </button>
  );
};

// Draft list modal item
interface DraftListItemProps {
  formId: string;
  timestamp: string;
  data: Record<string, any>;
  onLoad: () => void;
  onDelete: () => void;
}

export const DraftListItem = ({
  formId,
  timestamp,
  data,
  onLoad,
  onDelete,
}: DraftListItemProps) => {
  const formattedTime = new Date(timestamp).toLocaleString();
  const age = formatDraftAge(Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));

  // Try to get a meaningful name from the draft data
  const displayName = data.name || data.businessName || data.title || formId;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">{displayName}</span>
          <span className="text-xs text-gray-500">({age})</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{formattedTime}</p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onLoad}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Load
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};

// Draft list modal
interface DraftListModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: Record<string, { data: Record<string, any>; timestamp: string; formId: string }>;
  onLoadDraft: (formId: string) => void;
  onDeleteDraft: (formId: string) => void;
}

export const DraftListModal = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
}: DraftListModalProps) => {
  if (!isOpen) return null;

  const draftEntries = Object.entries(drafts);
  const draftCount = draftEntries.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Saved Drafts</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              {draftCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {draftCount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Save className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No saved drafts</p>
              <p className="text-sm">Your form drafts will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {draftEntries.map(([key, draft]) => (
                <DraftListItem
                  key={key}
                  formId={draft.formId}
                  timestamp={draft.timestamp}
                  data={draft.data}
                  onLoad={() => {
                    onLoadDraft(draft.formId);
                    onClose();
                  }}
                  onDelete={() => onDeleteDraft(draft.formId)}
                />
              ))}
            </div>
          )}
        </div>
        {draftCount > 0 && (
          <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                Object.keys(drafts).forEach((key) => onDeleteDraft(key.split('_').pop()!));
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all drafts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
