"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  position?: "center" | "right-drawer";
  className?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  position = "center",
  className,
}: ModalProps): React.ReactNode {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll — lock both html & body to cover all layout patterns
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const isRightDrawer = position === "right-drawer";

  return createPortal(
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-[60] flex max-w-vw overflow-hidden",
        isRightDrawer
          ? "justify-end items-stretch p-0"
          : "items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain"
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative bg-white shadow-2xl flex flex-col transition-all duration-300 z-10 overflow-x-hidden",
          isRightDrawer
            ? "w-full max-w-full sm:w-[480px] md:w-[540px] h-full h-[100dvh] max-h-[100dvh] rounded-none sm:rounded-l-2xl animate-in slide-in-from-right duration-300"
            : cn("w-full rounded-2xl my-auto max-h-[90vh]", sizeMap[size]),
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-gray-100 flex-shrink-0 bg-white rounded-tl-2xl gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight flex-1">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto overflow-x-hidden flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}
