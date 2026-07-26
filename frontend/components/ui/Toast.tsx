"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
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
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-emerald-900/90 text-white border-emerald-700/80 shadow-emerald-950/20 backdrop-blur-md",
  error: "bg-rose-900/90 text-white border-rose-700/80 shadow-rose-950/20 backdrop-blur-md",
  warning: "bg-amber-900/90 text-white border-amber-700/80 shadow-amber-950/20 backdrop-blur-md",
  info: "bg-[#1e3a5f]/95 text-white border-blue-500/30 shadow-slate-950/30 backdrop-blur-md",
};

const iconStyles = {
  success: "text-emerald-300",
  error: "text-rose-300",
  warning: "text-amber-300",
  info: "text-blue-300",
};

function ToastCard({
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
        "pointer-events-auto flex items-center gap-3.5 px-4 py-3 rounded-2xl border shadow-xl",
        "animate-in slide-in-from-top-6 fade-in duration-300 transform transition-all max-w-md w-full sm:w-[420px]",
        styles[item.type]
      )}
      role="alert"
    >
      <Icon size={18} className={cn("flex-shrink-0", iconStyles[item.type])} />
      <p className="flex-1 text-xs sm:text-sm font-semibold tracking-wide leading-snug">{item.message}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={15} />
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
      {/* Top Center Toast Notification Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2.5 pointer-events-none px-4 w-full max-w-lg">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onRemove={remove} />
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
