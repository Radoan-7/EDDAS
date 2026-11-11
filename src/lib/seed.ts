import type { AllergenMap, Medicine, Patient } from "./types";

let idc = 0;
const id = (p: string) => `${p}-${++idc}`;

export const seedPatients: Patient[] = [
  {
    id: "P-1001",
    name: "Rafiq",
    allergies: [
      { id: id("a"), allergen: "Penicillin", severity: "Severe", verified: true, source: "seed" },
    ],
  },
  {
    id: "P-1002",
    name: "Nadia",
    allergies: [],
  },
  {
    id: "P-1003",
    name: "Imran",
    allergies: [
      { id: id("a"), allergen: "Penicillin", severity: "Moderate", verified: true, source: "seed" },
    ],
  },
  {
    id: "P-1004",
    name: "Sumaiya",
    allergies: [
      { id: id("a"), allergen: "Penicillin", severity: "Severe", verified: true, source: "seed" },
      { id: id("a"), allergen: "Peanut", severity: "Mild", verified: true, source: "seed" },
    ],
  },
  {
    id: "P-1005",
    name: "Jamal",
    allergies: [
      { id: id("a"), allergen: "Sulfa", severity: "Moderate", verified: true, source: "seed" },
      { id: id("a"), allergen: "NSAID", severity: "Severe", verified: true, source: "seed" },
    ],
  },
];

export const seedMedicines: Medicine[] = [
  { id: id("m"), name: "Amoxicillin", category: "Penicillin" },
  { id: id("m"), name: "Ampicillin", category: "Penicillin" },
  { id: id("m"), name: "Cephalexin", category: "Cephalosporin" },
  { id: id("m"), name: "Paracetamol", category: "Analgesic" },
  { id: id("m"), name: "Ibuprofen", category: "NSAID" },
  { id: id("m"), name: "Sulfamethoxazole", category: "Sulfonamide" },
  { id: id("m"), name: "Azithromycin", category: "Macrolide" },
];

export const seedAllergenMap: AllergenMap[] = [
  { allergen: "Penicillin", category: "Penicillin" },
  { allergen: "Sulfa", category: "Sulfonamide" },
  { allergen: "NSAID", category: "NSAID" },
  { allergen: "Peanut", category: "none" },
];

export const severityOrder: Record<string, number> = { Mild: 1, Moderate: 2, Severe: 3 };
