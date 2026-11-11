import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge, SeverityPill } from "@/components/ui";
import { Plus, AlertCircle } from "lucide-react";
import type { Severity } from "@/lib/types";

export function PatientPage() {
  const { patients, addAllergy } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? "");
  const patient = patients.find((p) => p.id === selectedId);

  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<Severity>("Mild");
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const submit = () => {
    if (!allergen.trim()) {
      setError("Please check the allergen entered");
      setJustAdded(false);
      return;
    }
    const ok = addAllergy(selectedId, allergen, severity);
    if (ok) {
      setAllergen("");
      setSeverity("Mild");
      setError("");
      setJustAdded(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">My Allergies</h1>
        <p className="text-sm text-slate-500">View your recorded allergies and report a new one</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedId(p.id); setJustAdded(false); setError(""); }}
            className={`shrink-0 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedId === p.id ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {patient && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recorded Allergies</h3>
            {patient.allergies.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No allergies recorded.</p>
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Report a New Allergy</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Allergen</label>
                <input
                  value={allergen}
                  onChange={(e) => { setAllergen(e.target.value); setError(""); setJustAdded(false); }}
                  placeholder="e.g. Aspirin, Latex, Pollen"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Severity</label>
                <div className="flex gap-2">
                  {(["Mild", "Moderate", "Severe"] as Severity[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
                        severity === s
                          ? "bg-sky-600 text-white border-sky-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              {justAdded && !error && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Allergy saved. It will show as "Unverified" until a doctor verifies it.
                </div>
              )}

              <button
                onClick={submit}
                className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Allergy
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
