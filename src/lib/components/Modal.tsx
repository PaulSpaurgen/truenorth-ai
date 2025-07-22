"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#0E1014] border border-gray-700 w-full max-w-4xl mx-4 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl cursor-pointer leading-none transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto text-white">{children}</div>
      </div>
    </div>
  );
} 