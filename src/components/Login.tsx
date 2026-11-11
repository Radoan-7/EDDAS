import { useState } from "react";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { ShieldAlert, Stethoscope, Syringe, Pill, User, Settings, ArrowRight, Moon, Sun } from "lucide-react";

const roles: { role: Role; desc: string; icon: typeof User; color: string }[] = [
  { role: "Doctor", desc: "Prescribe & verify allergies", icon: Stethoscope, color: "from-blue-500 to-blue-600" },
  { role: "Nurse", desc: "View patient allergies", icon: Syringe, color: "from-teal-500 to-teal-600" },
  { role: "Pharmacist", desc: "Dispense prescriptions", icon: Pill, color: "from-amber-500 to-amber-600" },
  { role: "Patient", desc: "View & report allergies", icon: User, color: "from-sky-500 to-sky-600" },
  { role: "Admin", desc: "Manage mappings & data", icon: Settings, color: "from-slate-500 to-slate-600" },
];

export function Login() {
  const { login, darkMode, toggleDarkMode, users } = useApp();
  const [selected, setSelected] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [loginError, setLoginError] = useState("");

  const needsName = selected !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <button
        onClick={toggleDarkMode}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed right-4 top-4 rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-600 shadow-sm transition hover:bg-white"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EDAAS</h1>
            <p className="text-sm text-slate-500 mt-1">Emergency Drug Allergy Alert System</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Select your role</h2>
            <div className="grid gap-2">
              {roles.map(({ role, desc, icon: Icon, color }) => {
                const active = selected === role;
                return (
                  <button
                    key={role}
                    onClick={() => { setSelected(role); setLoginError(""); setName(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} text-white grid place-items-center shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{role}</div>
                      <div className="text-xs text-slate-500 truncate">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && needsName && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Your account name</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setLoginError(""); }}
                  placeholder={selected === "Patient" ? "e.g. Rafiq" : "Enter your registered account name"}
                  aria-label="Your account name"
                  list="login-accounts"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
                <datalist id="login-accounts">{users.filter((user) => user.role === selected).map((user) => <option key={user.id} value={user.name}>{user.active ? user.role : "Deactivated account"}</option>)}</datalist>
              </div>
            )}

            <button
              disabled={!selected || !name.trim()}
              onClick={() => {
                if (!selected) return;
                if (!login(selected, name.trim())) setLoginError("Account not found, deactivated, or assigned to another role. Contact an administrator.");
              }}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Continue
              <ArrowRight size={16} />
            </button>
            {loginError && <p role="alert" className="mt-3 text-center text-xs font-medium text-red-700">{loginError}</p>}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">Decision support only – final decisions rest with the healthcare professional.</p>
        </div>
      </div>
    </div>
  );
}
