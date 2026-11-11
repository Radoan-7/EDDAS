import { useState } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { Login } from "@/components/Login";
import { Sidebar, TopBar, Footer } from "@/components/Chrome";
import { DoctorPage } from "@/pages/DoctorPage";
import { NursePage } from "@/pages/NursePage";
import { PharmacistPage } from "@/pages/PharmacistPage";
import { PatientPage } from "@/pages/PatientPage";
import { AdminPage } from "@/pages/AdminPage";
import { EmergencyQuickCheckPage } from "@/pages/EmergencyQuickCheckPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Shell() {
  const { role } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  if (!role) {
    return (
      <>
        <Login />
        <Footer />
      </>
    );
  }

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <TopBar onOpenMenu={() => setSidebarOpen(true)} />
      <div className="flex-1 w-full max-w-[1600px] mx-auto md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onEmergency={() => setEmergencyOpen(true)}
          onDashboard={() => setEmergencyOpen(false)}
        />
        <main className="app-main flex-1 min-w-0">
          <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Workspace</span><span aria-hidden="true">/</span><span className="font-semibold text-slate-700">{emergencyOpen ? "Emergency quick check" : role}</span>
          </div>
          <div key={role} className="page-enter">
          {emergencyOpen ? <EmergencyQuickCheckPage onBack={() => setEmergencyOpen(false)} /> : <>
            {role === "Doctor" && <DoctorPage />}
            {role === "Nurse" && <NursePage />}
            {role === "Pharmacist" && <PharmacistPage />}
            {role === "Patient" && <PatientPage />}
            {role === "Admin" && <AdminPage />}
          </>}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ErrorBoundary>
  );
}
