import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge, DashboardHeader, EmptyState, Modal, SeverityPill, StatCards } from "@/components/ui";
import { PatientProgress } from "@/components/DashboardCharts";
import { Plus, AlertCircle, BadgeCheck, ShieldAlert, CalendarDays, Phone, Droplet, UserRound, Printer, Pencil, Trash2, Save, X } from "lucide-react";
import type { Allergy, ReactionType, Severity } from "@/lib/types";

const suggestedAllergens = ["Penicillin", "Sulfa", "NSAID", "Peanut", "Latex"];

export function PatientPage() {
  const { patients, addAllergy, updateAllergy, deleteAllergy } = useApp();
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? "");
  const patient = patients.find((p) => p.id === selectedId);

  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<Severity>("Mild");
  const [reaction, setReaction] = useState<ReactionType>("Rash");
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [editing, setEditing] = useState<Allergy | null>(null);
  const [editAllergen, setEditAllergen] = useState("");
  const [editSeverity, setEditSeverity] = useState<Severity>("Mild");
  const [editReaction, setEditReaction] = useState<ReactionType>("Rash");
  const [pendingDelete, setPendingDelete] = useState<Allergy | null>(null);
  const stats = [
    { label: "My allergies", value: patient?.allergies.length ?? 0, icon: ShieldAlert, tone: "bg-sky-50 text-sky-700" },
    { label: "Unverified", value: patient?.allergies.filter((allergy) => !allergy.verified).length ?? 0, icon: BadgeCheck, tone: "bg-amber-50 text-amber-700" },
  ];

  const submit = () => {
    if (!allergen.trim()) {
      setError("Please check the allergen entered");
      setJustAdded(false);
      return;
    }
    const ok = addAllergy(selectedId, allergen, severity, reaction);
    if (ok) {
      setAllergen("");
      setSeverity("Mild");
      setReaction("Rash");
      setError("");
      setJustAdded(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div id="dashboard">
        <DashboardHeader title="Patient dashboard" subtitle="Your recorded allergies and reports" icon={ShieldAlert} accent="sky">
          <StatCards stats={stats} />
        </DashboardHeader>
      </div>

      {patients.length > 0 ? <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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
      </div> : <EmptyState>No patient profiles are available.</EmptyState>}

      {patient ? (
        <div id="workspace">
          <>
          <PatientProgress patients={patients} patientId={patient.id} />
          <div className="mb-3 flex justify-end"><button onClick={() => window.print()} aria-label="Print Allergy Card" className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700"><Printer size={16} /> Print Allergy Card</button></div>
          <section className="print-allergy-card" aria-label="Printable allergy card">
            <div className="allergy-card-top"><div><strong>EDAAS</strong><span>EMERGENCY ALLERGY CARD</span></div><span className="allergy-card-mark">!</span></div>
            <h1>{patient.name}</h1>
            <p>{patient.id} · {patient.age} yrs · Blood group {patient.bloodGroup}</p>
            <div className="allergy-card-list">
              {patient.allergies.length ? patient.allergies.map((allergy) => <div key={allergy.id}><strong>{allergy.allergen}</strong><span>{allergy.severity} · {allergy.reaction}</span></div>) : <div><strong>No allergies recorded</strong></div>}
            </div>
            <small>Present this card to healthcare professionals. Decision support information; confirm details with the patient.</small>
          </section>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 pb-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><UserRound size={14} />{patient.age} yrs · {patient.gender}</span>
              <span className="inline-flex items-center gap-1.5"><Droplet size={14} className="text-red-600" />{patient.bloodGroup}</span>
              <span className="inline-flex items-center gap-1.5"><Phone size={14} />{patient.phone}</span>
            </div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recorded Allergies</h3>
            {patient.allergies.length === 0 ? (
              <EmptyState>No allergies have been recorded for this profile.</EmptyState>
            ) : (
              <div className="grid gap-2">
                {patient.allergies.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{a.allergen}</span>
                        <SeverityPill severity={a.severity} />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                        <span>Reaction: {a.reaction}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{new Date(a.recordedAt).toLocaleDateString()}</span>
                      </div>
                      {a.verified && a.verifiedBy && <p className="mt-1 text-[11px] font-medium text-emerald-700">Verified by {a.verifiedBy.startsWith("Dr. ") ? a.verifiedBy : `Dr. ${a.verifiedBy}`}{a.verifiedAt ? ` on ${new Date(a.verifiedAt).toLocaleDateString()}` : ""}</p>}
                    </div>
                    <div className="flex items-center gap-2"><Badge verified={a.verified} verifiedBy={a.verifiedBy} verifiedAt={a.verifiedAt} />
                      {!a.verified && a.source === "self-reported" && <>
                        <button onClick={() => { setEditing(a); setEditAllergen(a.allergen); setEditSeverity(a.severity); setEditReaction(a.reaction); }} aria-label={`Edit ${a.allergen} allergy`} className="rounded-md p-1.5 text-slate-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"><Pencil size={14} /></button>
                        <button onClick={() => setPendingDelete(a)} aria-label={`Delete ${a.allergen} allergy`} className="rounded-md p-1.5 text-red-700 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"><Trash2 size={14} /></button>
                      </>}
                    </div>
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
                  list="common-allergens"
                  placeholder="Search or enter an allergen"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
                <datalist id="common-allergens">
                  {suggestedAllergens.map((suggestion) => <option key={suggestion} value={suggestion} />)}
                </datalist>
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
              <div>
                <label htmlFor="allergy-reaction" className="mb-1.5 block text-xs font-medium text-slate-600">Reaction type</label>
                <select id="allergy-reaction" value={reaction} onChange={(event) => setReaction(event.target.value as ReactionType)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600">
                  {(["Rash", "Swelling", "Anaphylaxis", "Breathing difficulty"] as ReactionType[]).map((item) => <option key={item}>{item}</option>)}
                </select>
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
        </div>
      ) : null}
      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing && <div>
          <div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Edit unverified allergy</h2><button onClick={() => setEditing(null)} aria-label="Close allergy editor"><X size={17} /></button></div>
          <label className="mt-4 block text-xs font-semibold text-slate-600">Allergen<input value={editAllergen} onChange={(event) => setEditAllergen(event.target.value)} list="common-allergens" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">Severity<select value={editSeverity} onChange={(event) => setEditSeverity(event.target.value as Severity)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{(["Mild", "Moderate", "Severe"] as Severity[]).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">Reaction<select value={editReaction} onChange={(event) => setEditReaction(event.target.value as ReactionType)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{(["Rash", "Swelling", "Anaphylaxis", "Breathing difficulty"] as ReactionType[]).map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button><button onClick={() => { if (!updateAllergy(selectedId, editing.id, { allergen: editAllergen, severity: editSeverity, reaction: editReaction })) { setError("Enter a valid allergen."); return; } setEditing(null); setError(""); }} className="inline-flex items-center gap-1 rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white"><Save size={14} />Save</button></div>
          {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
        </div>}
      </Modal>
      <Modal open={pendingDelete !== null} onClose={() => setPendingDelete(null)}>
        {pendingDelete && <div><h2 className="text-base font-bold text-slate-900">Delete self-reported allergy?</h2><p className="mt-2 text-sm text-slate-600">Remove <strong>{pendingDelete.allergen}</strong> from this profile? Verified allergies cannot be deleted here.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setPendingDelete(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button><button onClick={() => { deleteAllergy(selectedId, pendingDelete.id); setPendingDelete(null); }} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white">Delete allergy</button></div></div>}
      </Modal>
    </div>
  );
}
