import type { AllergenMap, Allergy, CrossReactivity, Medicine, Patient, ReactionType, Severity } from "./types";

let idc = 0;
const id = (p: string) => `${p}-${++idc}`;
const recordedAt = (daysAgo: number) => Date.now() - daysAgo * 24 * 60 * 60 * 1000;
const allergy = (
  allergen: string,
  severity: Severity,
  verified: boolean,
  reaction: ReactionType,
  daysAgo: number,
): Allergy => ({
  id: id("a"),
  allergen,
  severity,
  verified,
  ...(verified ? { verifiedAt: recordedAt(daysAgo) } : {}),
  reaction,
  recordedAt: recordedAt(daysAgo),
  source: verified ? "seed" : "self-reported",
});

export const seedPatients: Patient[] = [
  {
    id: "P-1001",
    name: "Rafiq",
    age: 42, gender: "Male", bloodGroup: "O+", phone: "+1 (555) 010-1001",
    allergies: [allergy("Penicillin", "Severe", true, "Anaphylaxis", 720)],
  },
  {
    id: "P-1002",
    name: "Nadia",
    age: 35, gender: "Female", bloodGroup: "A+", phone: "+1 (555) 010-1002",
    allergies: [],
  },
  {
    id: "P-1003",
    name: "Imran",
    age: 54, gender: "Male", bloodGroup: "B+", phone: "+1 (555) 010-1003",
    allergies: [allergy("Penicillin", "Moderate", true, "Rash", 365)],
  },
  {
    id: "P-1004",
    name: "Sumaiya",
    age: 29, gender: "Female", bloodGroup: "AB+", phone: "+1 (555) 010-1004",
    allergies: [
      allergy("Penicillin", "Severe", true, "Breathing difficulty", 540),
      allergy("Peanut", "Mild", true, "Swelling", 330),
    ],
  },
  {
    id: "P-1005",
    name: "Jamal",
    age: 61, gender: "Male", bloodGroup: "O-", phone: "+1 (555) 010-1005",
    allergies: [
      allergy("Sulfa", "Moderate", true, "Rash", 460),
      allergy("NSAID", "Severe", true, "Swelling", 220),
    ],
  },
  { id: "P-1006", name: "Mariam", age: 47, gender: "Female", bloodGroup: "A-", phone: "+1 (555) 010-1006", allergies: [allergy("Sulfa", "Mild", false, "Rash", 12)] },
  { id: "P-1007", name: "Daniel", age: 38, gender: "Male", bloodGroup: "B-", phone: "+1 (555) 010-1007", allergies: [allergy("NSAID", "Moderate", true, "Swelling", 190)] },
  { id: "P-1008", name: "Ayesha", age: 26, gender: "Female", bloodGroup: "AB-", phone: "+1 (555) 010-1008", allergies: [allergy("Latex", "Mild", false, "Rash", 4)] },
  { id: "P-1009", name: "Omar", age: 70, gender: "Male", bloodGroup: "O+", phone: "+1 (555) 010-1009", allergies: [allergy("Macrolide", "Moderate", true, "Breathing difficulty", 810)] },
  { id: "P-1010", name: "Priya", age: 33, gender: "Female", bloodGroup: "A+", phone: "+1 (555) 010-1010", allergies: [] },
  { id: "P-1011", name: "Hasan", age: 49, gender: "Male", bloodGroup: "B+", phone: "+1 (555) 010-1011", allergies: [allergy("Aspirin", "Severe", true, "Anaphylaxis", 120)] },
  { id: "P-1012", name: "Leena", age: 57, gender: "Female", bloodGroup: "AB+", phone: "+1 (555) 010-1012", allergies: [allergy("Opioid", "Mild", false, "Swelling", 8)] },
];

const medicine = (name: string, category: string, brandName: string, activeIngredient = name, dosageForms = ["Tablet"]): Medicine => ({
  id: id("m"), name, category, brandName, activeIngredient, dosageForms,
});

