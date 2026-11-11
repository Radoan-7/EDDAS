# EDAAS — Emergency Drug Allergy Alert System

EDAAS is a client-side React + Vite demonstration of a role-based allergy decision-support workflow. Patient, medicine, user, prescription, audit, notification, and theme state are stored in browser `localStorage`; there is no backend or clinical-system connection. Demo data is not a source of medical advice.

## Setup

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. Production build and checks:

```powershell
npm run build
npm test
npm run typecheck
npm run lint
```

Seeded account names are **System Admin**, **Dr. Ahmed**, **Nurse Amina**, **Pharmacist Lee**, and **Rafiq**. Use **Admin → User management** to add named demo users and manage their roles or active status. For this local prototype, the account name is the only login identifier; it is not authentication. An inactive account with a matching name cannot sign in.

## Role walkthrough

- **Doctor:** browse/search patient records, review allergy and verification history, check a medicine cart, acknowledge cautions, and document an override with a reason. The dashboard includes seven-day check trends, severity breakdown, and recent alerts.
- **Nurse:** review patient profiles, allergy reactions, severity, and verification state.
- **Pharmacist:** filter the prescription queue, review its current allergy re-check before dispensing, and print a dispense slip. Unresolved conflicts and failed checks remain blocked.
- **Patient:** review and print a wallet-sized allergy card, report allergies, and edit or remove self-reported, unverified entries. Verified records show their verifier and date.
- **Admin:** review activity charts and system status; manage users, medicines, and allergen mappings; filter/export the audit log; and run the acceptance suite.

## Emergency quick check

Doctor, Nurse, and Pharmacist roles can open **Emergency check** from the sidebar. Search by patient name or ID, select a medicine, and submit with **Enter**. Press **/** to focus patient search and **Esc** to close the full-screen result. Conflict, caution, safe, and fail-safe blocked results use distinct red, amber, green, and dark-red screens.

## Demo scenarios

1. Sign in as Doctor, open Emergency check, select **Rafiq (P-1001)** and **Amoxicillin**: expect a Penicillin conflict. Repeat with **Paracetamol**: expect safe.
2. Select **Nadia (P-1002)** and **Amoxicillin**: expect safe with “No allergies recorded.”
3. Use **Admin → Run test suite** to run all six acceptance cases, including P-1004's Penicillin-only conflict and simulated fail-safe block.
4. As Patient, report an allergy; as Doctor, verify it. Check the notification bell and Admin audit log for the self-report, verification, and resulting activity.
5. As Doctor, save a safe prescription, then as Pharmacist confirm the final re-check before dispensing and printing the slip.

The interface is a prototype. Validate allergy information and prescribing decisions with qualified clinicians and authoritative clinical systems.
