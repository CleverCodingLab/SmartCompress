"use client";

import { useCompression, ToastMessage } from "@/lib/compression-context";

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  // Styles and values based on toast type
  let accentColor = "var(--indigo)";
  let borderColor = "rgba(99, 102, 241, 0.25)";
  let bgColor = "rgba(10, 15, 28, 0.95)";
  let glow = "0 8px 30px rgba(99, 102, 241, 0.15), 0 0 15px rgba(99, 102, 241, 0.08)";
  let titleText = "Info";
  let titleColor = "text-[var(--indigo)]";
  
  let iconSvg = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );

  if (toast.type === "success") {
    accentColor = "var(--emerald)";
    borderColor = "rgba(16, 185, 129, 0.25)";
    bgColor = "rgba(8, 24, 18, 0.95)";
    glow = "0 8px 30px rgba(16, 185, 129, 0.15), 0 0 15px rgba(16, 185, 129, 0.08)";
    titleText = "Success";
    titleColor = "text-[var(--emerald)]";
    iconSvg = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  } else if (toast.type === "error") {
    accentColor = "var(--rose)";
    borderColor = "rgba(244, 63, 94, 0.25)";
    bgColor = "rgba(28, 10, 15, 0.95)";
    glow = "0 8px 30px rgba(244, 63, 94, 0.15), 0 0 15px rgba(244, 63, 94, 0.08)";
    titleText = "Error";
    titleColor = "text-[var(--rose)]";
    iconSvg = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  } else if (toast.type === "warning") {
    accentColor = "var(--amber)";
    borderColor = "rgba(245, 158, 11, 0.25)";
    bgColor = "rgba(28, 20, 8, 0.95)";
    glow = "0 8px 30px rgba(245, 158, 11, 0.15), 0 0 15px rgba(245, 158, 11, 0.08)";
    titleText = "Warning";
    titleColor = "text-[var(--amber)]";
    iconSvg = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  return (
    <div
      className="glass-strong rounded-xl p-4 flex items-start gap-3 border-t border-r border-b border-l-[4px] shadow-lg max-w-sm pointer-events-auto transition-all animate-toast-slide"
      style={{
        borderTopColor: borderColor,
        borderRightColor: borderColor,
        borderBottomColor: borderColor,
        borderLeftColor: accentColor,
        background: bgColor,
        boxShadow: glow,
        backdropFilter: "blur(20px) saturate(140%)",
      }}
    >
      <div className="shrink-0 mt-0.5" style={{ color: accentColor }}>
        {iconSvg}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${titleColor}`}>
          {titleText}
        </h5>
        <p className="text-sm text-white font-medium leading-relaxed break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all shrink-0 mt-0.5"
        aria-label="Close notification"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { state, dispatch } = useCompression();
  const { toasts } = state;

  const handleClose = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)] sm:max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
}
