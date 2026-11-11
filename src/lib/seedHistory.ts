import type { AppUser, AuditEvent, Prescription, Role } from "./types";
import { seedPatients } from "./seed";

export const seedUsers: AppUser[] = [
  { id: "user-admin", name: "System Admin", role: "Admin", active: true },
  { id: "user-doctor", name: "Dr. Ahmed", role: "Doctor", active: true },
  { id: "user-nurse", name: "Nurse Amina", role: "Nurse", active: true },
  { id: "user-pharmacist", name: "Pharmacist Lee", role: "Pharmacist", active: true },
  { id: "user-patient", name: "Rafiq", role: "Patient", active: true },
];

const demoEvents: { user: string; role: Role; action: AuditEvent["action"]; result: string; patientId?: string }[][] = [
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1001" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Nadia: Paracetamol", patientId: "P-1002" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Override", result: "Imran: Amoxicillin — reviewed case", patientId: "P-1003" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Prescription", result: "Nadia: Paracetamol — Safe", patientId: "P-1002" },
    { user: "Nurse Amina", role: "Nurse", action: "Verify", result: "Mariam: Sulfa verified", patientId: "P-1006" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Omeprazole", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1004" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Priya: Cetirizine", patientId: "P-1010" },
    { user: "System Admin", role: "Admin", action: "Admin edit", result: "Updated drug class mapping" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Prescription", result: "Rafiq: Azithromycin — Safe", patientId: "P-1001" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: NSAID — Aspirin", patientId: "P-1005" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1003" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Mariam: Cetirizine", patientId: "P-1006" },
    { user: "Rafiq", role: "Patient", action: "Report", result: "Self-reported Peanut allergy", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Verify", result: "Rafiq: Peanut verified", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Override", result: "Sumaiya: Cefixime — specialist review", patientId: "P-1004" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Omeprazole", patientId: "P-1002" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1003" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1004" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Omar: Azithromycin", patientId: "P-1009" },
    { user: "System Admin", role: "Admin", action: "Login", result: "Successful login" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Prescription", result: "Jamal: Azithromycin — Safe", patientId: "P-1005" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1002" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Nadia: Paracetamol", patientId: "P-1002" },
    { user: "Nurse Amina", role: "Nurse", action: "Verify", result: "Ayesha: Latex verified", patientId: "P-1008" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Override", result: "Imran: Amoxicillin — documented rationale", patientId: "P-1003" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Cetirizine", patientId: "P-1007" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1004" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1001" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Hasan: Omeprazole", patientId: "P-1011" },
    { user: "System Admin", role: "Admin", action: "Admin edit", result: "Added medicine entry" },
    { user: "Rafiq", role: "Patient", action: "Report", result: "Self-reported latex allergy", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Sulfa — Sulfamethoxazole", patientId: "P-1005" },
  ],
  [
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Conflict: Penicillin — Amoxicillin", patientId: "P-1001" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Check", result: "Safe: Paracetamol", patientId: "P-1001" },
    { user: "Pharmacist Lee", role: "Pharmacist", action: "Dispense", result: "Nadia: Paracetamol", patientId: "P-1002" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Login", result: "Successful login" },
    { user: "Dr. Ahmed", role: "Doctor", action: "Prescription", result: "Sumaiya: Paracetamol — Safe", patientId: "P-1004" },
  ],
];

export const seedAuditEvents: AuditEvent[] = demoEvents.flatMap((dayEvents, day) =>
  dayEvents.map((event, index) => {
    const time = new Date();
    time.setDate(time.getDate() - (6 - day));
    time.setHours(8 + (index % 9), (index * 7) % 60, 0, 0);
    return { ...event, id: `seed-${day}-${index}`, time: time.getTime() };
  }),
);

const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000;
const patientName = (patientId: string) => seedPatients.find((patient) => patient.id === patientId)?.name ?? patientId;

export const seedPrescriptions: Prescription[] = [
  {
    id: "demo-rx-pending",
    patientId: "P-1004",
    patientName: patientName("P-1004"),
    medicineName: "Paracetamol",
    status: "Safe",
    doctorName: "Dr. Ahmed",
    createdAt: hoursAgo(3),
  },
  {
    id: "demo-rx-blocked",
    patientId: "P-1001",
    patientName: patientName("P-1001"),
    medicineName: "Amoxicillin",
    status: "Conflict",
    conflictAllergen: "Penicillin",
    severity: "Severe",
    doctorName: "Dr. Ahmed",
    createdAt: hoursAgo(25),
  },
  {
    id: "demo-rx-overridden",
    patientId: "P-1003",
    patientName: patientName("P-1003"),
    medicineName: "Amoxicillin",
    status: "Overridden",
    conflictAllergen: "Penicillin",
    conflictReason: "Patient allergic to Penicillin → Amoxicillin is a Penicillin-class drug.",
    severity: "Moderate",
    doctorName: "Dr. Ahmed",
    overrideReason: "Specialist reviewed and documented the clinical rationale.",
    overriddenAt: hoursAgo(36),
    createdAt: hoursAgo(37),
  },
  {
    id: "demo-rx-dispensed-today",
    patientId: "P-1002",
    patientName: patientName("P-1002"),
    medicineName: "Paracetamol",
    status: "Dispensed",
    doctorName: "Dr. Ahmed",
    createdAt: hoursAgo(5),
    dispensedAt: hoursAgo(2),
  },
  {
    id: "demo-rx-dispensed-week",
    patientId: "P-1009",
    patientName: patientName("P-1009"),
    medicineName: "Azithromycin",
    status: "Dispensed",
    doctorName: "Dr. Ahmed",
    createdAt: hoursAgo(24 * 4),
    dispensedAt: hoursAgo(24 * 4 - 2),
  },
];
