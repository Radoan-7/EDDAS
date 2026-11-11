export type Role = "Doctor" | "Nurse" | "Pharmacist" | "Patient" | "Admin";

export type Severity = "Mild" | "Moderate" | "Severe";

export interface Allergy {
  id: string;
  allergen: string; // e.g. "Penicillin", "Sulfa", "Peanut"
  severity: Severity;
  verified: boolean;
  source: "seed" | "self-reported";
}

export interface Patient {
  id: string; // P-1001
  name: string;
  allergies: Allergy[];
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
}

export interface AllergenMap {
  allergen: string;
  category: string | "none";
}

export type PrescriptionStatus = "Safe" | "Conflict" | "Overridden" | "Dispensed";

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  status: PrescriptionStatus;
  conflictAllergen?: string;
  severity?: Severity;
  doctorName: string;
  createdAt: number;
  overrideReason?: string;
  overriddenAt?: number;
  dispensedAt?: number;
}

export interface AllergyResult {
  outcome: "conflict" | "safe" | "error";
  allergen?: string;
  medicine?: string;
  severity?: Severity;
  notice?: string;
}
