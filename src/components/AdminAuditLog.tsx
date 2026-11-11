import { useMemo, useState } from "react";
import type { AuditEvent, Role } from "@/lib/types";
import { Download, Search } from "lucide-react";

const pageSize = 12;
const roles: Role[] = ["Doctor", "Nurse", "Pharmacist", "Patient", "Admin"];
const actions: AuditEvent["action"][] = ["Login", "Check", "Prescription", "Override", "Verify", "Dispense", "Admin edit", "Report"];

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function AdminAuditLog({ events }: { events: AuditEvent[] }) {
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => events.filter((event) => {
    const eventDate = new Date(event.time);
    const start = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity;
    const end = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : Infinity;
    const haystack = `${event.user} ${event.role} ${event.action} ${event.result} ${event.patientId ?? ""}`.toLowerCase();
    return (!role || event.role === role)
      && (!action || event.action === action)
      && eventDate.getTime() >= start && eventDate.getTime() <= end
      && haystack.includes(query.trim().toLowerCase());
  }).sort((a, b) => b.time - a.time), [events, role, action, fromDate, toDate, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize);

  const exportCsv = () => {
    const rows = [
      ["Time", "User", "Role", "Action", "Result", "Patient ID"],
      ...filtered.map((event) => [
        new Date(event.time).toISOString(),
        event.user,
        event.role,
        event.action,
        event.result,
        event.patientId ?? "",
      ]),
    ];
    const contents = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `edaas-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-sm font-semibold text-slate-900">Audit Log</h3><p className="mt-1 text-xs text-slate-500">All recorded activity, newest first · {filtered.length} events</p></div>
        <button onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><Download size={15} /> Export CSV</button>
      </div>
      <div className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative sm:col-span-2 lg:col-span-1"><span className="sr-only">Search audit log</span><Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search audit log" className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
        <label><span className="sr-only">Filter by role</span><select aria-label="Filter audit by role" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><option value="">All roles</option>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">Filter by action</span><select aria-label="Filter audit by action" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><option value="">All actions</option>{actions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">From date</span><input aria-label="Audit from date" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
        <label><span className="sr-only">To date</span><input aria-label="Audit to date" type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
      </div>
      {!visible.length ? <div className="p-5 text-center text-sm text-slate-500">No audit events match the selected filters.</div> : <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Result</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{visible.map((event) => <tr key={event.id} className="align-top"><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(event.time).toLocaleString()}</td><td className="px-4 py-3 font-medium text-slate-800">{event.user}</td><td className="px-4 py-3 text-slate-600">{event.role}</td><td className="px-4 py-3 text-slate-700">{event.action}</td><td className="px-4 py-3 text-slate-600">{event.result}</td></tr>)}</tbody>
        </table>
      </div>}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
        <span>Page {Math.min(page, pageCount)} of {pageCount}</span>
        <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">Previous</button><button disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">Next</button></div>
      </div>
    </section>
  );
}
