import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuTrash, LuX } from 'react-icons/lu';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  problemTitle?: string; // Kept for backward-compatibility
  title?: string;
  description?: string;
  itemType?: "file" | "folder";
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  problemTitle = "",
  title = "Permanent Deletion",
  description,
  itemType = "file",
}) => {
  // Support closing modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Resolve default description if not provided
  const resolvedDescription = description || (problemTitle 
    ? `Are you absolutely sure you want to delete "${problemTitle}"? This action is permanent and cannot be undone. All variants and solutions will be cascades-cleared.`
    : `Are you sure you want to proceed with deletion?`
  );

  return createPortal(
    <div style={{ zIndex: 9999 }} className="fixed inset-0 flex items-center justify-center p-4">
      {/* Backdrop with elegant blur */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Glassmorphic Modal Card with ARIA layout compliance */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        className="relative bg-[#0c0e14]/90 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all duration-300 scale-100 animate-in zoom-in-95 ease-out flex flex-col items-center text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-white/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <LuX size={18} />
        </button>

        {/* Warning Icon Container */}
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 id="confirm-delete-title" className="text-xl font-black text-text-main tracking-tight mb-2">
          {title}
        </h3>
        
        {/* Description */}
        <p id="confirm-delete-description" className="text-sm text-text-muted/80 leading-relaxed mb-8">
          {resolvedDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onClose}
            autoFocus
            className="flex-1 py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-text-muted hover:text-text-main font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ backgroundImage: 'linear-gradient(to right, #ef4444, #f43f5e)' }}
            className="flex-1 py-3 px-5 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(239,68,68,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
          >
            <LuTrash size={14} />
            <span>{itemType === "folder" ? "Delete Folder" : "Delete File"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
