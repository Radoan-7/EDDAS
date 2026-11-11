import { useEffect, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

export function Badge({ verified, onVerify }: { verified: boolean; onVerify?: () => void }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      Unverified
      {onVerify && (
        <button
          onClick={onVerify}
          className="ml-0.5 text-blue-600 hover:text-blue-800 underline underline-offset-2 decoration-dotted"
        >
          Verify
        </button>
      )}
    </span>
  );
}

export function SeverityPill({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Mild: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Moderate: "bg-orange-50 text-orange-700 border-orange-200",
    Severe: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${map[severity] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>
      {severity}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  children,
  variant = "default",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "default" | "conflict";
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out] ${
          variant === "conflict" ? "bg-white ring-2 ring-red-500" : "bg-white"
        }`}
      >
        {variant === "conflict" && (
          <div className="bg-red-600 text-white px-5 py-3 flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-bold tracking-wide text-sm">ALLERGY CONFLICT</span>
            <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}
        {variant === "default" && (
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        )}
        <div className={variant === "conflict" ? "p-5" : "p-5 pt-8"}>{children}</div>
      </div>
    </div>
  );
}
