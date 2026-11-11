import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { checkAllergy } from "@/lib/allergy";
import { StatusBadge } from "@/pages/DoctorPage";
import { DashboardHeader, EmptyState, Modal, SeverityPill, StatCards } from "@/components/ui";
import { PharmacistCharts } from "@/components/DashboardCharts";
import { Pill, CheckCircle2, Lock, Clock3, PackageCheck, ShieldAlert, TriangleAlert, ClipboardList, Printer } from "lucide-react";
import type { AllergyResult, Medicine, Patient, Prescription } from "@/lib/types";

type QueueFilter = "All" | "Pending" | "Blocked" | "Overridden" | "Dispensed";

export function PharmacistPage() {
  const { prescriptions, patients, medicines, allergenMap, simulateFailure, dispensePrescription, recordCheck } = useApp();
  const [filter, setFilter] = useState<QueueFilter>("All");
  const [pendingDispense, setPendingDispense] = useState<Prescription | null>(null);
  const [printPrescription, setPrintPrescription] = useState<Prescription | null>(null);
  const finalCheck = useMemo<{ patient: Patient | null; medicine: Medicine | null; result: AllergyResult } | null>(() => {
    if (!pendingDispense) return null;
    const patient = patients.find((item) => item.id === pendingDispense.patientId);
    const medicine = medicines.find((item) => item.name === pendingDispense.medicineName);
    if (!patient || !medicine) return { patient: patient ?? null, medicine: medicine ?? null, result: { outcome: "error" as const, notice: "Patient or medicine missing; dispensing blocked." } };
    return { patient, medicine, result: checkAllergy(patient, medicine, allergenMap, simulateFailure) };
  }, [pendingDispense, patients, medicines, allergenMap, simulateFailure]);
  const overrideStillApplies = pendingDispense?.status === "Overridden"
    && Boolean(pendingDispense.overrideReason?.trim() && pendingDispense.overrideReason.trim().length >= 10)
    && finalCheck?.result.outcome === "conflict"
    && finalCheck.result.allergen === pendingDispense.conflictAllergen
    && finalCheck.result.severity === pendingDispense.severity
    && finalCheck.result.reason === pendingDispense.conflictReason;
  const dispenseBlocked = finalCheck?.result.outcome === "error"
    || (finalCheck?.result.outcome === "conflict" && !overrideStillApplies)
    || (finalCheck?.result.outcome === "caution" && pendingDispense?.status !== "Caution");
  const queue = [...prescriptions].sort((a, b) => b.createdAt - a.createdAt);
  const visibleQueue = queue.filter((rx) => {
    if (filter === "Pending") return rx.status === "Safe" || rx.status === "Caution";
    if (filter === "Blocked") return rx.status === "Conflict";
    return filter === "All" || rx.status === filter;
  });
  const stats = [
    { label: "Pending", value: prescriptions.filter((rx) => rx.status !== "Dispensed" && rx.status !== "Conflict").length, icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "Dispensed", value: prescriptions.filter((rx) => rx.status === "Dispensed").length, icon: PackageCheck, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Blocked", value: prescriptions.filter((rx) => rx.status === "Conflict").length, icon: ShieldAlert, tone: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div id="dashboard">
        <DashboardHeader title="Pharmacist dashboard" subtitle="Review and dispense verified prescriptions" icon={ClipboardList} accent="amber">
          <StatCards stats={stats} />
        </DashboardHeader>
      </div>

      <PharmacistCharts prescriptions={prescriptions} />

      <div id="workspace">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="prescription-filter" className="text-sm font-semibold text-slate-700">Filter prescriptions</label>
        <div role="tablist" aria-label="Filter prescriptions by status" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
          {(["All", "Pending", "Blocked", "Overridden", "Dispensed"] as QueueFilter[]).map((option) => {
            const count = option === "All" ? prescriptions.length : option === "Pending"
              ? prescriptions.filter((item) => item.status === "Safe" || item.status === "Caution").length
              : option === "Blocked" ? prescriptions.filter((item) => item.status === "Conflict").length
                : prescriptions.filter((item) => item.status === option).length;
            return <button key={option} role="tab" aria-selected={filter === option} onClick={() => setFilter(option)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${filter === option ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{option} <span className="opacity-75">{count}</span></button>;
          })}
        </div>
      </div>

      {visibleQueue.length === 0 ? (
        <EmptyState>
          {queue.length === 0 ? "No prescriptions in the queue yet." : `No ${filter.toLowerCase()} prescriptions.`}
        </EmptyState>
      ) : (
        <div className="grid gap-2">
          {visibleQueue.map((rx) => {
            const blocked = rx.status === "Conflict";
            return (
              <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Pill size={15} className="text-amber-600 shrink-0" />
                      <span className="text-sm font-semibold text-slate-900 truncate">{rx.medicineName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{rx.patientName} · {rx.patientId}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">by {rx.doctorName} · {new Date(rx.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={rx.status} />
                </div>

                {rx.status === "Overridden" && rx.overrideReason && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
                    Override reason: {rx.overrideReason}
                  </div>
                )}
                {rx.status === "Conflict" && rx.conflictAllergen && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-2.5 py-1.5">
                    <span className="mr-1">Conflict: {rx.conflictAllergen}</span>
                    {rx.severity && <SeverityPill severity={rx.severity} />}
                    <span> — not overridden.</span>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  {rx.status === "Dispensed" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
                      <CheckCircle2 size={14} /> Dispensed
                    </span>
                  ) : blocked ? (
                    <span title="Conflict unresolved" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 cursor-not-allowed">
                      <Lock size={13} /> Dispense
                    </span>
                  ) : (
                    <button
                      onClick={() => setPendingDispense(rx)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pill size={13} /> Dispense
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <Modal open={pendingDispense !== null} onClose={() => setPendingDispense(null)}>
        {pendingDispense && (
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <TriangleAlert size={18} className="text-amber-600" />
              <h2 className="text-base font-bold">Confirm dispensing</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Dispense <strong>{pendingDispense.medicineName}</strong> for {pendingDispense.patientName}?
            </p>
            <p className="mt-1 text-xs text-slate-500">This will mark the prescription as dispensed.</p>
            <div className={`mt-4 rounded-xl border p-3 ${finalCheck?.result.outcome === "conflict" || finalCheck?.result.outcome === "error" ? "border-red-200 bg-red-50" : finalCheck?.result.outcome === "caution" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
              <p className="text-xs font-bold uppercase tracking-wide">Final allergy re-check: {finalCheck?.result.outcome.toUpperCase() ?? "Checking"}</p>
              <p className="mt-1 text-xs">{finalCheck?.result.reason ?? finalCheck?.result.notice ?? "No allergy conflict found at dispense time."}</p>
              {pendingDispense.status === "Overridden" && <p className="mt-1 text-xs font-semibold">Doctor override: {pendingDispense.overrideReason}</p>}
              {dispenseBlocked && <p className="mt-2 text-xs font-bold text-red-800">The current result is not covered by the saved doctor acknowledgement. Recheck and document approval before dispensing.</p>}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPendingDispense(null)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={dispenseBlocked}
                onClick={() => {
                  if (finalCheck?.patient && finalCheck.medicine) {
                    const result = finalCheck.result;
                    const label = result.outcome === "conflict" ? "Conflict" : result.outcome === "caution" ? "Caution" : result.outcome === "error" ? "Blocked" : "Safe";
                    recordCheck(`${label}: ${result.allergen ?? result.notice ?? "No allergy conflict"} — ${pendingDispense.patientName} — ${pendingDispense.medicineName}${result.reason ? ` — ${result.reason}` : ""}`, pendingDispense.patientId, pendingDispense.medicineName, result.outcome);
                  }
                  dispensePrescription(pendingDispense.id);
                  setPrintPrescription({ ...pendingDispense, status: "Dispensed", dispensedAt: Date.now() });
                  setPendingDispense(null);
                }}
                className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Confirm & dispense
              </button>
            </div>
          </div>
        )}
      </Modal>
      {printPrescription && <div className="my-4 flex justify-end"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"><Printer size={16} /> Print dispense slip</button></div>}
      {printPrescription && <section className="print-dispense-slip" aria-label="Printable dispensing slip">
        <header><strong>EDAAS · DISPENSE RECORD</strong><span>Patient medication slip</span></header>
        <h1>{printPrescription.patientName}</h1>
        <p>Patient ID: {printPrescription.patientId}</p>
        <div className="dispense-medicine"><span>Medicine</span><strong>{printPrescription.medicineName}</strong></div>
        <p>Prescribed by: {printPrescription.doctorName}</p>
        <p>Dispensed at: {new Date(printPrescription.dispensedAt ?? Date.now()).toLocaleString()}</p>
        <p>Final allergy status: {printPrescription.status}</p>
        <footer>Decision support only – follow the prescription and local dispensing policy.</footer>
      </section>}
    </div>
  );
}
