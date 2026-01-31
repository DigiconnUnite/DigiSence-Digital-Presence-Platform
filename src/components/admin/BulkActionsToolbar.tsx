import React from "react";
import { CheckCircle, PauseCircle, Trash2, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onActivate: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onActivate,
  onSuspend,
  onDelete,
  onClearSelection,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <span className="text-sm font-medium text-purple-700">
        {selectedCount} selected
      </span>
      <button
        onClick={onClearSelection}
        className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors"
        title="Clear selection"
      >
        <X size={18} />
      </button>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onActivate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
        >
          <CheckCircle size={16} />
          Activate
        </button>
        <button
          onClick={onSuspend}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors"
        >
          <PauseCircle size={16} />
          Suspend
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}
