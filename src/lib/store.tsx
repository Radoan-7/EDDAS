import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AllergenMap, Medicine, Patient, Prescription, Role } from "./types";
import { seedAllergenMap, seedMedicines, seedPatients } from "./seed";

const STORAGE_KEY = "edaas-state-v1";

interface PersistedState {
  patients: Patient[];
  medicines: Medicine[];
  allergenMap: AllergenMap[];
  prescriptions: Prescription[];
  simulateFailure: boolean;
}

interface AppContextValue extends PersistedState {
  role: Role | null;
  doctorName: string;
  login: (role: Role, name: string) => void;
  logout: () => void;

  verifyAllergy: (patientId: string, allergyId: string) => void;
  addAllergy: (patientId: string, allergen: string, severity: "Mild" | "Moderate" | "Severe") => boolean;
  addMedicine: (name: string, category: string) => void;
  updateAllergenMap: (allergen: string, category: string | "none") => void;
  setSimulateFailure: (on: boolean) => void;
  resetDemo: () => void;

  savePrescription: (p: Omit<Prescription, "id" | "createdAt">) => void;
  dispensePrescription: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: PersistedState = {
  patients: seedPatients,
  medicines: seedMedicines,
  allergenMap: seedAllergenMap,
  prescriptions: [],
  simulateFailure: false,
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      patients: parsed.patients ?? seedPatients,
      medicines: parsed.medicines ?? seedMedicines,
      allergenMap: parsed.allergenMap ?? seedAllergenMap,
      prescriptions: parsed.prescriptions ?? [],
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const login = useCallback((r: Role, name: string) => {
    setRole(r);
    setDoctorName(name);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setDoctorName("");
  }, []);

  const verifyAllergy = useCallback((patientId: string, allergyId: string) => {
    setState((s) => ({
      ...s,
      patients: s.patients.map((p) =>
        p.id === patientId
          ? { ...p, allergies: p.allergies.map((a) => (a.id === allergyId ? { ...a, verified: true } : a)) }
          : p,
      ),
    }));
  }, []);

  const addAllergy = useCallback(
    (patientId: string, allergen: string, severity: "Mild" | "Moderate" | "Severe") => {
      const trimmed = allergen.trim();
      if (!trimmed) return false;
      setState((s) => ({
        ...s,
        patients: s.patients.map((p) =>
          p.id === patientId
            ? {
                ...p,
                allergies: [
                  ...p.allergies,
                  { id: uid("a"), allergen: trimmed, severity, verified: false, source: "self-reported" },
                ],
              }
            : p,
        ),
      }));
      return true;
    },
    [],
  );

  const addMedicine = useCallback((name: string, category: string) => {
    const n = name.trim();
    const c = category.trim();
    if (!n || !c) return;
    setState((s) => ({ ...s, medicines: [...s.medicines, { id: uid("m"), name: n, category: c }] }));
  }, []);

  const updateAllergenMap = useCallback((allergen: string, category: string | "none") => {
    const a = allergen.trim();
    if (!a) return;
    setState((s) => {
      const exists = s.allergenMap.some((m) => m.allergen.toLowerCase() === a.toLowerCase());
      const next = exists
        ? s.allergenMap.map((m) => (m.allergen.toLowerCase() === a.toLowerCase() ? { ...m, category } : m))
        : [...s.allergenMap, { allergen: a, category }];
      return { ...s, allergenMap: next };
    });
  }, []);

  const setSimulateFailure = useCallback((on: boolean) => {
    setState((s) => ({ ...s, simulateFailure: on }));
  }, []);

  const resetDemo = useCallback(() => {
    setState({ ...initialState, prescriptions: [], simulateFailure: false });
  }, []);

  const savePrescription = useCallback((p: Omit<Prescription, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      prescriptions: [...s.prescriptions, { ...p, id: uid("rx"), createdAt: Date.now() }],
    }));
  }, []);

  const dispensePrescription = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      prescriptions: s.prescriptions.map((rx) =>
        rx.id === id ? { ...rx, status: "Dispensed", dispensedAt: Date.now() } : rx,
      ),
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      role,
      doctorName,
      login,
      logout,
      verifyAllergy,
      addAllergy,
      addMedicine,
      updateAllergenMap,
      setSimulateFailure,
      resetDemo,
      savePrescription,
      dispensePrescription,
    }),
    [state, role, doctorName, login, logout, verifyAllergy, addAllergy, addMedicine, updateAllergenMap, setSimulateFailure, resetDemo, savePrescription, dispensePrescription],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