export const seedMedicines: Medicine[] = [
  medicine("Amoxicillin", "Penicillin", "Amoxil", "amoxicillin", ["Capsule", "Suspension"]),
  medicine("Ampicillin", "Penicillin", "Principen", "ampicillin", ["Capsule", "Injection"]),
  medicine("Flucloxacillin", "Penicillin", "Floxapen", "flucloxacillin", ["Capsule", "Injection"]),
  medicine("Penicillin V", "Penicillin", "Veetids", "phenoxymethylpenicillin"),
  medicine("Cephalexin", "Cephalosporin", "Keflex", "cephalexin", ["Capsule", "Suspension"]),
  medicine("Cefuroxime", "Cephalosporin", "Ceftin", "cefuroxime", ["Tablet", "Injection"]),
  medicine("Cefixime", "Cephalosporin", "Suprax", "cefixime", ["Tablet", "Suspension"]),
  medicine("Ceftriaxone", "Cephalosporin", "Rocephin", "ceftriaxone", ["Injection"]),
  medicine("Ibuprofen", "NSAID", "Advil", "ibuprofen", ["Tablet", "Suspension"]),
  medicine("Naproxen", "NSAID", "Aleve", "naproxen", ["Tablet"]),
  medicine("Diclofenac", "NSAID", "Voltaren", "diclofenac", ["Tablet", "Gel"]),
  medicine("Aspirin", "Aspirin", "Bayer", "acetylsalicylic acid", ["Tablet"]),
  medicine("Sulfamethoxazole", "Sulfonamide", "Gantanol", "sulfamethoxazole", ["Tablet"]),
  medicine("Trimethoprim-sulfamethoxazole", "Sulfonamide", "Bactrim", "trimethoprim/sulfamethoxazole", ["Tablet", "Suspension"]),
  medicine("Azithromycin", "Macrolide", "Zithromax", "azithromycin", ["Tablet", "Suspension"]),
  medicine("Clarithromycin", "Macrolide", "Biaxin", "clarithromycin", ["Tablet"]),
  medicine("Erythromycin", "Macrolide", "Ery-Tab", "erythromycin", ["Tablet", "Suspension"]),
  medicine("Paracetamol", "Analgesic", "Tylenol", "acetaminophen", ["Tablet", "Suspension"]),
  medicine("Metamizole", "Analgesic", "Novalgin", "metamizole", ["Tablet", "Injection"]),
  medicine("Omeprazole", "PPI", "Prilosec", "omeprazole", ["Capsule"]),
  medicine("Pantoprazole", "PPI", "Protonix", "pantoprazole", ["Tablet", "Injection"]),
  medicine("Atorvastatin", "Statin", "Lipitor", "atorvastatin", ["Tablet"]),
  medicine("Rosuvastatin", "Statin", "Crestor", "rosuvastatin", ["Tablet"]),
  medicine("Cetirizine", "Antihistamine", "Zyrtec", "cetirizine", ["Tablet", "Syrup"]),
  medicine("Loratadine", "Antihistamine", "Claritin", "loratadine", ["Tablet", "Syrup"]),
  medicine("Diphenhydramine", "Antihistamine", "Benadryl", "diphenhydramine", ["Capsule", "Liquid"]),
  medicine("Morphine", "Opioid", "MS Contin", "morphine", ["Tablet", "Injection"]),
  medicine("Codeine", "Opioid", "Codeine Phosphate", "codeine", ["Tablet", "Syrup"]),
  medicine("Tramadol", "Opioid", "Ultram", "tramadol", ["Tablet", "Capsule"]),
  medicine("Aztreonam", "Monobactam", "Azactam", "aztreonam", ["Injection"]),
];

export const seedAllergenMap: AllergenMap[] = [
  { allergen: "Penicillin", category: "Penicillin", relatedCategories: ["Cephalosporin"] },
  { allergen: "Sulfa", category: "Sulfonamide" },
  { allergen: "NSAID", category: "NSAID", relatedCategories: ["Aspirin"] },
  { allergen: "Aspirin", category: "Aspirin", relatedCategories: ["NSAID"] },
  { allergen: "Macrolide", category: "Macrolide" },
  { allergen: "Opioid", category: "Opioid" },
  { allergen: "Latex", category: "none" },
  { allergen: "Peanut", category: "none" },
];

export const crossReactivityTable: CrossReactivity[] = [
  {
    allergen: "Penicillin",
    medicineClass: "Cephalosporin",
    outcome: "caution",
    reason: "Some penicillin-allergic patients may cross-react with cephalosporins; review the reaction history.",
  },
  {
    allergen: "NSAID",
    medicineClass: "Aspirin",
    outcome: "conflict",
    reason: "NSAID hypersensitivity may cross-react with aspirin.",
  },
  {
    allergen: "Aspirin",
    medicineClass: "NSAID",
    outcome: "conflict",
    reason: "Aspirin hypersensitivity may cross-react with NSAIDs.",
  },
];

export const severityOrder: Record<string, number> = { Mild: 1, Moderate: 2, Severe: 3 };
