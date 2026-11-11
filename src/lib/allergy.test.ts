import { describe, expect, it } from "vitest";
import { checkAllergy } from "./allergy";
import { seedAllergenMap, seedMedicines, seedPatients } from "./seed";

const patient = (id: string) => {
  const found = seedPatients.find((item) => item.id === id);
  if (!found) throw new Error(`Missing test patient: ${id}`);
  return found;
};

const medicine = (name: string) => {
  const found = seedMedicines.find((item) => item.name === name);
  if (!found) throw new Error(`Missing test medicine: ${name}`);
  return found;
};

describe("allergy check acceptance cases", () => {
  it("blocks P-1001 + Amoxicillin as a Penicillin conflict", () => {
    const result = checkAllergy(patient("P-1001"), medicine("Amoxicillin"), seedAllergenMap);
    expect(result.outcome).toBe("conflict");
    expect(result.allergen).toBe("Penicillin");
    expect(result.reason).toContain("Penicillin");
  });

  it("allows P-1001 + Paracetamol", () => {
    expect(checkAllergy(patient("P-1001"), medicine("Paracetamol"), seedAllergenMap).outcome).toBe("safe");
  });

  it("marks P-1002 + Amoxicillin safe with no allergies recorded", () => {
    const result = checkAllergy(patient("P-1002"), medicine("Amoxicillin"), seedAllergenMap);
    expect(result.outcome).toBe("safe");
    expect(result.notice).toBe("No allergies recorded");
  });

  it("blocks P-1003 + Amoxicillin", () => {
    const result = checkAllergy(patient("P-1003"), medicine("Amoxicillin"), seedAllergenMap);
    expect(result.outcome).toBe("conflict");
    expect(result.allergen).toBe("Penicillin");
  });

  it("reports only the Penicillin conflict for P-1004 + Amoxicillin", () => {
    const result = checkAllergy(patient("P-1004"), medicine("Amoxicillin"), seedAllergenMap);
    expect(result.outcome).toBe("conflict");
    expect(result.allergen).toBe("Penicillin");
    expect(result.reason).not.toContain("Peanut");
  });

  it("fails safe and blocks when the checker fails", () => {
    const result = checkAllergy(patient("P-1001"), medicine("Paracetamol"), seedAllergenMap, true);
    expect(result.outcome).toBe("error");
    expect(result.notice).toMatch(/blocked for safety/i);
  });
});
