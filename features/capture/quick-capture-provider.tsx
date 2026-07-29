"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { QuickCapture } from "@/features/capture/quick-capture";

/**
 * Owns the Quick Capture modal's open state and renders it once for the whole
 * dashboard, so any surface (top bar, a FAB, a shortcut) can open it.
 */
interface QuickCaptureContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextValue | undefined>(undefined);

export function QuickCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<QuickCaptureContextValue>(
    () => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }),
    [isOpen],
  );

  return (
    <QuickCaptureContext.Provider value={value}>
      {children}
      <QuickCapture open={isOpen} onClose={value.close} />
    </QuickCaptureContext.Provider>
  );
}

export function useQuickCapture(): QuickCaptureContextValue {
  const context = useContext(QuickCaptureContext);
  if (context === undefined) {
    throw new Error("useQuickCapture must be used within a <QuickCaptureProvider>.");
  }
  return context;
}
