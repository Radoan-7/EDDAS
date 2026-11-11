export type Role = "Doctor" | "Nurse" | "Pharmacist" | "Patient" | "Admin";

export type Severity = "Mild" | "Moderate" | "Severe";
export type ReactionType = "Rash" | "Swelling" | "Anaphylaxis" | "Breathing difficulty";
export type CheckOutcome = "conflict" | "caution" | "safe" | "error";

export interface Allergy {
  id: string;
  allergen: string; // e.g. "Penicillin", "Sulfa", "Peanut"
  severity: Severity;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  reaction: ReactionType;
  recordedAt: number;
  source: "seed" | "self-reported";
}

export interface Patient {
  id: string; // P-1001
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  bloodGroup: string;
  phone: string;
  allergies: Allergy[];
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  brandName: string;
  activeIngredient: string;
  dosageForms: string[];
}

export interface AllergenMap {
  allergen: string;
  category: string | "none";
  relatedCategories?: string[];
}

export interface CrossReactivity {
  allergen: string;
  medicineClass: string;
  outcome: "caution" | "conflict";
  reason: string;
}

export type PrescriptionStatus = "Safe" | "Caution" | "Conflict" | "Overridden" | "Dispensed";

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  status: PrescriptionStatus;
  conflictAllergen?: string;
  conflictReason?: string;
  severity?: Severity;
  doctorName: string;
  createdAt: number;
  overrideReason?: string;
  overriddenAt?: number;
  dispensedAt?: number;
}

export interface AuditEvent {
  id: string;
  user: string;
  role: Role;
  action: "Login" | "Check" | "Prescription" | "Override" | "Verify" | "Dispense" | "Admin edit" | "Report";
  result: string;
  time: number;
  patientId?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  lastLogin?: number;
}

export interface AppNotification {
  id: string;
  kind: "conflict" | "override" | "verification";
  message: string;
  time: number;
  read: boolean;
}

export interface RecentCheck {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  outcome: CheckOutcome;
  allergen?: string;
  checkedBy: string;
  time: number;
}

export interface AllergyResult {
  outcome: CheckOutcome;
  allergen?: string;
  medicine?: string;
  severity?: Severity;
  notice?: string;
  reason?: string;
  reaction?: ReactionType;
  crossReactivity?: boolean;
  elapsedMs?: number;
}

export interface DrugCheckResult {
  medicine: Medicine;
  result: AllergyResult;
}
