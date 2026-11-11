import type { AllergenMap, AllergyResult, Medicine, Patient, Severity } from "./types";
import { severityOrder } from "./seed";

// Build allergen->category lookup, case-insensitive by allergen name
function categoryForAllergen(allergen: string, map: AllergenMap[]): string | "none" | undefined {
  const entry = map.find((m) => m.allergen.toLowerCase() === allergen.toLowerCase());
  return entry?.category;
}

export function checkAllergy(
  patient: Patient,
  medicine: Medicine,
  allergenMap: AllergenMap[],
  simulateFailure = false,
): AllergyResult {
  if (simulateFailure) {
    return { outcome: "error", notice: "Check failed – drug blocked for safety" };
  }
  if (!patient || !medicine) {
    return { outcome: "error", notice: "Check failed – drug blocked for safety" };
  }

  const allergies = patient.allergies ?? [];
  if (allergies.length === 0) {
    return { outcome: "safe", notice: "No allergies recorded" };
  }

  // Find the highest-severity matching allergen.
  let worst: { allergen: string; severity: Severity } | null = null;
  for (const allergy of allergies) {
    const cat = categoryForAllergen(allergy.allergen, allergenMap);
    if (cat && cat !== "none" && cat.toLowerCase() === medicine.category.toLowerCase()) {
      if (!worst || severityOrder[allergy.severity] > severityOrder[worst.severity]) {
        worst = { allergen: allergy.allergen, severity: allergy.severity };
      }
    }
  }

  if (worst) {
    return {
      outcome: "conflict",
      allergen: worst.allergen,
      medicine: medicine.name,
      severity: worst.severity,
    };
  }

  return { outcome: "safe" };
}
