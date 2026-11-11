import { useApp } from "@/lib/store";
import { LogOut, Stethoscope, ShieldAlert } from "lucide-react";
import type { Role } from "@/lib/types";

const roleColors: Record<Role, string> = {
  Doctor: "bg-blue-50 text-blue-700 border-blue-200",
  Nurse: "bg-teal-50 text-teal-700 border-teal-200",
  Pharmacist: "bg-amber-50 text-amber-700 border-amber-200",
  Patient: "bg-sky-50 text-sky-700 border-sky-200",
  Admin: "bg-slate-100 text-slate-700 border-slate-300",
};

export function TopBar() {
  const { role, doctorName, logout } = useApp();
  if (!role) return null;
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center shadow-sm">
            <ShieldAlert size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">EDAAS</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Emergency Drug Allergy Alert</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${roleColors[role]}`}>
            <Stethoscope size={13} />
            {role}
            {doctorName ? <span className="text-slate-400">· {doctorName}</span> : null}
          </span>
          <span className={`sm:hidden text-xs font-medium px-2 py-1 rounded-full border ${roleColors[role]}`}>{role}</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-500">
        Decision support only – final decisions rest with the healthcare professional.
      </div>
    </footer>
  );
}
