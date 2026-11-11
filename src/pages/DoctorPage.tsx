import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { checkAllergy } from "@/lib/allergy";
import type { CheckOutcome, DrugCheckResult, Patient, Prescription, PrescriptionStatus } from "@/lib/types";
import { Badge, EmptyState, Modal, SeverityPill, SkeletonBlock, StatCards } from "@/components/ui";
import { DoctorCharts } from "@/components/DashboardCharts";
import {
  Activity, AlertTriangle, ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, ClipboardList, Clock3,
  Droplet, FileText, HeartPulse, LoaderCircle, Pencil, Phone, Plus, Search, ShieldAlert, ShieldCheck,
  Stethoscope, Users, X,
} from "lucide-react";

type DoctorTab = "Allergies" | "Prescribe" | "History";
type PatientFilter = "All patients" | "Severe allergy";

const outcomeStyles: Record<CheckOutcome, string> = {
  conflict: "border-red-200 bg-red-50 text-red-900",
  caution: "border-amber-200 bg-amber-50 text-amber-900",
  safe: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-300 bg-red-100 text-red-900",
};

const outcomeLabels: Record<CheckOutcome, string> = {
  conflict: "CONFLICT",
  caution: "CAUTION",
  safe: "SAFE",
  error: "BLOCKED",
};

const eventIcons: Record<string, typeof Activity> = {
  Check: ShieldAlert,
  Prescription: FileText,
  Override: AlertTriangle,
  Verify: BadgeCheck,
  Dispense: CheckCircle2,
};

