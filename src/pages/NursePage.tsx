import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge, DashboardHeader, EmptyState, SeverityPill, StatCards } from "@/components/ui";
import { User, Users, ShieldAlert, BadgeCheck, CalendarDays } from "lucide-react";

export function NursePage() {
  const { patients } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? "");
  const patient = patients.find((p) => p.id === selectedId);
  const allergyCount = patients.reduce((total, item) => total + item.allergies.length, 0);
  const unverifiedCount = patients.reduce((total, item) => total + item.allergies.filter((allergy) => !allergy.verified).length, 0);
  const stats = [
    { label: "Patients", value: patients.length, icon: Users, tone: "bg-teal-50 text-teal-700" },
    { label: "Allergies", value: allergyCount, icon: ShieldAlert, tone: "bg-red-50 text-red-700" },
    { label: "Unverified", value: unverifiedCount, icon: BadgeCheck, tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div id="dashboard">
        <DashboardHeader title="Nursing dashboard" subtitle="Read-only patient allergy review" icon={User} accent="teal">
          <StatCards stats={stats} />
        </DashboardHeader>
      </div>

      {patients.length > 0 ? <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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
      </div> : <EmptyState>No patient profiles are available.</EmptyState>}

      {patient && (
        <div id="workspace" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-semibold">
              {patient.name[0]}
            </div>
            <div>
              <div className="text-base font-bold text-slate-900">{patient.name}</div>
              <div className="text-xs text-slate-500">{patient.id} · {patient.age} yrs · {patient.gender} · {patient.bloodGroup} · {patient.phone}</div>
            </div>
          </div>
          <div className="p-5">
            {patient.allergies.length === 0 ? (
              <EmptyState><span className="inline-flex items-center gap-2"><User size={16} /> No allergies recorded for this patient.</span></EmptyState>
            ) : (
              <div className="grid gap-2">
                {patient.allergies.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-900">{a.allergen}</span>
                        <SeverityPill severity={a.severity} />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                        <span>Reaction: {a.reaction}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{new Date(a.recordedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge verified={a.verified} verifiedBy={a.verifiedBy} verifiedAt={a.verifiedAt} />
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
