import { useState } from "react";
import { useApp } from "@/lib/store";
import { Settings, Plus, RefreshCw, AlertTriangle, FlaskConical } from "lucide-react";

export function AdminPage() {
  const { medicines, allergenMap, simulateFailure, addMedicine, updateAllergenMap, setSimulateFailure, resetDemo } = useApp();

  const [mapAllergen, setMapAllergen] = useState("");
  const [mapCategory, setMapCategory] = useState("");
  const [medName, setMedName] = useState("");
  const [medCategory, setMedCategory] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Administration</h1>
        <p className="text-sm text-slate-500">Manage mappings, medicines, and demo controls</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Allergen map */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Allergen → Category Mappings</h3>
          <p className="text-xs text-slate-500 mb-3">Edits apply on the next allergy check.</p>
          <div className="grid gap-1.5 mb-4">
            {allergenMap.map((m) => (
              <div key={m.allergen} className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-md bg-slate-50">
                <span className="font-medium text-slate-800">{m.allergen}</span>
                <span className="text-slate-500">→ {m.category}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={mapAllergen}
              onChange={(e) => setMapAllergen(e.target.value)}
              placeholder="Allergen"
              className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none"
            />
            <input
              value={mapCategory}
              onChange={(e) => setMapCategory(e.target.value)}
              placeholder="Category (or none)"
              className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none"
            />
            <button
              disabled={!mapAllergen.trim() || !mapCategory.trim()}
              onClick={() => { updateAllergenMap(mapAllergen, mapCategory.trim() === "none" ? "none" : mapCategory); setMapAllergen(""); setMapCategory(""); }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 px-3 py-1.5 rounded-lg"
            >
              <Plus size={14} /> Set
            </button>
          </div>
        </section>

        {/* Medicines */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Medicines</h3>
          <p className="text-xs text-slate-500 mb-3">Add a new medicine available for checks.</p>
          <div className="grid gap-1.5 mb-4 max-h-48 overflow-y-auto">
            {medicines.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1.5 px-2.5 rounded-md bg-slate-50">
                <span className="font-medium text-slate-800">{m.name}</span>
                <span className="text-slate-500">{m.category}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="Medicine name"
              className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none"
            />
            <input
              value={medCategory}
              onChange={(e) => setMedCategory(e.target.value)}
              placeholder="Category"
              className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 outline-none"
            />
            <button
              disabled={!medName.trim() || !medCategory.trim()}
              onClick={() => { addMedicine(medName, medCategory); setMedName(""); setMedCategory(""); }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 px-3 py-1.5 rounded-lg"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </section>
      </div>

      {/* Controls */}
      <section className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Settings size={15} /> Demo Controls
        </h3>

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 mb-3">
          <div className="flex items-center gap-3">
            <FlaskConical size={18} className={simulateFailure ? "text-red-600" : "text-slate-400"} />
            <div>
              <div className="text-sm font-medium text-slate-900">Simulate check failure</div>
              <div className="text-xs text-slate-500">Forces all allergy checks to block the drug.</div>
            </div>
          </div>
          <button
            onClick={() => setSimulateFailure(!simulateFailure)}
            className={`relative w-11 h-6 rounded-full transition-colors ${simulateFailure ? "bg-red-500" : "bg-slate-300"}`}
            role="switch"
            aria-checked={simulateFailure}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${simulateFailure ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {simulateFailure && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle size={14} /> Failure simulation is ON — checks will block all drugs.
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="text-slate-400" />
            <div>
              <div className="text-sm font-medium text-slate-900">Reset demo data</div>
              <div className="text-xs text-slate-500">Restore seed patients, medicines, mappings; clear prescriptions.</div>
            </div>
          </div>
          <button
            onClick={() => { if (confirmReset) { resetDemo(); setConfirmReset(false); } else setConfirmReset(true); }}
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              confirmReset ? "bg-red-600 text-white hover:bg-red-700" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            {confirmReset ? "Click again to confirm" : "Reset"}
          </button>
        </div>
      </section>
    </div>
  );
}
