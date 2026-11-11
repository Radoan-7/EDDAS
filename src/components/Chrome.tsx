import { useApp } from "@/lib/store";
import {
  Activity, Bell, ChevronLeft, ChevronRight, ClipboardList, LogOut, Menu, Moon, Pill, Settings, ShieldAlert,
  Stethoscope, Sun, Syringe, User, X, AlertTriangle, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";
import { useState } from "react";

const roleStyles: Record<Role, { badge: string; bar: string; icon: string }> = {
  Doctor: { badge: "bg-blue-50 text-blue-700 border-blue-200", bar: "bg-blue-50/90 border-blue-100", icon: "bg-blue-600" },
  Nurse: { badge: "bg-teal-50 text-teal-700 border-teal-200", bar: "bg-teal-50/90 border-teal-100", icon: "bg-teal-600" },
  Pharmacist: { badge: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-50/90 border-amber-100", icon: "bg-amber-600" },
  Patient: { badge: "bg-sky-50 text-sky-700 border-sky-200", bar: "bg-sky-50/90 border-sky-100", icon: "bg-sky-600" },
  Admin: { badge: "bg-slate-100 text-slate-700 border-slate-300", bar: "bg-slate-100/90 border-slate-200", icon: "bg-slate-700" },
};

const roleIcons: Record<Role, LucideIcon> = {
  Doctor: Stethoscope,
  Nurse: Syringe,
  Pharmacist: Pill,
  Patient: User,
  Admin: Settings,
};

const workspaceLabels: Record<Role, string> = {
  Doctor: "Clinical workspace",
  Nurse: "Patient allergies",
  Pharmacist: "Dispensing queue",
  Patient: "My allergies",
  Admin: "Administration",
};

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { role, doctorName, logout, darkMode, toggleDarkMode, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  if (!role) return null;
  const { badge, bar } = roleStyles[role];
  const RoleIcon = roleIcons[role];
  return (
    <header className={`role-header sticky top-0 z-30 border-b backdrop-blur ${bar}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMenu}
            aria-label="Open navigation"
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-white/70"
          >
            <Menu size={19} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center shadow-sm">
            <ShieldAlert size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">EDAAS</div>
            <div className="hidden text-[11px] text-slate-500 -mt-0.5 sm:block">Emergency Drug Allergy Alert</div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label={`Notifications${notifications.some((item) => !item.read) ? `, ${notifications.filter((item) => !item.read).length} unread` : ""}`}
              aria-expanded={notificationsOpen}
              className="relative rounded-lg p-1.5 sm:p-2 text-slate-600 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Bell size={18} />
              {notifications.some((item) => !item.read) && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[9px] font-bold leading-4 text-white ring-2 ring-white">{notifications.filter((item) => !item.read).length}</span>}
            </button>
            {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" role="region" aria-label="Recent notifications">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <strong className="text-sm text-slate-900">Recent alerts</strong>
                <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-blue-700 hover:underline">Mark all read</button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => <li key={notification.id}>
                  <button onClick={() => markNotificationRead(notification.id)} className={`flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-slate-50 ${notification.read ? "opacity-70" : ""}`}>
                    {notification.kind === "conflict" ? <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" /> : notification.kind === "override" ? <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" /> : <User size={16} className="mt-0.5 shrink-0 text-blue-600" />}
                    <span className="min-w-0 flex-1"><span className="block text-xs font-medium text-slate-800">{notification.message}</span><span className="mt-1 block text-[10px] text-slate-500">{new Date(notification.time).toLocaleString()}</span></span>
                    {!notification.read && <span aria-label="Unread" className="mt-1 h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                </li>)}
                {!notifications.length && <li className="px-4 py-6 text-center text-sm text-slate-500">You are all caught up.</li>}
              </ul>
            </div>}
          </div>
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge}`}>
            <RoleIcon size={13} />
            {role}
            {doctorName ? <span className="text-slate-400">· {doctorName}</span> : null}
          </span>
          <span className={`sm:hidden text-xs font-medium px-2 py-1 rounded-full border ${badge}`}>{role}</span>
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-lg p-1.5 sm:p-2 text-slate-600 hover:bg-white/70 transition-colors"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={logout}
            aria-label="Switch role"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/70 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Activity size={15} />
            <span className="hidden sm:inline">Switch role</span>
          </button>
          <button
            onClick={logout}
            aria-label="Logout"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  open,
  onClose,
  onEmergency,
  onDashboard,
}: {
  collapsed: boolean;
  onToggle: () => void;
  open: boolean;
  onClose: () => void;
  onEmergency: () => void;
  onDashboard: () => void;
}) {
  const { role } = useApp();
  if (!role) return null;
  const RoleIcon = roleIcons[role];
  const WorkIcon = role === "Doctor" ? ClipboardList : RoleIcon;
  const { badge, icon } = roleStyles[role];
  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 md:relative md:inset-auto md:z-auto md:translate-x-0 md:shadow-none md:min-h-full ${
        open ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "md:w-[4.5rem]" : "md:w-56"} md:shrink-0 md:border-r md:bg-white/70`}>
        <div className="px-4 py-4 md:sticky md:top-14">
          <div className={`flex items-center gap-3 md:mb-6 ${collapsed ? "md:justify-center" : ""}`}>
            <div className={`w-9 h-9 rounded-xl text-white grid place-items-center shrink-0 ${icon}`}>
              <RoleIcon size={18} />
            </div>
            <div className={collapsed ? "md:hidden" : ""}>
              <div className="text-sm font-semibold text-slate-900">{role}</div>
              <div className="text-xs text-slate-500">{workspaceLabels[role]}</div>
            </div>
            <button onClick={onClose} aria-label="Close navigation" className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden">
              <X size={17} />
            </button>
          </div>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex ml-auto mb-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <nav aria-label={`${role} navigation`} className="flex md:flex-col gap-2 mt-3 md:mt-0">
            <button onClick={() => { onDashboard(); onClose(); }} title={collapsed ? "Dashboard" : undefined} className={`flex-1 md:flex-none flex items-center gap-2.5 text-sm font-medium text-left text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors ${collapsed ? "md:justify-center md:px-2" : ""}`}>
              <Activity size={16} className="shrink-0" /><span className={collapsed ? "md:hidden" : ""}>Dashboard</span>
            </button>
            <a href="#workspace" onClick={onClose} title={collapsed ? workspaceLabels[role] : undefined} className={`flex-1 md:flex-none flex items-center gap-2.5 text-sm font-medium rounded-lg px-3 py-2 border ${badge} ${collapsed ? "md:justify-center md:px-2" : ""}`}>
              <WorkIcon size={16} className="shrink-0" /><span className={collapsed ? "md:hidden" : ""}>{workspaceLabels[role]}</span>
            </a>
            {(["Doctor", "Nurse", "Pharmacist"] as Role[]).includes(role) && <button onClick={() => { onEmergency(); onClose(); }} title={collapsed ? "Emergency quick check" : undefined} className={`flex-1 md:flex-none flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-800 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 ${collapsed ? "md:justify-center md:px-2" : ""}`}>
              <ShieldAlert size={16} className="shrink-0" /><span className={collapsed ? "md:hidden" : ""}>Emergency check</span>
            </button>}
          </nav>
        </div>
      </aside>
    </>
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
