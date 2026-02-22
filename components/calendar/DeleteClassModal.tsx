'use client';

import { AlertTriangle, X } from 'lucide-react';

interface DeleteClassModalProps {
  isOpen: boolean;
  className: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteClassModal({
  isOpen,
  className,
  onConfirm,
  onCancel,
}: DeleteClassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 max-w-md w-full border border-red-500/30">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-bold">Delete class</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 text-foreground/70"
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-foreground/80 mb-6">
          Are you sure you want to delete <strong>{className}</strong>? This will permanently remove
          the class and all its events from your calendar. This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 font-semibold"
          >
            Delete class
          </button>
        </div>
      </div>
    </div>
  );
}
