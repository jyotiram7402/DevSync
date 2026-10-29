"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { QuickCapture, type QuickCaptureInitial } from "@/features/capture/quick-capture";

/**
 * Owns the Quick Capture modal's open state and renders it once for the whole
 * dashboard, so any surface (top bar, the phone Add sheet, a shortcut) can open
 * it — empty with `open()`, or prefilled with `openWith()` (pasted text, a
 * picked file, a link prompt).
 */
interface QuickCaptureContextValue {
  isOpen: boolean;
  open: () => void;
  openWith: (initial: QuickCaptureInitial) => void;
  close: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextValue | undefined>(undefined);

export function QuickCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initial, setInitial] = useState<QuickCaptureInitial | null>(null);

  const value = useMemo<QuickCaptureContextValue>(
    () => ({
      isOpen,
      open: () => {
        setInitial(null);
        setIsOpen(true);
      },
      openWith: (next) => {
        setInitial(next);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <QuickCaptureContext.Provider value={value}>
      {children}
      <QuickCapture open={isOpen} onClose={value.close} initial={initial} />
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