export function DoctorPage() {
  const { doctorName, patients, auditEvents } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showMyPrescriptions, setShowMyPrescriptions] = useState(false);
  const [tab, setTab] = useState<DoctorTab>("Allergies");
  const stats = [
    { label: "Patients", value: patients.length, icon: Users, tone: "bg-blue-50 text-blue-700" },
    { label: "Conflicts caught", value: auditEvents.filter((event) => event.action === "Check" && event.result.startsWith("Conflict")).length, icon: ShieldCheck, tone: "bg-red-50 text-red-700" },
    { label: "Overrides", value: auditEvents.filter((event) => event.action === "Override").length, icon: Activity, tone: "bg-amber-50 text-amber-700" },
  ];
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header id="dashboard" className="role-header mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><Stethoscope size={21} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Clinical workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Doctor dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Patient records and medication decision support</p>
          </div>
        </div>
        <div className="mt-5"><StatCards stats={stats} /></div>
      </header>

      <DoctorCharts patients={patients} events={auditEvents} />

      <section id="workspace">
        {selectedPatient ? (
          <PatientFile
            key={selectedPatient.id}
            patient={selectedPatient}
            doctorName={doctorName}
            tab={tab}
            onTabChange={setTab}
            onBack={() => { setSelectedPatientId(null); setTab("Allergies"); }}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-800">{showMyPrescriptions ? "My prescriptions" : "Patient directory"}</h2>
              <button
                onClick={() => setShowMyPrescriptions((current) => !current)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
              >
                {showMyPrescriptions ? <Users size={16} /> : <FileText size={16} />}
                {showMyPrescriptions ? "Back to patients" : "My prescriptions"}
              </button>
            </div>
            {showMyPrescriptions ? (
              <MyPrescriptions />
            ) : (
              <PatientList
                patients={patients}
                onSelect={(patient) => { setSelectedPatientId(patient.id); setTab("Allergies"); }}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PatientList({ patients, onSelect }: { patients: Patient[]; onSelect: (patient: Patient) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("All patients");
  const filtered = patients.filter((patient) => {
    const matchesText = `${patient.name} ${patient.id}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesSeverity = filter === "All patients" || patient.allergies.some((allergy) => allergy.severity === "Severe");
    return matchesText && matchesSeverity;
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search patients by name or ID"
            placeholder="Search patient name or ID"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <select
          value={filter}
          aria-label="Filter patient records"
          onChange={(event) => setFilter(event.target.value as PatientFilter)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option>All patients</option>
          <option>Severe allergy</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState>{patients.length === 0 ? "No patient profiles are available." : "No patients match the current search and filters."}</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((patient) => {
            const severe = patient.allergies.some((allergy) => allergy.severity === "Severe");
            return (
              <button
                key={patient.id}
                onClick={() => onSelect(patient)}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={patient.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-slate-900">{patient.name}</div>
                    <div className="text-xs text-slate-500">{patient.id} · {patient.age} yrs</div>
                  </div>
                  {severe && <span title="Severe allergy" className="rounded-full bg-red-50 p-2 text-red-700"><AlertTriangle size={15} /></span>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{patient.allergies.length} recorded {patient.allergies.length === 1 ? "allergy" : "allergies"}</span>
                  <span className="text-xs font-semibold text-blue-700">Open file →</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PatientFile({
  patient,
  doctorName,
  tab,
  onTabChange,
  onBack,
}: {
  patient: Patient;
  doctorName: string;
  tab: DoctorTab;
  onTabChange: (tab: DoctorTab) => void;
  onBack: () => void;
}) {
  const { patients, medicines, allergenMap, simulateFailure, auditEvents, verifyAllergy, savePrescription, recordCheck } = useApp();
  const live = patients.find((item) => item.id === patient.id) ?? patient;
  const severeCount = live.allergies.filter((allergy) => allergy.severity === "Severe").length;
  const patientEvents = useMemo(
    () => auditEvents
      .filter((event) => event.patientId === live.id || (!event.patientId && (event.result.includes(live.id) || event.result.includes(live.name))))
      .sort((a, b) => b.time - a.time),
    [auditEvents, live.id, live.name],
  );

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
        <ArrowLeft size={16} /> Patient directory
      </button>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/70 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar name={live.name} large />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{live.name}</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{live.id}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5"><Activity size={14} />{live.age} years · {live.gender}</span>
              <span className="inline-flex items-center gap-1.5"><Droplet size={14} className="text-red-600" />Blood group {live.bloodGroup}</span>
              <span className="inline-flex items-center gap-1.5"><Phone size={14} />{live.phone}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-center shadow-sm">
            <div className="text-lg font-bold text-slate-900">{live.allergies.length}</div>
            <div className="text-[11px] text-slate-500">allergies</div>
          </div>
        </div>
        {live.allergies.length > 0 && (
          <div className="flex items-start gap-2.5 border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-900">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 animate-pulse text-red-700" />
            <span>
              <strong>Allergy alert:</strong> {live.allergies.map((allergy) => `${allergy.allergen} (${allergy.severity})`).join(" · ")}
              {severeCount > 0 && <span className="ml-1 font-semibold">· {severeCount} severe</span>}
            </span>
          </div>
        )}
      </section>

      <nav aria-label="Patient file tabs" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          { label: "Allergies" as const, icon: HeartPulse },
          { label: "Prescribe" as const, icon: ClipboardList },
          { label: "History" as const, icon: Clock3 },
        ]).map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onTabChange(label)}
            aria-current={tab === label ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === label ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>

      {tab === "Allergies" && (
        <AllergyProfile patient={live} doctorName={doctorName} onVerify={verifyAllergy} />
      )}
      {tab === "Prescribe" && (
        <PrescriptionCart
          patient={live}
          doctorName={doctorName}
          medicines={medicines}
          allergenMap={allergenMap}
          simulateFailure={simulateFailure}
          recordCheck={recordCheck}
          savePrescription={savePrescription}
        />
      )}
      {tab === "History" && <PatientHistory patient={live} events={patientEvents} />}
    </div>
  );
}

function AllergyProfile({ patient, doctorName, onVerify }: {
  patient: Patient;
  doctorName: string;
  onVerify: (patientId: string, allergyId: string, verifiedBy: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recorded allergies</h3>
          <p className="text-xs text-slate-500">Reaction details and verification status</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{patient.allergies.length} total</span>
      </div>
      {patient.allergies.length === 0 ? (
        <EmptyState>No allergies recorded for this patient.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {patient.allergies.map((allergy) => (
            <article key={allergy.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{allergy.allergen}</span>
                    <SeverityPill severity={allergy.severity} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><strong className="text-slate-700">Reaction:</strong> {allergy.reaction}</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays size={13} />Recorded {new Date(allergy.recordedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge
                  verified={allergy.verified}
                  verifiedBy={allergy.verifiedBy}
                  verifiedAt={allergy.verifiedAt}
                  onVerify={allergy.verified ? undefined : () => onVerify(patient.id, allergy.id, doctorName)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PrescriptionCart({
  patient,
  doctorName,
  medicines,
  allergenMap,
  simulateFailure,
  recordCheck,
  savePrescription,
}: {
  patient: Patient;
  doctorName: string;
  medicines: ReturnType<typeof useApp>["medicines"];
  allergenMap: ReturnType<typeof useApp>["allergenMap"];
  simulateFailure: boolean;
  recordCheck: ReturnType<typeof useApp>["recordCheck"];
  savePrescription: ReturnType<typeof useApp>["savePrescription"];
}) {
  const [medicineToAdd, setMedicineToAdd] = useState("");
  const [cart, setCart] = useState<string[]>([]);
  const [checks, setChecks] = useState<DrugCheckResult[]>([]);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [overrideText, setOverrideText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [activeConflict, setActiveConflict] = useState<DrugCheckResult | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const byId = useMemo(() => new Map(medicines.map((medicine) => [medicine.id, medicine])), [medicines]);
  const overall: CheckOutcome | null = checks.some(({ result }) => result.outcome === "error")
    ? "error"
    : checks.some(({ result }) => result.outcome === "conflict")
      ? "conflict"
      : checks.some(({ result }) => result.outcome === "caution")
        ? "caution"
        : checks.length > 0 ? "safe" : null;
  const canSave = checks.length > 0
    && checks.every(({ result, medicine }) => result.outcome !== "error"
      && (result.outcome !== "caution" || acknowledged.includes(medicine.id))
      && (result.outcome !== "conflict" || overrideText.trim().length >= 10));

  const updateCart = (next: string[]) => {
    setCart(next);
    setChecks([]);
    setAcknowledged([]);
    setElapsedMs(null);
    setSaveMessage("");
  };

  const runChecks = async (medicineIds = cart) => {
    const selected = medicineIds.map((id) => byId.get(id)).filter((medicine) => medicine !== undefined);
    if (selected.length === 0) return;
    setIsChecking(true);
    setChecks([]);
    setAcknowledged([]);
    setSaveMessage("");
    const started = performance.now();
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    const rawResults = selected.map((medicine) => ({
      medicine,
      result: checkAllergy(patient, medicine, allergenMap, simulateFailure),
    }));
    const duration = Math.round(performance.now() - started);
    const results = rawResults.map((item) => ({
      ...item,
      result: { ...item.result, elapsedMs: duration },
    }));
    setChecks(results);
    setElapsedMs(duration);
    for (const { medicine, result } of results) {
      recordCheck(
        `${result.outcome === "conflict" ? "Conflict" : result.outcome === "caution" ? "Caution" : result.outcome === "error" ? "Blocked" : "Safe"}: ${result.allergen ?? result.notice ?? "No allergy conflict"} — ${patient.name} — ${medicine.name}${result.reason ? ` — ${result.reason}` : ""}${result.notice ? ` — ${result.notice}` : ""} (${duration} ms)`,
        patient.id,
        medicine.name,
        result.outcome,
      );
    }
    setIsChecking(false);
    const conflict = results.find((item) => item.result.outcome === "conflict");
    if (conflict) setActiveConflict(conflict);
  };

  const safeAlternatives = (conflict: DrugCheckResult) => {
    const categories = new Set<string>();
    return medicines.filter((candidate) => {
      const category = candidate.category.toLowerCase();
      if (candidate.id === conflict.medicine.id
        || category === conflict.medicine.category.toLowerCase()
        || categories.has(category)
        || checkAllergy(patient, candidate, allergenMap).outcome !== "safe") {
        return false;
      }
      categories.add(category);
      return true;
    }).slice(0, 3);
  };

  const replaceWithAlternative = (conflict: DrugCheckResult, alternativeId: string) => {
    const updatedCart = cart.map((id) => id === conflict.medicine.id ? alternativeId : id);
    setActiveConflict(null);
    updateCart([...new Set(updatedCart)]);
    void runChecks([...new Set(updatedCart)]);
  };

  const saveCart = () => {
    if (!canSave) return;
    for (const { medicine, result } of checks) {
      const overridden = result.outcome === "conflict";
      const status: PrescriptionStatus = overridden
        ? "Overridden"
        : result.outcome === "caution" ? "Caution" : "Safe";
      savePrescription({
        patientId: patient.id,
        patientName: patient.name,
        medicineName: medicine.name,
        status,
        conflictAllergen: result.allergen,
        conflictReason: result.reason,
        severity: result.severity,
        doctorName: doctorName || "Unknown",
        overrideReason: overridden ? overrideText.trim() : undefined,
        overriddenAt: overridden ? Date.now() : undefined,
      });
    }
    setSaveMessage(`${checks.length} medication${checks.length === 1 ? "" : "s"} saved to prescriptions.`);
    setChecks([]);
    setCart([]);
    setOverrideText("");
    setAcknowledged([]);
    setElapsedMs(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Prescription cart</h3>
          <p className="mt-1 text-xs text-slate-500">Add one or more medicines, then run an allergy check for each item.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{cart.length} in cart</span>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <select
          value={medicineToAdd}
          onChange={(event) => setMedicineToAdd(event.target.value)}
          aria-label="Select medicine to add"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Select a medicine…</option>
          {medicines.map((medicine) => (
            <option key={medicine.id} value={medicine.id}>
              {medicine.name} · {medicine.category} · {medicine.dosageForms.join(", ")}
            </option>
          ))}
        </select>
        <button
          disabled={!medicineToAdd || cart.includes(medicineToAdd)}
          onClick={() => { updateCart([...cart, medicineToAdd]); setMedicineToAdd(""); }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Plus size={16} /> Add to cart
        </button>
      </div>

      {cart.length > 0 && (
        <div className="mt-4 grid gap-2">
          {cart.map((id) => {
            const medicine = byId.get(id);
            if (!medicine) return null;
            return (
              <div key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{medicine.name} <span className="text-xs font-normal text-slate-500">· {medicine.brandName}</span></div>
                  <div className="text-xs text-slate-500">{medicine.activeIngredient} · {medicine.category} · {medicine.dosageForms.join(", ")}</div>
                </div>
                <button onClick={() => updateCart(cart.filter((item) => item !== id))} aria-label={`Remove ${medicine.name}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"><X size={15} /></button>
              </div>
            );
          })}
          <button
            disabled={isChecking}
            onClick={() => { void runChecks(); }}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-300"
          >
            {isChecking ? <LoaderCircle size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            {isChecking ? "Checking medicines…" : "Check cart"}
          </button>
        </div>
      )}
      {cart.length === 0 && <div className="mt-4"><EmptyState>Add medicines to start a prescription check.</EmptyState></div>}

      {isChecking && (
        <div role="status" aria-label="Checking medicines" className="mt-5 space-y-3">
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </div>
      )}

      {checks.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${overall ? outcomeStyles[overall] : ""}`}>
            <div className="flex items-center gap-3">
              {overall === "conflict" || overall === "error"
                ? <AlertTriangle size={19} className="animate-pulse" />
                : overall === "caution" ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
              <div>
                <div className="text-sm font-bold">Overall verdict: {overall ? outcomeLabels[overall] : ""}</div>
                <div className="text-xs opacity-80">{overall === "error" ? "Fail-safe block: do not dispense." : "Review each medication result below."}</div>
              </div>
            </div>
            {elapsedMs !== null && <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">{elapsedMs} ms</span>}
          </div>

          <div className="space-y-3">
            {checks.map(({ medicine, result }) => (
              <article key={medicine.id} className={`rounded-xl border p-4 ${outcomeStyles[result.outcome]}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{medicine.name}<span className="ml-2 text-xs font-normal opacity-75">{medicine.category}</span></div>
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-bold tracking-wide">{outcomeLabels[result.outcome]}</span>
                </div>
                <p className="mt-2 text-sm">{result.reason ?? result.notice ?? "No mapped allergy conflict detected."}</p>
                {result.reaction && <p className="mt-1 text-xs opacity-75">Recorded reaction: {result.reaction} · {result.severity} severity</p>}
                {result.outcome === "conflict" && (
                  <button
                    onClick={() => setActiveConflict({ medicine, result })}
                    className="mt-3 rounded-lg border border-red-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-100"
                  >
                    View safe alternatives
                  </button>
                )}
                {result.outcome === "caution" && (
                  <button
                    disabled={acknowledged.includes(medicine.id)}
                    onClick={() => setAcknowledged([...acknowledged, medicine.id])}
                    className="mt-3 rounded-lg border border-amber-400 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-default disabled:opacity-70"
                  >
                    {acknowledged.includes(medicine.id) ? "Caution acknowledged" : "Acknowledge caution"}
                  </button>
                )}
              </article>
            ))}
          </div>

          {checks.some(({ result }) => result.outcome === "conflict") && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <label htmlFor="override-reason" className="mb-1.5 block text-sm font-semibold text-red-900">Clinical override reason (10+ characters required)</label>
              <textarea
                id="override-reason"
                value={overrideText}
                onChange={(event) => setOverrideText(event.target.value)}
                rows={3}
                placeholder="Document the clinical justification…"
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-red-100"
              />
              <div className="mt-1 text-right text-xs text-red-700">{overrideText.trim().length}/10 minimum</div>
            </div>
          )}

          {saveMessage && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{saveMessage}</p>}
          <button
            disabled={!canSave}
            onClick={saveCart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <Pencil size={16} />
            {overall === "conflict" ? "Override & save cart" : "Save prescriptions"}
          </button>
          {!canSave && checks.some(({ result }) => result.outcome === "caution") && (
            <p className="text-center text-xs text-amber-700">Acknowledge every caution before saving.</p>
          )}
        </div>
      )}

      <Modal open={activeConflict !== null} onClose={() => setActiveConflict(null)} variant="conflict">
        {activeConflict && (
          <div>
            <p className="text-sm font-medium text-slate-800">{activeConflict.result.reason}</p>
            <p className="mt-1 text-xs text-slate-500">This drug is blocked unless a doctor documents an override with at least 10 characters.</p>
            <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">Three safe alternatives from other classes</h3>
            <div className="grid gap-2">
              {safeAlternatives(activeConflict).map((alternative) => (
                <div key={alternative.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div>
                    <div className="text-sm font-bold text-emerald-900">{alternative.name}</div>
                    <div className="text-xs text-emerald-800">{alternative.category} · {alternative.activeIngredient} · {alternative.dosageForms.join(", ")}</div>
                  </div>
                  <button onClick={() => replaceWithAlternative(activeConflict, alternative.id)} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800">
                    Use this instead
                  </button>
                </div>
              ))}
              {safeAlternatives(activeConflict).length === 0 && <EmptyState>No safe alternatives from a different class are available.</EmptyState>}
            </div>
            <button onClick={() => setActiveConflict(null)} className="mt-4 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">Review results</button>
          </div>
        )}
      </Modal>
    </section>
  );
}

