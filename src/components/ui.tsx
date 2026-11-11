import { useEffect, type ReactNode } from "react";
import { AlertTriangle, type LucideIcon, X } from "lucide-react";

export function Badge({
  verified,
  verifiedBy,
  verifiedAt,
  onVerify,
}: {
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  onVerify?: () => void;
}) {
  if (verified) {
    const verifierLabel = verifiedBy
      ? verifiedBy.startsWith("Dr. ") ? verifiedBy : `Dr. ${verifiedBy}`
      : null;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        {verifierLabel ? `Verified by ${verifierLabel}${verifiedAt ? ` on ${new Date(verifiedAt).toLocaleDateString()}` : ""}` : "Verified"}
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

export function StatCards({
  stats,
}: {
  stats: { label: string; value: number | string; icon: LucideIcon; tone: string }[];
}) {
  return (
    <section
      aria-label="Dashboard statistics"
      className={`grid grid-cols-2 ${stats.length === 3 ? "xl:grid-cols-3" : stats.length > 3 ? "xl:grid-cols-4" : ""} gap-3 mb-6`}
    >
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${tone}`}>
            <Icon size={19} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-slate-900 leading-tight">{value}</div>
            <div className="text-xs text-slate-500 truncate">{label}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

const headingAccents = {
  blue: "border-blue-100 from-blue-50 to-white text-blue-700 bg-blue-600",
  teal: "border-teal-100 from-teal-50 to-white text-teal-700 bg-teal-600",
  amber: "border-amber-100 from-amber-50 to-white text-amber-700 bg-amber-600",
  sky: "border-sky-100 from-sky-50 to-white text-sky-700 bg-sky-600",
  slate: "border-slate-200 from-slate-100 to-white text-slate-700 bg-slate-700",
};

export function DashboardHeader({
  title,
  subtitle,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: keyof typeof headingAccents;
  children?: ReactNode;
}) {
  const [border, from, to, , iconBackground] = headingAccents[accent].split(" ");
  return (
    <header className={`role-header mb-5 overflow-hidden rounded-2xl border bg-gradient-to-br ${border} ${from} ${to} p-5 shadow-sm sm:p-6`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-sm ${iconBackground}`}>
          <Icon size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-block rounded-lg ${className}`} />;
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
