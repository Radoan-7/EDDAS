import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge, SeverityPill } from "@/components/ui";
import { User } from "lucide-react";

export function NursePage() {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? "");
  const patient = patients.find((p) => p.id === selectedId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Patient Allergies</h1>
        <p className="text-sm text-slate-500">Read-only allergy review</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedId === p.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-700 border-slate-200 hover:border-teal-300"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {patient && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-semibold">
              {patient.name[0]}
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">{patient.name}</div>
              <div className="text-xs text-slate-500">{patient.id}</div>
            </div>
          </div>
          <div className="p-5">
            {patient.allergies.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                <User size={16} /> No allergies recorded.
              </div>
            ) : (
              <div className="grid gap-2">
                {patient.allergies.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900">{a.allergen}</span>
                      <SeverityPill severity={a.severity} />
                    </div>
                    <Badge verified={a.verified} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
