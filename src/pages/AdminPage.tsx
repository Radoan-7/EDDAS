import { useState } from "react";
import { useApp } from "@/lib/store";
import { checkAllergy } from "@/lib/allergy";
import { crossReactivityTable } from "@/lib/seed";
import { DashboardHeader, EmptyState, StatCards } from "@/components/ui";
import { AdminAuditLog } from "@/components/AdminAuditLog";
import { AdminDatabase } from "@/components/AdminDatabase";
import { AdminUsers } from "@/components/AdminUsers";
import { AdminCharts } from "@/components/DashboardCharts";
import { Settings, AlertTriangle, Activity, Pill, Play, Users, FlaskConical, RefreshCw } from "lucide-react";

interface AcceptanceResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const acceptanceCases = [
  { patientId: "P-1001", medicineName: "Amoxicillin", expected: "conflict", name: "P-1001 + Amoxicillin" },
  { patientId: "P-1001", medicineName: "Paracetamol", expected: "safe", name: "P-1001 + Paracetamol" },
  { patientId: "P-1002", medicineName: "Amoxicillin", expected: "safe", name: "P-1002 + Amoxicillin" },
  { patientId: "P-1003", medicineName: "Amoxicillin", expected: "conflict", name: "P-1003 + Amoxicillin" },
  { patientId: "P-1004", medicineName: "Amoxicillin", expected: "conflict", name: "P-1004 + Amoxicillin" },
  { patientId: "P-1001", medicineName: "Amoxicillin", expected: "error", simulateFailure: true, name: "Simulated check failure" },
] as const;

export function AdminPage() {
  const { patients, medicines, users, allergenMap, auditEvents, simulateFailure, setSimulateFailure, resetDemo } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [testResults, setTestResults] = useState<AcceptanceResult[] | null>(null);
  const stats = [
    { label: "Users", value: users.length, icon: Users, tone: "bg-slate-100 text-slate-700" },
    { label: "Medicines", value: medicines.length, icon: Pill, tone: "bg-amber-50 text-amber-700" },
    { label: "Checks run", value: auditEvents.filter((event) => event.action === "Check").length, icon: Activity, tone: "bg-blue-50 text-blue-700" },
  ];

  const runAcceptanceSuite = () => {
    setTestResults(acceptanceCases.map((testCase) => {
      const patient = patients.find((item) => item.id === testCase.patientId);
      const medicine = medicines.find((item) => item.name === testCase.medicineName);
      if (!patient || !medicine) return { name: testCase.name, expected: testCase.expected, actual: "Fixture missing", passed: false };
      const result = checkAllergy(patient, medicine, allergenMap, "simulateFailure" in testCase);
      const detailPass = testCase.patientId === "P-1002"
        ? result.notice === "No allergies recorded"
        : testCase.patientId === "P-1004" && !("simulateFailure" in testCase)
          ? result.allergen === "Penicillin"
          : true;
      return {
        name: testCase.name,
        expected: testCase.expected,
        actual: `${result.outcome}${result.notice ? ` — ${result.notice}` : ""}${result.allergen ? ` — ${result.allergen}` : ""}`,
        passed: result.outcome === testCase.expected && detailPass,
      };
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div id="dashboard"><DashboardHeader title="Admin dashboard" subtitle="System health, clinical activity, users, and safety data" icon={Settings} accent="slate"><StatCards stats={stats} /></DashboardHeader></div>
      <AdminCharts events={auditEvents} failureMode={simulateFailure} />
      <div id="workspace">
        <AdminUsers />
        <section className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3"><h2 className="text-sm font-bold text-slate-900">Drug & allergy database</h2><p className="mt-1 text-xs text-slate-500">Validated, searchable entries used by the next allergy check.</p></div>
          <AdminDatabase />
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Cross-reactivity reference</h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">Cross-class relationships used by the checker to return caution or conflict results.</p>
          <div className="grid gap-2 sm:grid-cols-2">{crossReactivityTable.map((entry) => (
            <div key={`${entry.allergen}-${entry.medicineClass}`} className={`rounded-xl border px-3 py-2.5 ${entry.outcome === "conflict" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-slate-800">{entry.allergen} → {entry.medicineClass}</strong><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${entry.outcome === "conflict" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{entry.outcome}</span></div>
              <p className="mt-1 text-xs text-slate-600">{entry.reason}</p>
            </div>
          ))}</div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><FlaskConical size={16} /> Demo controls</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div><p className="text-sm font-medium text-slate-900">Simulate check failure</p><p className="text-xs text-slate-500">Forces all allergy checks to block the drug.</p></div>
            <button onClick={() => setSimulateFailure(!simulateFailure)} className={`relative h-6 w-11 rounded-full ${simulateFailure ? "bg-red-600" : "bg-slate-300"}`} role="switch" aria-label="Simulate check failure" aria-checked={simulateFailure}><span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${simulateFailure ? "translate-x-5" : ""}`} /></button>
          </div>
          {simulateFailure && <p className="mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"><AlertTriangle size={14} /> Failure simulation is ON — checks will block all drugs.</p>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div><p className="text-sm font-medium text-slate-900">Reset demo data</p><p className="text-xs text-slate-500">Restore seed profiles, queue, and database; keep the audit trail.</p></div>
            <button onClick={() => { if (confirmReset) { resetDemo(); setConfirmReset(false); } else setConfirmReset(true); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${confirmReset ? "bg-red-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{confirmReset ? "Click again to confirm" : <><RefreshCw size={14} className="mr-1 inline" />Reset</>}</button>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-bold text-slate-900">Acceptance test suite</h2><p className="mt-1 text-xs text-slate-500">Six clinically important cases, including no-allergy and fail-safe behavior.</p></div>
            <button onClick={runAcceptanceSuite} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><Play size={15} /> Run test suite</button>
          </div>
          {!testResults ? <div className="p-5"><EmptyState>Run the suite to see the six acceptance results.</EmptyState></div> : <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Acceptance case</th><th className="px-4 py-3">Expected</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Result</th></tr></thead><tbody className="divide-y divide-slate-100">{testResults.map((item) => <tr key={item.name}><td className="px-4 py-3 font-medium text-slate-800">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.expected}</td><td className="px-4 py-3 text-slate-600">{item.actual}</td><td className={`px-4 py-3 font-bold ${item.passed ? "text-emerald-700" : "text-red-700"}`}>{item.passed ? "Pass" : "Fail"}</td></tr>)}</tbody></table>
          </div>}
        </section>
        <AdminAuditLog events={auditEvents} />
      </div>
    </div>
  );
}
