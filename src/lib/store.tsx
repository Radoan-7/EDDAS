import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AllergenMap, Allergy, AppNotification, AppUser, AuditEvent, CheckOutcome, Medicine, Patient, Prescription, RecentCheck, Role } from "./types";
import { seedAllergenMap, seedMedicines, seedPatients } from "./seed";
import { seedAuditEvents, seedPrescriptions, seedUsers } from "./seedHistory";

const STORAGE_KEY = "edaas-state-v1";

interface PersistedState {
  patients: Patient[];
  medicines: Medicine[];
  allergenMap: AllergenMap[];
  prescriptions: Prescription[];
  auditEvents: AuditEvent[];
  users: AppUser[];
  notifications: AppNotification[];
  recentChecks: RecentCheck[];
  deletedMedicineNames: string[];
  deletedAllergenNames: string[];
  simulateFailure: boolean;
}

interface AppContextValue extends PersistedState {
  role: Role | null;
  doctorName: string;
  darkMode: boolean;
  login: (role: Role, name: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;

  verifyAllergy: (patientId: string, allergyId: string, verifiedBy: string) => void;
  addAllergy: (patientId: string, allergen: string, severity: "Mild" | "Moderate" | "Severe", reaction?: Allergy["reaction"]) => boolean;
  updateAllergy: (patientId: string, allergyId: string, updates: Partial<Pick<Allergy, "allergen" | "severity" | "reaction">>) => boolean;
  deleteAllergy: (patientId: string, allergyId: string) => void;
  addMedicine: (name: string, category: string, brandName?: string, activeIngredient?: string, dosageForms?: string[]) => boolean;
  updateMedicine: (medicine: Medicine) => boolean;
  deleteMedicine: (medicineId: string) => void;
  updateAllergenMap: (allergen: string, category: string | "none") => void;
  deleteAllergenMap: (allergen: string) => void;
  addUser: (name: string, role: Role) => boolean;
  updateUser: (userId: string, updates: Partial<Pick<AppUser, "name" | "role" | "active">>) => boolean;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  setSimulateFailure: (on: boolean) => void;
  resetDemo: () => void;

  savePrescription: (p: Omit<Prescription, "id" | "createdAt">) => void;
  dispensePrescription: (id: string) => void;
  recordCheck: (result: string, patientId?: string, medicineName?: string, outcome?: CheckOutcome) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: PersistedState = {
  patients: seedPatients,
  medicines: seedMedicines,
  allergenMap: seedAllergenMap,
  prescriptions: seedPrescriptions,
  auditEvents: seedAuditEvents,
  users: seedUsers,
  notifications: [],
  recentChecks: seedAuditEvents.filter((event) => event.action === "Check").slice(-10).reverse().map((event, index) => {
    const patientId = event.patientId ?? "P-1001";
    return {
      id: `recent-seed-${index}`,
      patientId,
      patientName: seedPatients.find((patient) => patient.id === patientId)?.name ?? patientId,
      medicineName: event.result.includes("—")
        ? event.result.split("—")[event.result.split("—").length - 1].trim()
        : event.result.split(":").slice(1).join(":").trim() || "Medication",
      outcome: event.result.toLowerCase().startsWith("conflict") ? "conflict" : "safe",
      allergen: event.result.split(":")[1]?.split("—")[0]?.trim(),
      checkedBy: event.user,
      time: event.time,
    };
  }),
  deletedMedicineNames: [],
  deletedAllergenNames: [],
  simulateFailure: false,
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const storedPatients = parsed.patients ?? [];
    const patients = [
      ...seedPatients.map((seed) => {
      const stored = storedPatients.find((patient) => patient.id === seed.id);
      if (!stored) return seed;
      return {
        ...seed,
        ...stored,
        allergies: stored.allergies.map((allergy, index) => {
          const seededAllergy = seed.allergies.find((candidate) => candidate.id === allergy.id)
            ?? seed.allergies[index];
          return {
            ...seededAllergy,
            ...allergy,
            reaction: allergy.reaction ?? seededAllergy?.reaction ?? "Rash",
            recordedAt: allergy.recordedAt ?? seededAllergy?.recordedAt ?? Date.now(),
          };
        }),
      };
      }),
      ...storedPatients
        .filter((patient) => !seedPatients.some((seed) => seed.id === patient.id))
        .map((patient) => ({
          ...patient,
          age: patient.age ?? 0,
          gender: patient.gender ?? "Other",
          bloodGroup: patient.bloodGroup ?? "Unknown",
          phone: patient.phone ?? "Not provided",
          allergies: patient.allergies.map((allergy) => ({
            ...allergy,
            reaction: allergy.reaction ?? "Rash",
            recordedAt: allergy.recordedAt ?? Date.now(),
          })),
        })),
    ];
    const deletedMedicineNames = parsed.deletedMedicineNames ?? [];
    const deletedAllergenNames = parsed.deletedAllergenNames ?? [];
    const medicines = [
      ...seedMedicines.filter((seed) => !deletedMedicineNames.includes(seed.name.toLowerCase())).map((seed) => {
        const stored = (parsed.medicines ?? []).find((medicine) => medicine.name.toLowerCase() === seed.name.toLowerCase());
        return {
          ...seed,
          ...stored,
          brandName: stored?.brandName ?? seed.brandName,
          activeIngredient: stored?.activeIngredient ?? seed.activeIngredient,
          dosageForms: stored?.dosageForms ?? seed.dosageForms,
        };
      }),
      ...(parsed.medicines ?? []).filter((medicine) => !seedMedicines.some((seed) => seed.name.toLowerCase() === medicine.name.toLowerCase()))
        .map((medicine) => ({
          ...medicine,
          brandName: medicine.brandName ?? medicine.name,
          activeIngredient: medicine.activeIngredient ?? medicine.name,
          dosageForms: medicine.dosageForms ?? ["Tablet"],
        })),
    ];
    const allergenMap = [
      ...seedAllergenMap.filter((seed) => !deletedAllergenNames.includes(seed.allergen.toLowerCase())).map((seed) => {
        const stored = (parsed.allergenMap ?? []).find((entry) => entry.allergen.toLowerCase() === seed.allergen.toLowerCase());
        return stored ? { ...seed, ...stored } : seed;
      }),
      ...(parsed.allergenMap ?? []).filter((entry) => !seedAllergenMap.some((seed) => seed.allergen.toLowerCase() === entry.allergen.toLowerCase())),
    ];
    return {
      patients,
      medicines,
      allergenMap,
      prescriptions: parsed.prescriptions
        ? [...seedPrescriptions.filter((seed) => !parsed.prescriptions?.some((prescription) => prescription.id === seed.id)), ...parsed.prescriptions]
        : seedPrescriptions,
      auditEvents: parsed.auditEvents
        ? [...seedAuditEvents.filter((seed) => !parsed.auditEvents?.some((event) => event.id === seed.id)), ...parsed.auditEvents]
        : seedAuditEvents,
      users: parsed.users ?? seedUsers,
      notifications: parsed.notifications ?? [],
      recentChecks: parsed.recentChecks?.length ? parsed.recentChecks : initialState.recentChecks,
      deletedMedicineNames,
      deletedAllergenNames,
      simulateFailure: parsed.simulateFailure ?? false,
    };
  } catch {
    return initialState;
  }
}

let idCounter = 0;
const uid = (p: string) => `${p}-${Date.now()}-${++idCounter}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);
  const [role, setRole] = useState<Role | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("edaas-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  const appendAuditEvent = useCallback((action: AuditEvent["action"], result: string, patientId?: string) => {
    if (!role) return;
    const time = Date.now();
    const kind: AppNotification["kind"] | null = action === "Override" ? "override"
      : action === "Report" && !result.toLowerCase().includes("deleted self-reported") ? "verification"
        : action === "Check" && result.toLowerCase().startsWith("conflict") ? "conflict"
          : null;
    setState((s) => ({
      ...s,
      auditEvents: [
        ...s.auditEvents,
        {
          id: uid("audit"),
          user: doctorName || role,
          role,
          action,
          result,
          time,
          patientId,
        },
      ],
      notifications: kind ? [
        {
          id: uid("notification"),
          kind,
          message: kind === "verification" ? `Patient self-report awaiting verification: ${result}` : result,
          time,
          read: false,
        },
        ...s.notifications,
      ].slice(0, 100) : s.notifications,
    }));
  }, [role, doctorName]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("edaas-dark-mode", String(darkMode));
    } catch {
      // Theme still applies for the current session when storage is unavailable.
    }
  }, [darkMode]);

  const login = useCallback((r: Role, name: string) => {
    const normalizedName = name.trim();
    const matched = state.users.find((user) => user.name.toLowerCase() === normalizedName.toLowerCase());
    if (!matched || !matched.active || matched.role !== r) return false;
    const time = Date.now();
    setState((s) => ({
      ...s,
      users: s.users.map((item) => item.id === matched.id ? { ...item, lastLogin: time } : item),
      auditEvents: [...s.auditEvents, {
        id: uid("audit"),
        user: normalizedName,
        role: r,
        action: "Login",
        result: "Successful login",
        time,
      }],
    }));
    setRole(r);
    setDoctorName(normalizedName);
    return true;
  }, [state.users]);

  const logout = useCallback(() => {
    setRole(null);
    setDoctorName("");
  }, []);

  const toggleDarkMode = useCallback(() => setDarkMode((current) => !current), []);

  const verifyAllergy = useCallback((patientId: string, allergyId: string, verifiedBy: string) => {
    const patient = state.patients.find((p) => p.id === patientId);
    const allergy = patient?.allergies.find((a) => a.id === allergyId);
    if (!patient || !allergy || allergy.verified) return;
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              allergies: p.allergies.map((a) =>
                a.id === allergyId ? { ...a, verified: true, verifiedBy: verifiedBy.trim() || "Doctor", verifiedAt: Date.now() } : a,
              ),
            }
          : p,
      ),
    }));
    const verifier = verifiedBy.trim() || "Doctor";
    const verifierLabel = verifier.startsWith("Dr. ") ? verifier : `Dr. ${verifier}`;
    appendAuditEvent("Verify", `${patient.name}: ${allergy.allergen} verified by ${verifierLabel}`, patientId);
  }, [state.patients, appendAuditEvent]);

  const addAllergy = useCallback(
    (patientId: string, allergen: string, severity: "Mild" | "Moderate" | "Severe", reaction: Allergy["reaction"] = "Rash") => {
      const trimmed = allergen.trim();
      if (!trimmed || !state.patients.some((patient) => patient.id === patientId)) return false;
      setState((s) => ({
        ...s,
        patients: s.patients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                allergies: [
                  ...p.allergies,
                  {
                    id: uid("a"),
                    allergen: trimmed,
                    severity,
                    verified: false,
                    reaction,
                    recordedAt: Date.now(),
                    source: "self-reported",
                  },
                ],
              }
            : p,
        ),
      }));
      const patient = state.patients.find((item) => item.id === patientId);
      if (role === "Patient") appendAuditEvent("Report", `${patient?.name ?? patientId} self-reported ${trimmed} allergy`, patientId);
      return true;
    },
    [state.patients, role, appendAuditEvent],
  );

  const updateAllergy = useCallback((patientId: string, allergyId: string, updates: Partial<Pick<Allergy, "allergen" | "severity" | "reaction">>) => {
    const patient = state.patients.find((item) => item.id === patientId);
    const allergy = patient?.allergies.find((item) => item.id === allergyId);
    if (!patient || !allergy || allergy.verified || allergy.source !== "self-reported") return false;
    const allergen = updates.allergen?.trim();
    if (updates.allergen !== undefined && !allergen) return false;
    setState((s) => ({
      ...s,
      patients: s.patients.map((item) => item.id === patientId
        ? { ...item, allergies: item.allergies.map((entry) => entry.id === allergyId ? { ...entry, ...updates, ...(allergen ? { allergen } : {}) } : entry) }
        : item),
    }));
    if (role === "Patient") appendAuditEvent("Report", `${patient.name}: edited self-reported ${allergy.allergen} allergy`, patientId);
    return true;
  }, [state.patients, role, appendAuditEvent]);

  const deleteAllergy = useCallback((patientId: string, allergyId: string) => {
    const allergy = state.patients.find((item) => item.id === patientId)?.allergies.find((item) => item.id === allergyId);
    if (!allergy || allergy.verified || allergy.source !== "self-reported") return;
    setState((s) => ({
      ...s,
      patients: s.patients.map((item) => item.id === patientId
        ? { ...item, allergies: item.allergies.filter((entry) => entry.id !== allergyId) }
        : item),
    }));
    const patient = state.patients.find((item) => item.id === patientId);
    if (role === "Patient") appendAuditEvent("Report", `${patient?.name ?? patientId}: deleted self-reported ${allergy.allergen} allergy`, patientId);
  }, [state.patients, role, appendAuditEvent]);

  const addMedicine = useCallback((name: string, category: string, brandName = name, activeIngredient = name, dosageForms = ["Tablet"]) => {
    const n = name.trim();
    const c = category.trim();
    if (!n || !c || dosageForms.filter((form) => form.trim()).length === 0 || state.medicines.some((item) => item.name.toLowerCase() === n.toLowerCase())) return false;
    setState((s) => ({
      ...s,
      deletedMedicineNames: s.deletedMedicineNames.filter((name) => name !== n.toLowerCase()),
      medicines: [...s.medicines, {
        id: uid("m"),
        name: n,
        category: c,
        brandName: brandName.trim() || n,
        activeIngredient: activeIngredient.trim() || n,
        dosageForms: dosageForms.filter((form) => form.trim()).map((form) => form.trim()),
      }],
    }));
    appendAuditEvent("Admin edit", `Added medicine ${n} (${c})`);
    return true;
  }, [state.medicines, appendAuditEvent]);

  const updateMedicine = useCallback((medicine: Medicine) => {
    if (!medicine.name.trim() || !medicine.category.trim() || !medicine.activeIngredient.trim() || medicine.dosageForms.length === 0) return false;
    if (state.medicines.some((item) => item.id !== medicine.id && item.name.toLowerCase() === medicine.name.trim().toLowerCase())) return false;
    const previous = state.medicines.find((item) => item.id === medicine.id);
    setState((s) => ({
      ...s,
      medicines: s.medicines.map((item) => item.id === medicine.id ? { ...medicine, name: medicine.name.trim(), category: medicine.category.trim() } : item),
      deletedMedicineNames: previous && previous.name.toLowerCase() !== medicine.name.trim().toLowerCase()
        && seedMedicines.some((item) => item.name.toLowerCase() === previous.name.toLowerCase())
        ? [...new Set([...s.deletedMedicineNames, previous.name.toLowerCase()])].filter((name) => name !== medicine.name.trim().toLowerCase())
        : s.deletedMedicineNames.filter((name) => name !== medicine.name.trim().toLowerCase()),
    }));
    appendAuditEvent("Admin edit", `Edited medicine ${medicine.name}`);
    return true;
  }, [state.medicines, appendAuditEvent]);

  const deleteMedicine = useCallback((medicineId: string) => {
    const medicine = state.medicines.find((item) => item.id === medicineId);
    if (!medicine) return;
    setState((s) => ({
      ...s,
      medicines: s.medicines.filter((item) => item.id !== medicineId),
      deletedMedicineNames: [...new Set([...s.deletedMedicineNames, medicine.name.toLowerCase()])],
    }));
    appendAuditEvent("Admin edit", `Deleted medicine ${medicine.name}`);
  }, [state.medicines, appendAuditEvent]);

  const updateAllergenMap = useCallback((allergen: string, category: string | "none") => {
    const a = allergen.trim();
    const c = String(category).trim();
    const normalizedCategory = c.toLowerCase() === "none"
      ? "none"
      : state.medicines.find((medicine) => medicine.category.toLowerCase() === c.toLowerCase())?.category;
    if (!a || !normalizedCategory) return;
    setState((s) => {
      const exists = s.allergenMap.some((m) => m.allergen.toLowerCase() === a.toLowerCase());
      const next = exists
        ? s.allergenMap.map((m) => (m.allergen.toLowerCase() === a.toLowerCase() ? { ...m, category: normalizedCategory } : m))
        : [...s.allergenMap, { allergen: a, category: normalizedCategory }];
      return { ...s, allergenMap: next, deletedAllergenNames: s.deletedAllergenNames.filter((name) => name !== a.toLowerCase()) };
    });
    appendAuditEvent("Admin edit", `Updated allergen mapping ${a} → ${normalizedCategory}`);
  }, [state.medicines, appendAuditEvent]);

  const deleteAllergenMap = useCallback((allergen: string) => {
    setState((s) => ({
      ...s,
      allergenMap: s.allergenMap.filter((entry) => entry.allergen.toLowerCase() !== allergen.toLowerCase()),
      deletedAllergenNames: [...new Set([...s.deletedAllergenNames, allergen.toLowerCase()])],
    }));
    appendAuditEvent("Admin edit", `Deleted allergen mapping ${allergen}`);
  }, [appendAuditEvent]);

  const addUser = useCallback((name: string, userRole: Role) => {
    const trimmed = name.trim();
    if (role !== "Admin" || !trimmed || state.users.some((user) => user.name.toLowerCase() === trimmed.toLowerCase())) return false;
    setState((s) => ({ ...s, users: [...s.users, { id: uid("user"), name: trimmed, role: userRole, active: true }] }));
    appendAuditEvent("Admin edit", `Added ${userRole} user ${trimmed}`);
    return true;
  }, [role, state.users, appendAuditEvent]);

  const updateUser = useCallback((userId: string, updates: Partial<Pick<AppUser, "name" | "role" | "active">>) => {
    const user = state.users.find((item) => item.id === userId);
    const name = updates.name?.trim();
    if (role !== "Admin" || !user || (updates.name !== undefined && !name)) return false;
    const removingLastAdmin = user.role === "Admin" && user.active
      && state.users.filter((item) => item.role === "Admin" && item.active).length === 1
      && (updates.active === false || (updates.role !== undefined && updates.role !== "Admin"));
    if (removingLastAdmin) return false;
    if (name && state.users.some((item) => item.id !== userId && item.name.toLowerCase() === name.toLowerCase())) return false;
    setState((s) => ({ ...s, users: s.users.map((item) => item.id === userId ? { ...item, ...updates, ...(name ? { name } : {}) } : item) }));
    appendAuditEvent("Admin edit", `Updated user ${name ?? user.name}`);
    return true;
  }, [role, state.users, appendAuditEvent]);

  const markNotificationRead = useCallback((notificationId: string) => {
    setState((s) => ({ ...s, notifications: s.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item) }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((item) => ({ ...item, read: true })) }));
  }, []);

  const recordCheck = useCallback((result: string, patientId?: string, medicineName?: string, checkOutcome?: CheckOutcome) => {
    appendAuditEvent("Check", result, patientId);
    if (!patientId || !medicineName) return;
    const patient = state.patients.find((item) => item.id === patientId);
    const outcome = checkOutcome ?? (result.toLowerCase().startsWith("conflict") ? "conflict"
      : result.toLowerCase().startsWith("caution") ? "caution"
        : result.toLowerCase().startsWith("blocked") ? "error" : "safe");
    const allergen = result.match(/(?:Conflict|Caution):\s*([^—-]+)/i)?.[1]?.trim();
    setState((s) => ({
      ...s,
      recentChecks: [{
        id: uid("check"),
        patientId,
        patientName: patient?.name ?? patientId,
        medicineName,
        outcome,
        allergen,
        checkedBy: doctorName || role || "Staff",
        time: Date.now(),
      }, ...s.recentChecks].slice(0, 20),
    }));
  }, [appendAuditEvent, state.patients, doctorName, role]);

  const setSimulateFailure = useCallback((on: boolean) => {
    setState((s) => ({ ...s, simulateFailure: on }));
    if (role === "Admin") appendAuditEvent("Admin edit", `Failure simulation ${on ? "enabled" : "disabled"}`);
  }, [role, appendAuditEvent]);

  const resetDemo = useCallback(() => {
    const event: AuditEvent = {
      id: uid("audit"),
      user: doctorName || "Admin",
      role: role ?? "Admin",
      action: "Admin edit",
      result: "Reset demo data",
      time: Date.now(),
    };
    setState((s) => ({ ...initialState, auditEvents: [...s.auditEvents, event], simulateFailure: false }));
  }, [doctorName, role]);

  const savePrescription = useCallback((p: Omit<Prescription, "id" | "createdAt">) => {
    appendAuditEvent("Prescription", `${p.patientName}: ${p.medicineName} — ${p.status}`, p.patientId);
    if (p.status === "Overridden") {
      appendAuditEvent("Override", `${p.patientName}: ${p.medicineName}${p.overrideReason ? ` — ${p.overrideReason}` : ""}`, p.patientId);
    }
    setState((s) => ({
      ...s,
      prescriptions: [...s.prescriptions, { ...p, id: uid("rx"), createdAt: Date.now() }],
    }));
  }, [appendAuditEvent]);

  const dispensePrescription = useCallback((id: string) => {
    const prescription = state.prescriptions.find((rx) => rx.id === id);
    if (!prescription || prescription.status === "Conflict" || prescription.status === "Dispensed") return;
    const time = Date.now();
    setState((s) => ({
      ...s,
      prescriptions: s.prescriptions.map((rx) =>
        rx.id === id ? { ...rx, status: "Dispensed", dispensedAt: time } : rx,
      ),
    }));
    appendAuditEvent("Dispense", `${prescription.patientName}: ${prescription.medicineName}`, prescription.patientId);
  }, [state.prescriptions, appendAuditEvent]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      role,
      doctorName,
      darkMode,
      login,
      logout,
      toggleDarkMode,
      verifyAllergy,
      addAllergy,
      updateAllergy,
      deleteAllergy,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      updateAllergenMap,
      deleteAllergenMap,
      addUser,
      updateUser,
      markNotificationRead,
      markAllNotificationsRead,
      setSimulateFailure,
      resetDemo,
      savePrescription,
      dispensePrescription,
      recordCheck,
    }),
    [state, role, doctorName, darkMode, login, logout, toggleDarkMode, verifyAllergy, addAllergy, updateAllergy, deleteAllergy, addMedicine, updateMedicine, deleteMedicine, updateAllergenMap, deleteAllergenMap, addUser, updateUser, markNotificationRead, markAllNotificationsRead, setSimulateFailure, resetDemo, savePrescription, dispensePrescription, recordCheck],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
