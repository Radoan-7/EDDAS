import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { checkAllergy } from "@/lib/allergy";
import type { AllergyResult, Patient, Severity } from "@/lib/types";
import { Modal, Badge, SeverityPill } from "@/components/ui";
import {
  ArrowLeft, CheckCircle2, ShieldAlert, Search, FileText, ClipboardList, AlertTriangle, Pencil,
} from "lucide-react";

type DoctorTab = "patients" | "prescriptions";

export function DoctorPage() {
  const { doctorName } = useApp();
  const [tab, setTab] = useState<DoctorTab>("patients");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Doctor Workspace</h1>
          <p className="text-sm text-slate-500">Prescribe with allergy decision support</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <TabBtn active={tab === "patients"} onClick={() => setTab("patients")} icon={FileText}>Patients</TabBtn>
          <TabBtn active={tab === "prescriptions"} onClick={() => setTab("prescriptions")} icon={ClipboardList}>My Prescriptions</TabBtn>
        </div>
      </div>

      {tab === "patients" && (selectedPatient ? null : <PatientList onSelect={setSelectedPatient} />)}
      {tab === "patients" && selectedPatient && (
        <PatientFile patient={selectedPatient} onBack={() => setSelectedPatient(null)} doctorName={doctorName} />
      )}
      {tab === "prescriptions" && <MyPrescriptions />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
        active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function PatientList({ onSelect }: { onSelect: (p: Patient) => void }) {
  const { patients } = useApp();
  const [query, setQuery] = useState("");
  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patient name or ID"
          className="w-full sm:max-w-sm pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      <div className="grid gap-2">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold text-sm">
                {p.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500">{p.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{p.allergies.length} allerg{p.allergies.length === 1 ? "y" : "ies"}</div>
              <div className="text-[11px] text-slate-400">Open file →</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No patients found.</p>}
      </div>
    </div>
  );
}

function PatientFile({ patient, onBack, doctorName }: { patient: Patient; onBack: () => void; doctorName: string }) {
  const { patients, medicines, allergenMap, simulateFailure, verifyAllergy, savePrescription } = useApp();
  const live = patients.find((p) => p.id === patient.id) ?? patient;
  const [medicineId, setMedicineId] = useState("");
  const [result, setResult] = useState<AllergyResult | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [overrideText, setOverrideText] = useState("");

  const medicine = medicines.find((m) => m.id === medicineId) ?? null;

  const runCheck = () => {
    if (!medicine) return;
    const r = checkAllergy(live, medicine, allergenMap, simulateFailure);
    setResult(r);
    if (r.outcome === "conflict") setShowConflict(true);
  };

  const save = (overridden: boolean, reason?: string) => {
    if (!medicine || !result) return;
    const status = overridden ? "Overridden" : result.outcome === "safe" ? "Safe" : "Conflict";
    savePrescription({
      patientId: live.id,
      patientName: live.name,
      medicineName: medicine.name,
      status,
      conflictAllergen: result.allergen,
      severity: result.severity,
      doctorName: doctorName || "Unknown",
      overrideReason: overridden ? reason : undefined,
      overriddenAt: overridden ? Date.now() : undefined,
    });
    setShowSave(false);
    setOverrideText("");
    setResult(null);
    setMedicineId("");
  };

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft size={16} /> Back to patient list
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
            {live.name[0]}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{live.name}</div>
            <div className="text-sm text-slate-500">{live.id}</div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Allergy Profile</h3>
          {live.allergies.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No allergies recorded.</p>
          ) : (
            <div className="grid gap-2 mb-5">
              {live.allergies.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">{a.allergen}</span>
                    <SeverityPill severity={a.severity} />
                  </div>
                  <Badge verified={a.verified} onVerify={a.verified ? undefined : () => verifyAllergy(live.id, a.id)} />
                </div>
              ))}
            </div>
          )}

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 mt-6">Check Medication</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={medicineId}
              onChange={(e) => { setMedicineId(e.target.value); setResult(null); }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="">Select a medicine…</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.category}</option>
              ))}
            </select>
            <button
              disabled={!medicineId}
              onClick={runCheck}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <ShieldAlert size={16} /> Check Medication
            </button>
          </div>

          {result && result.outcome === "safe" && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Safe to proceed{result.notice ? ` · ${result.notice}` : ""}</span>
            </div>
          )}
          {result && result.outcome === "error" && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle size={18} className="text-red-600" />
              <span className="text-sm font-medium text-red-800">{result.notice}</span>
            </div>
          )}

          {result && (result.outcome === "safe" || result.outcome === "conflict") && medicine && (
            <button
              onClick={() => setShowSave(true)}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={14} /> Save Prescription
            </button>
          )}
        </div>
      </div>

      {/* Conflict modal */}
      <Modal open={showConflict} onClose={() => setShowConflict(false)} variant="conflict">
        {result?.outcome === "conflict" && (
          <div>
            <p className="text-sm text-slate-700 mb-4">
              This medicine conflicts with a recorded allergy. Do NOT proceed without review.
            </p>
            <div className="grid gap-2 mb-4">
              <Row label="Allergen" value={result.allergen!} />
              <Row label="Medicine" value={result.medicine!} />
              <Row label="Severity" value={<SeverityPill severity={result.severity!} />} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConflict(false)} className="flex-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Save modal */}
      <Modal open={showSave} onClose={() => { setShowSave(false); setOverrideText(""); }}>
        {result && medicine && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Save Prescription</h3>
            <p className="text-sm text-slate-500 mb-4">{live.name} · {medicine.name}</p>

            {result.outcome === "conflict" && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                  <AlertTriangle size={16} /> This prescription has an unresolved allergy conflict.
                </div>
                <p className="text-xs text-red-700 mt-1">Allergen: {result.allergen} · Severity: {result.severity}</p>
              </div>
            )}

            {result.outcome === "safe" && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800">
                No conflict detected. Safe to prescribe.
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Override reason {result.outcome === "conflict" ? "(required to override)" : "(optional)"}
              </label>
              <textarea
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                rows={3}
                placeholder="Clinical justification for override…"
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
              {overrideText.length > 0 && overrideText.length < 10 && (
                <p className="text-[11px] text-amber-600 mt-1">Reason must be at least 10 characters.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowSave(false); setOverrideText(""); }}
                className="flex-1 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
              >
                Change medicine
              </button>
              {result.outcome === "conflict" ? (
                <button
                  disabled={overrideText.trim().length < 10}
                  onClick={() => save(true, overrideText.trim())}
                  className="flex-1 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 px-3 py-2 rounded-lg transition-colors"
                >
                  Override & Save
                </button>
              ) : (
                <button
                  onClick={() => save(false)}
                  className="flex-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
                >
                  Save Prescription
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function MyPrescriptions() {
  const { prescriptions, doctorName } = useApp();
  const mine = useMemo(() => prescriptions.filter((p) => p.doctorName === doctorName).sort((a, b) => b.createdAt - a.createdAt), [prescriptions, doctorName]);

  if (mine.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-12">No prescriptions written yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {mine.map((rx) => (
        <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{rx.medicineName}</div>
              <div className="text-xs text-slate-500">{rx.patientName} · {rx.patientId}</div>
            </div>
            <StatusBadge status={rx.status} />
          </div>
          {rx.status === "Overridden" && rx.overrideReason && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
              Override reason: {rx.overrideReason}
            </div>
          )}
          <div className="mt-2 text-[11px] text-slate-400">
            {new Date(rx.createdAt).toLocaleString()} · by {rx.doctorName}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Conflict: "bg-red-50 text-red-700 border-red-200",
    Overridden: "bg-amber-50 text-amber-700 border-amber-200",
    Dispensed: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${map[status]}`}>{status}</span>;
}
