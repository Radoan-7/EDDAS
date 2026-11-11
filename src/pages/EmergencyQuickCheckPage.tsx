import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { checkAllergy } from "@/lib/allergy";
import type { AllergyResult, CheckOutcome, Medicine, Patient } from "@/lib/types";
import { EmptyState } from "@/components/ui";
import { Activity, AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Search, ShieldAlert, X } from "lucide-react";

const verdictStyle: Record<CheckOutcome, string> = {
  conflict: "bg-red-700 text-white",
  caution: "bg-amber-500 text-slate-950",
  safe: "bg-emerald-700 text-white",
  error: "bg-red-950 text-white",
};

const verdictIcon: Record<CheckOutcome, typeof AlertTriangle> = {
  conflict: AlertTriangle,
  caution: ShieldAlert,
  safe: CheckCircle2,
  error: ShieldAlert,
};

export function EmergencyQuickCheckPage({ onBack }: { onBack: () => void }) {
  const { patients, medicines, allergenMap, simulateFailure, recentChecks, recordCheck } = useApp();
  const [patientQuery, setPatientQuery] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [result, setResult] = useState<{ patient: Patient; medicine: Medicine; allergyResult: AllergyResult; elapsed: number } | null>(null);
  const [error, setError] = useState("");
  const patientRef = useRef<HTMLInputElement>(null);
  const selectedMedicine = useMemo(() => medicines.find((item) => item.id === medicineId) ?? null, [medicines, medicineId]);
  const patientOptions = useMemo(() => patients.filter((patient) =>
    `${patient.name} ${patient.id}`.toLowerCase().includes(patientQuery.trim().toLowerCase()),
  ).slice(0, 8), [patients, patientQuery]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        patientRef.current?.focus();
      }
      if (event.key === "Escape") setResult(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runCheck = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPatient || !selectedMedicine) {
      setError("Select a patient and medicine to run the emergency check.");
      return;
    }
    setError("");
    const started = performance.now();
    const allergyResult = checkAllergy(selectedPatient, selectedMedicine, allergenMap, simulateFailure);
    const elapsed = Math.round(performance.now() - started);
    setResult({ patient: selectedPatient, medicine: selectedMedicine, allergyResult, elapsed });
    const resultLabel = allergyResult.outcome === "conflict" ? "Conflict"
      : allergyResult.outcome === "caution" ? "Caution"
        : allergyResult.outcome === "error" ? "Blocked" : "Safe";
    recordCheck(
      `${resultLabel}: ${allergyResult.allergen ?? allergyResult.notice ?? "No allergy conflict"} — ${selectedPatient.name} — ${selectedMedicine.name}${allergyResult.reason ? ` — ${allergyResult.reason}` : ""} (${elapsed} ms)`,
      selectedPatient.id,
      selectedMedicine.name,
      allergyResult.outcome,
    );
  };

  const choosePatient = (value: string) => {
    setPatientQuery(value);
    const match = patients.find((item) => item.id.toLowerCase() === value.trim().toLowerCase() || item.name.toLowerCase() === value.trim().toLowerCase());
    setSelectedPatient(match ?? null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
        <ArrowLeft size={16} /> Back to dashboard
      </button>
      <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-600 px-5 py-7 text-white sm:px-8 sm:py-9">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Activity size={25} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">Emergency workflow</p><h1 className="text-2xl font-bold sm:text-3xl">Quick allergy check</h1></div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-red-50">Choose the patient and medicine. A failed check blocks for safety. Shortcut: press <kbd className="rounded border border-white/40 px-1.5 py-0.5">/</kbd> to search.</p>
        </div>
        <form onSubmit={runCheck} className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-8">
          <div>
            <label htmlFor="quick-patient" className="mb-1.5 block text-sm font-semibold text-slate-800">Patient</label>
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={patientRef}
                id="quick-patient"
                list="quick-patient-options"
                value={patientQuery}
                onChange={(event) => choosePatient(event.target.value)}
                placeholder="Search patient name or ID"
                aria-label="Search emergency patient"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-base shadow-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />
              <datalist id="quick-patient-options">{patientOptions.map((item) => <option key={item.id} value={item.name}>{item.id}</option>)}</datalist>
            </div>
            {selectedPatient && <p className="mt-1.5 text-xs text-slate-500">{selectedPatient.id} · {selectedPatient.allergies.length} recorded allergies</p>}
          </div>
          <div>
            <label htmlFor="quick-medicine" className="mb-1.5 block text-sm font-semibold text-slate-800">Medicine</label>
            <select id="quick-medicine" value={medicineId} onChange={(event) => setMedicineId(event.target.value)} aria-label="Choose medicine for emergency check" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base shadow-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100">
              <option value="">Select a medicine…</option>
              {medicines.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.category}</option>)}
            </select>
          </div>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
            <ShieldAlert size={18} /> Check now <kbd className="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-xs">Enter</kbd>
          </button>
          {error && <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-3">{error}</p>}
        </form>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Recent checks</h2><span className="text-xs text-slate-500">Latest 20</span></div>
        {recentChecks.length === 0 ? <EmptyState>No emergency checks have been run.</EmptyState> : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Medicine</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Checked by</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{recentChecks.map((check) => (
                <tr key={check.id}><td className="px-4 py-3 text-xs text-slate-500"><Clock3 size={13} className="mr-1 inline" />{new Date(check.time).toLocaleString()}</td><td className="px-4 py-3 font-medium">{check.patientName} · {check.patientId}</td><td className="px-4 py-3">{check.medicineName}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${check.outcome === "conflict" || check.outcome === "error" ? "bg-red-100 text-red-800" : check.outcome === "caution" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{check.outcome.toUpperCase()}</span></td><td className="px-4 py-3 text-slate-600">{check.checkedBy}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {result && (() => {
        const Icon = verdictIcon[result.allergyResult.outcome];
        const outcome = result.allergyResult.outcome;
        return (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto p-5 text-center ${verdictStyle[outcome]}`} role="dialog" aria-modal="true" aria-labelledby="quick-verdict-title">
            <button onClick={() => setResult(null)} aria-label="Close result" className="absolute right-5 top-5 rounded-xl p-2 text-current hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X size={25} /></button>
            <Icon size={64} className="mb-5" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80">Emergency allergy result</p>
            <h2 id="quick-verdict-title" className="mt-2 text-4xl font-black sm:text-6xl">{outcome === "error" ? "BLOCKED" : outcome.toUpperCase()}</h2>
            <p className="mt-4 text-lg font-semibold">{result.patient.name} · {result.patient.id} &nbsp;|&nbsp; {result.medicine.name}</p>
            <p className="mt-4 max-w-2xl text-base sm:text-lg">{result.allergyResult.reason ?? result.allergyResult.notice ?? (outcome === "safe" ? "No allergy conflict found." : "")}</p>
            {result.allergyResult.severity && <p className="mt-3 rounded-full border border-current/30 px-3 py-1 text-sm">Severity: {result.allergyResult.severity} · Reaction: {result.allergyResult.reaction}</p>}
            {outcome === "error" && <p className="mt-4 rounded-xl border border-white/30 bg-black/10 px-4 py-3 font-bold">Fail-safe active: do not dispense this medicine.</p>}
            <p className="mt-6 text-sm opacity-80">Check completed in {result.elapsed} ms · Press Esc to close</p>
            <button autoFocus onClick={() => setResult(null)} className="mt-8 rounded-xl border border-current/40 px-6 py-3 text-sm font-bold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">Close result</button>
          </div>
        );
      })()}
    </div>
  );
}
