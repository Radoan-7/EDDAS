import { useApp } from "@/lib/store";
import { StatusBadge } from "@/pages/DoctorPage";
import { Pill, CheckCircle2, Lock } from "lucide-react";

export function PharmacistPage() {
  const { prescriptions, dispensePrescription } = useApp();
  const queue = [...prescriptions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Dispensing Queue</h1>
        <p className="text-sm text-slate-500">Review and dispense verified prescriptions</p>
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">No prescriptions in the queue.</p>
      ) : (
        <div className="grid gap-2">
          {queue.map((rx) => {
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
                    Conflict: {rx.conflictAllergen} ({rx.severity}) — not overridden.
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
                      onClick={() => dispensePrescription(rx.id)}
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
  );
}
