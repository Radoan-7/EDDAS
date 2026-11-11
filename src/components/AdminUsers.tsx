import { useState } from "react";
import { useApp } from "@/lib/store";
import type { AppUser, Role } from "@/lib/types";
import { Modal } from "@/components/ui";
import { Pencil, UserPlus, Users } from "lucide-react";

const roles: Role[] = ["Doctor", "Nurse", "Pharmacist", "Patient", "Admin"];

export function AdminUsers() {
  const { users, addUser, updateUser } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Doctor");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftRole, setDraftRole] = useState<Role>("Doctor");
  const [draftActive, setDraftActive] = useState(true);

  const submitNew = () => {
    if (!addUser(name, role)) {
      setError("Enter a unique name for this user.");
      return;
    }
    setName("");
    setError("");
  };
  const beginEdit = (user: AppUser) => {
    setEditing(user);
    setDraftName(user.name);
    setDraftRole(user.role);
    setDraftActive(user.active);
    setError("");
  };
  const save = () => {
    if (!editing || !updateUser(editing.id, { name: draftName, role: draftRole, active: draftActive })) {
      setError("Use a unique non-empty name and keep at least one active administrator.");
      return;
    }
    setEditing(null);
  };

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><Users size={17} className="text-slate-600" /><div><h2 className="text-sm font-bold text-slate-900">User management</h2><p className="mt-0.5 text-xs text-slate-500">Active status and last successful login</p></div></div>
      <div className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-[1fr_12rem_auto]">
        <label><span className="sr-only">New user name</span><input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
        <label><span className="sr-only">New user role</span><select value={role} onChange={(event) => setRole(event.target.value as Role)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button onClick={submitNew} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"><UserPlus size={15} /> Add user</button>
        {error && !editing && <p role="alert" className="text-xs text-red-700 sm:col-span-3">{error}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}>
            <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td><td className="px-4 py-3 text-slate-600">{user.role}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{user.active ? "Active" : "Deactivated"}</span></td><td className="px-4 py-3 text-xs text-slate-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td><td className="px-4 py-3"><button onClick={() => beginEdit(user)} aria-label={`Edit ${user.name}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><Pencil size={13} /> Edit</button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && <div>
          <h2 className="text-base font-bold text-slate-900">Edit user</h2>
          <label className="mt-4 block text-xs font-semibold text-slate-600">Name<input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">Role<select value={draftRole} onChange={(event) => setDraftRole(event.target.value as Role)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={draftActive} onChange={(event) => setDraftActive(event.target.checked)} /> Account active</label>
          {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
          <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button><button onClick={save} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">Save changes</button></div>
        </div>}
      </Modal>
    </section>
  );
}
