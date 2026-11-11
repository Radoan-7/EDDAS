import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Medicine } from "@/lib/types";
import { EmptyState, Modal } from "@/components/ui";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";

type DeleteTarget = { kind: "medicine"; id: string; label: string } | { kind: "mapping"; id: string; label: string };
const emptyDraft = { name: "", category: "", brandName: "", activeIngredient: "", dosageForms: "Tablet" };

export function AdminDatabase() {
  const { medicines, allergenMap, addMedicine, updateMedicine, deleteMedicine, updateAllergenMap, deleteAllergenMap } = useApp();
  const [medicineQuery, setMedicineQuery] = useState("");
  const [mappingQuery, setMappingQuery] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [medicineFormOpen, setMedicineFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [mappingAllergen, setMappingAllergen] = useState("");
  const [mappingCategory, setMappingCategory] = useState("");
  const [editingMapping, setEditingMapping] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const filteredMedicines = useMemo(() => medicines.filter((item) => `${item.name} ${item.category} ${item.brandName} ${item.activeIngredient}`.toLowerCase().includes(medicineQuery.trim().toLowerCase())), [medicines, medicineQuery]);
  const filteredMappings = useMemo(() => allergenMap.filter((item) => `${item.allergen} ${item.category}`.toLowerCase().includes(mappingQuery.trim().toLowerCase())), [allergenMap, mappingQuery]);

  const startAdd = () => { setEditing(null); setDraft(emptyDraft); setMedicineFormOpen(true); setError(""); };
  const startEdit = (medicine: Medicine) => {
    setEditing(medicine);
    setMedicineFormOpen(true);
    setDraft({ name: medicine.name, category: medicine.category, brandName: medicine.brandName, activeIngredient: medicine.activeIngredient, dosageForms: medicine.dosageForms.join(", ") });
    setError("");
  };
  const saveMedicine = () => {
    const forms = draft.dosageForms.split(",").map((form) => form.trim()).filter(Boolean);
    if (!draft.name.trim() || !draft.category.trim() || !draft.activeIngredient.trim() || !forms.length) {
      setError("Name, category, active ingredient, and at least one dosage form are required.");
      return;
    }
    const saved = editing
      ? updateMedicine({ ...editing, ...draft, brandName: draft.brandName.trim() || draft.name.trim(), dosageForms: forms })
      : addMedicine(draft.name, draft.category, draft.brandName, draft.activeIngredient, forms);
    if (!saved) {
      setError("A medicine with this name already exists, or the entry is invalid.");
      return;
    }
    setDraft(emptyDraft);
    setEditing(null);
    setMedicineFormOpen(false);
    setError("");
  };
  const saveMapping = () => {
    const allergen = mappingAllergen.trim();
    const category = mappingCategory.trim();
    if (!allergen || !category) { setError("Enter both an allergen and its drug category (or none)."); return; }
    if (category.toLowerCase() !== "none" && !medicines.some((medicine) => medicine.category.toLowerCase() === category.toLowerCase())) {
      setError("Choose an existing medicine class, or use 'none'. Add a medicine class first if needed.");
      return;
    }
    if (allergenMap.some((item) => item.allergen.toLowerCase() === allergen.toLowerCase()) && editingMapping?.toLowerCase() !== allergen.toLowerCase()) {
      setError("An allergen mapping with this name already exists.");
      return;
    }
    if (editingMapping && editingMapping.toLowerCase() !== allergen.toLowerCase()) deleteAllergenMap(editingMapping);
    updateAllergenMap(allergen, category.toLowerCase() === "none" ? "none" : category);
    setMappingAllergen("");
    setMappingCategory("");
    setEditingMapping(null);
    setError("");
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "medicine") deleteMedicine(deleteTarget.id);
    else deleteAllergenMap(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">Drug database</h2><p className="mt-1 text-xs text-slate-500">Database changes affect subsequent checks.</p></div><button onClick={startAdd} aria-label="Add medicine" className="rounded-lg bg-slate-800 p-2 text-white hover:bg-slate-900"><Plus size={16} /></button></div>
        <label className="relative mb-3 block"><span className="sr-only">Search medicines</span><Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" /><input value={medicineQuery} onChange={(event) => setMedicineQuery(event.target.value)} placeholder="Search medicines" className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {!filteredMedicines.length ? <EmptyState>No medicines match this search.</EmptyState> : filteredMedicines.map((medicine) => <div key={medicine.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <div className="min-w-0"><span className="block truncate text-sm font-medium text-slate-800">{medicine.name} <span className="text-xs text-slate-500">· {medicine.category}</span></span><span className="block truncate text-[11px] text-slate-500">{medicine.brandName} · {medicine.activeIngredient} · {medicine.dosageForms.join(", ")}</span></div>
            <div className="flex shrink-0 gap-1"><button onClick={() => startEdit(medicine)} aria-label={`Edit ${medicine.name}`} className="rounded-md p-1.5 text-slate-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><Pencil size={14} /></button><button onClick={() => setDeleteTarget({ kind: "medicine", id: medicine.id, label: medicine.name })} aria-label={`Delete ${medicine.name}`} className="rounded-md p-1.5 text-red-700 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"><Trash2 size={14} /></button></div>
          </div>)}
        </div>
        {medicineFormOpen && <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between"><strong className="text-xs">{editing ? `Edit ${editing.name}` : "Add medicine"}</strong><button onClick={() => { setDraft(emptyDraft); setEditing(null); setMedicineFormOpen(false); setError(""); }} aria-label="Close medicine editor"><X size={15} /></button></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-slate-600">Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <label className="text-xs text-slate-600">Drug category<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <label className="text-xs text-slate-600">Brand name<input value={draft.brandName} onChange={(event) => setDraft({ ...draft, brandName: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <label className="text-xs text-slate-600">Active ingredient<input value={draft.activeIngredient} onChange={(event) => setDraft({ ...draft, activeIngredient: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <label className="text-xs text-slate-600 sm:col-span-2">Dosage forms (comma-separated)<input value={draft.dosageForms} onChange={(event) => setDraft({ ...draft, dosageForms: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
          </div>
          {error && medicineFormOpen && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
          <button onClick={saveMedicine} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"><Check size={14} /> Save medicine</button>
        </div>}
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3"><h2 className="text-sm font-bold text-slate-900">Allergen → drug-class mappings</h2><p className="mt-1 text-xs text-slate-500">The category determines direct allergy conflicts.</p></div>
        <label className="relative mb-3 block"><span className="sr-only">Search allergen mappings</span><Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" /><input value={mappingQuery} onChange={(event) => setMappingQuery(event.target.value)} placeholder="Search mappings" className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" /></label>
        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {!filteredMappings.length ? <EmptyState>No allergen mappings found.</EmptyState> : filteredMappings.map((item) => <div key={item.allergen} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <button onClick={() => { setMappingAllergen(item.allergen); setMappingCategory(item.category); setEditingMapping(item.allergen); setError(""); }} className="min-w-0 flex-1 text-left"><strong>{item.allergen}</strong><span className="ml-2 text-xs text-slate-500">→ {item.category === "none" ? "no direct class" : item.category}</span></button>
            <button onClick={() => setDeleteTarget({ kind: "mapping", id: item.allergen, label: `${item.allergen} → ${item.category}` })} aria-label={`Delete ${item.allergen} mapping`} className="rounded-md p-1.5 text-red-700 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"><Trash2 size={14} /></button>
          </div>)}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <strong className="text-xs">{editingMapping ? `Edit ${editingMapping}` : "Add mapping"}</strong>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label><span className="sr-only">Allergen name</span><input value={mappingAllergen} onChange={(event) => setMappingAllergen(event.target.value)} placeholder="Allergen" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <label><span className="sr-only">Drug category</span><input value={mappingCategory} onChange={(event) => setMappingCategory(event.target.value)} placeholder="Drug category or none" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" /></label>
            <button onClick={saveMapping} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900">{editingMapping ? "Update" : "Add"}</button>
          </div>
          {error && editingMapping !== null && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
      </section>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && <div><h2 className="text-base font-bold text-slate-900">Confirm deletion</h2><p className="mt-2 text-sm text-slate-600">Delete <strong>{deleteTarget.label}</strong>? This change affects the next allergy check.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button><button onClick={confirmDelete} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800">Delete</button></div></div>}
      </Modal>
    </div>
  );
}
