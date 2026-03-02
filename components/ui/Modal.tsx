"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg scale-100 rounded-xl bg-white p-6 opacity-100 shadow-lg",
          className,
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
