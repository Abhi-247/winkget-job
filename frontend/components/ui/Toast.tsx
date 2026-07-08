"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-[#edf2f7] border-[#1e3a5f]/20 text-blue-800",
};

const iconStyles = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

function ToastItem({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const Icon = icons[item.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl border p-4 shadow-lg",
        "animate-in slide-in-from-right-5 fade-in duration-300",
        styles[item.type]
      )}
      role="alert"
    >
      <Icon size={18} className={cn("mt-0.5 flex-shrink-0", iconStyles[item.type])} />
      <p className="flex-1 text-sm font-medium">{item.message}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const ctx: ToastContextValue = {
    toast: add,
    success: (m) => add(m, "success"),
    error: (m) => add(m, "error"),
    warning: (m) => add(m, "warning"),
    info: (m) => add(m, "info"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
