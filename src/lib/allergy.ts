import type { AllergenMap, AllergyResult, CrossReactivity, Medicine, Patient, Severity } from "./types";
import { crossReactivityTable, severityOrder } from "./seed";

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
  crossReactivity: CrossReactivity[] = crossReactivityTable,
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
  let worst: { allergen: string; severity: Severity; reaction: Patient["allergies"][number]["reaction"] } | null = null;
  let caution: { allergen: string; severity: Severity; reaction: Patient["allergies"][number]["reaction"]; reason: string } | null = null;
  for (const allergy of allergies) {
    const cat = categoryForAllergen(allergy.allergen, allergenMap);
    if (cat && cat !== "none" && cat.toLowerCase() === medicine.category.toLowerCase()) {
      if (!worst || severityOrder[allergy.severity] > severityOrder[worst.severity]) {
        worst = { allergen: allergy.allergen, severity: allergy.severity, reaction: allergy.reaction };
      }
      continue;
    }

    const cross = crossReactivity.find(
      (entry) => entry.allergen.toLowerCase() === allergy.allergen.toLowerCase()
        && entry.medicineClass.toLowerCase() === medicine.category.toLowerCase(),
    );
    if (cross?.outcome === "conflict") {
      if (!worst || severityOrder[allergy.severity] > severityOrder[worst.severity]) {
        worst = { allergen: allergy.allergen, severity: allergy.severity, reaction: allergy.reaction };
      }
    } else if (cross?.outcome === "caution") {
      if (!caution || severityOrder[allergy.severity] > severityOrder[caution.severity]) {
        caution = { allergen: allergy.allergen, severity: allergy.severity, reaction: allergy.reaction, reason: cross.reason };
      }
    }
  }

  if (worst) {
    const mappedCategory = categoryForAllergen(worst.allergen, allergenMap);
    const exactMatch = mappedCategory?.toLowerCase() === medicine.category.toLowerCase();
    const cross = crossReactivity.find(
      (entry) => entry.allergen.toLowerCase() === worst?.allergen.toLowerCase()
        && entry.medicineClass.toLowerCase() === medicine.category.toLowerCase(),
    );
    return {
      outcome: "conflict",
      allergen: worst.allergen,
      medicine: medicine.name,
      severity: worst.severity,
      reaction: worst.reaction,
      crossReactivity: !exactMatch,
      reason: exactMatch
        ? `Patient allergic to ${worst.allergen} → ${medicine.name} is a ${medicine.category}-class drug.`
        : cross?.reason ?? `${worst.allergen} allergy may cross-react with ${medicine.category}.`,
    };
  }

  if (caution) {
    return {
      outcome: "caution",
      allergen: caution.allergen,
      medicine: medicine.name,
      severity: caution.severity,
      reaction: caution.reaction,
      crossReactivity: true,
      reason: caution.reason,
    };
  }

  return { outcome: "safe" };
}