function PatientHistory({ patient, events }: { patient: Patient; events: ReturnType<typeof useApp>["auditEvents"] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">Patient timeline</h3>
        <p className="text-xs text-slate-500">Checks, prescriptions, overrides, and verification activity for {patient.name}</p>
      </div>
      {events.length === 0 ? (
        <EmptyState>No checks or medication workflow events are recorded for this patient yet.</EmptyState>
      ) : (
        <ol className="relative ml-2 space-y-5 border-l border-slate-200 pl-6">
          {events.map((event) => {
            const Icon = eventIcons[event.action] ?? Activity;
            return (
              <li key={event.id} className="relative">
                <span className="absolute -left-[2.05rem] grid h-8 w-8 place-items-center rounded-full border border-blue-100 bg-blue-50 text-blue-700"><Icon size={15} /></span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-slate-900">{event.action}</span>
                  <span className="text-xs text-slate-500">by {event.user} · {event.role}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{event.result}</p>
                <time className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400"><Clock3 size={12} />{new Date(event.time).toLocaleString()}</time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function MyPrescriptions() {
  const { prescriptions, doctorName } = useApp();
  const mine = useMemo(
    () => prescriptions
      .filter((prescription) => prescription.doctorName === doctorName)
      .sort((a, b) => b.createdAt - a.createdAt),
    [prescriptions, doctorName],
  );
  if (mine.length === 0) return <EmptyState>No prescriptions written yet.</EmptyState>;

  return (
    <div className="grid gap-3">
      {mine.map((prescription) => <PrescriptionCard key={prescription.id} prescription={prescription} />)}
    </div>
  );
}

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{prescription.medicineName}</div>
          <div className="mt-1 text-xs text-slate-500">{prescription.patientName} · {prescription.patientId}</div>
        </div>
        <StatusBadge status={prescription.status} />
      </div>
      {prescription.overrideReason && (
        <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">Override reason: {prescription.overrideReason}</p>
      )}
      <div className="mt-3 text-[11px] text-slate-400">{new Date(prescription.createdAt).toLocaleString()} · by {prescription.doctorName}</div>
    </article>
  );
}

function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <div className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-800 ${large ? "h-16 w-16 text-lg" : "h-11 w-11 text-sm"}`}>
      {initials}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Caution: "bg-amber-50 text-amber-800 border-amber-200",
    Conflict: "bg-red-50 text-red-700 border-red-200",
    Overridden: "bg-amber-50 text-amber-700 border-amber-200",
    Dispensed: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${map[status] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>{status}</span>;
}
