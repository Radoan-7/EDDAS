import { AppProvider, useApp } from "@/lib/store";
import { Login } from "@/components/Login";
import { TopBar, Footer } from "@/components/Chrome";
import { DoctorPage } from "@/pages/DoctorPage";
import { NursePage } from "@/pages/NursePage";
import { PharmacistPage } from "@/pages/PharmacistPage";
import { PatientPage } from "@/pages/PatientPage";
import { AdminPage } from "@/pages/AdminPage";

function Shell() {
  const { role } = useApp();

  if (!role) {
    return (
      <>
        <Login />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar />
      <main className="flex-1">
        {role === "Doctor" && <DoctorPage />}
        {role === "Nurse" && <NursePage />}
        {role === "Pharmacist" && <PharmacistPage />}
        {role === "Patient" && <PatientPage />}
        {role === "Admin" && <AdminPage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
