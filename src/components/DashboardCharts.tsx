import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import type { AuditEvent, Patient, Prescription } from "@/lib/types";

const colors = { conflict: "#dc2626", safe: "#059669", caution: "#d97706", muted: "#64748b" };
const panelClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

function lastSevenDays(events: AuditEvent[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const sameDay = (event: AuditEvent) => {
      const time = new Date(event.time);
      return `${time.getFullYear()}-${time.getMonth()}-${time.getDate()}` === key;
    };
    const todayLabel = date.toLocaleDateString(undefined, { weekday: "short" });
    const checks = events.filter((event) => event.action === "Check" && sameDay(event));
    return {
      day: todayLabel,
      conflicts: checks.filter((event) => event.result.toLowerCase().startsWith("conflict")).length,
      safe: checks.filter((event) => event.result.toLowerCase().startsWith("safe")).length,
      checks: events.filter((event) => event.action === "Check" && sameDay(event)).length,
    };
  });
}

function ChartTitle({ children }: { children: string }) {
  return <h2 className="mb-3 text-sm font-bold text-slate-800">{children}</h2>;
}

export function DoctorCharts({ patients, events }: { patients: Patient[]; events: AuditEvent[] }) {
  const days = lastSevenDays(events);
  const severities = ["Severe", "Moderate", "Mild"].map((severity) => ({
    name: severity,
    value: patients.reduce((total, patient) => total + patient.allergies.filter((allergy) => allergy.severity === severity).length, 0),
    color: severity === "Severe" ? colors.conflict : severity === "Moderate" ? "#ea580c" : "#ca8a04",
  })).filter((item) => item.value > 0);
  const alerts = events.filter((event) => event.action === "Check" && event.result.toLowerCase().startsWith("conflict"))
    .sort((a, b) => b.time - a.time).slice(0, 4);
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-3">
      <section className={`${panelClass} lg:col-span-2`} aria-label="Checks over the last seven days">
        <ChartTitle>Conflicts caught vs. safe checks · 7 days</ChartTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="conflicts" name="Conflicts" stroke={colors.conflict} strokeWidth={2.5} />
              <Line type="monotone" dataKey="safe" name="Safe" stroke={colors.safe} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={panelClass} aria-label="Allergy severity distribution">
        <ChartTitle>Allergy severity</ChartTitle>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={severities} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                {severities.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 text-xs text-slate-600">{severities.map((item) => <span key={item.name}>{item.name}: {item.value}</span>)}</div>
      </section>
      <section className={`${panelClass} lg:col-span-3`}>
        <ChartTitle>Recent conflict alerts</ChartTitle>
        {alerts.length === 0 ? <p className="text-sm text-slate-500">No recent conflicts.</p> : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {alerts.map((event) => <li key={event.id} className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-900">
              <strong>{event.result}</strong><span className="mt-1 block text-xs text-red-700">{new Date(event.time).toLocaleString()}</span>
            </li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

export function PharmacistCharts({ prescriptions }: { prescriptions: Prescription[] }) {
  const statusData = [
    { status: "Pending", count: prescriptions.filter((item) => item.status === "Safe" || item.status === "Caution").length, fill: "#d97706" },
    { status: "Blocked", count: prescriptions.filter((item) => item.status === "Conflict").length, fill: "#dc2626" },
    { status: "Overridden", count: prescriptions.filter((item) => item.status === "Overridden").length, fill: "#2563eb" },
    { status: "Dispensed", count: prescriptions.filter((item) => item.status === "Dispensed").length, fill: "#059669" },
  ];
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const dispensedToday = prescriptions.filter((item) => item.dispensedAt && item.dispensedAt >= todayStart);
  const durations = dispensedToday.filter((item) => item.dispensedAt).map((item) => item.dispensedAt! - item.createdAt);
  const averageMinutes = durations.length ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length / 60000) : 0;
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-3">
      <section className={`${panelClass} lg:col-span-2`}>
        <ChartTitle>Prescription queue by status</ChartTitle>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Prescriptions" radius={[6, 6, 0, 0]}>{statusData.map((item) => <Cell key={item.status} fill={item.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={`${panelClass} grid content-center gap-5`}>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dispensed today</p><p className="mt-1 text-3xl font-bold text-emerald-700">{dispensedToday.length}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blocked prescriptions</p><p className="mt-1 text-3xl font-bold text-red-700">{statusData[1].count}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg. time to dispense today</p><p className="mt-1 text-3xl font-bold text-slate-800">{averageMinutes} min</p></div>
      </section>
    </div>
  );
}

export function AdminCharts({ events, failureMode = false }: { events: AuditEvent[]; failureMode?: boolean }) {
  const days = lastSevenDays(events);
  const allergenCounts = new Map<string, number>();
  events.filter((event) => event.action === "Check" && event.result.toLowerCase().startsWith("conflict")).forEach((event) => {
    const allergen = event.result.split(":")[1]?.split("—")[0]?.trim() ?? "Unspecified";
    allergenCounts.set(allergen, (allergenCounts.get(allergen) ?? 0) + 1);
  });
  const allergens = [...allergenCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const overrides = [...new Set(events.filter((event) => event.action === "Override").map((event) => event.user))]
    .map((doctor) => ({ doctor, count: events.filter((event) => event.action === "Override" && event.user === doctor).length }));
  const recent = Date.now() - 7 * 86400000;
  const checkVolume = events.filter((event) => event.action === "Check" && event.time >= recent).length;
  const failCount = events.filter((event) => event.action === "Check" && event.result.toLowerCase().startsWith("blocked")).length;
  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-2">
      <section className={panelClass}>
        <ChartTitle>Checks per day · 7 days</ChartTitle>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="checks" name="Checks" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={panelClass}>
        <ChartTitle>Top conflicting allergens</ChartTitle>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allergens} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} /><Tooltip />
              <Bar dataKey="count" name="Conflicts" fill={colors.conflict} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={panelClass}>
        <ChartTitle>Overrides by doctor</ChartTitle>
        {overrides.length ? <ul className="space-y-2">{overrides.map((item) => <li key={item.doctor} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{item.doctor}</span><strong>{item.count}</strong></li>)}</ul> : <p className="text-sm text-slate-500">No overrides recorded.</p>}
      </section>
      <section className={`rounded-2xl border p-5 shadow-sm ${failureMode ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`} aria-label="System health">
        <ChartTitle>System health</ChartTitle>
        <div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${failureMode ? "bg-red-600" : "bg-emerald-500"}`} /><strong className={failureMode ? "text-red-900" : "text-emerald-900"}>{failureMode ? "Failure simulation active · checks are blocked" : "Operational · Fail-safe enabled"}</strong></div>
        <p className={`mt-2 text-sm ${failureMode ? "text-red-800" : "text-emerald-800"}`}>{checkVolume} checks logged in the last 7 days · {failCount} blocked failure-mode checks.</p>
        <p className={`mt-1 text-xs ${failureMode ? "text-red-800" : "text-emerald-800"}`}>Client-side demo data only; no external clinical system connection.</p>
      </section>
    </div>
  );
}

export function PatientProgress({ patients, patientId }: { patients: Patient[]; patientId: string }) {
  const patient = patients.find((item) => item.id === patientId);
  const allergies = patient?.allergies ?? [];
  const verified = allergies.filter((item) => item.verified).length;
  const progress = allergies.length ? Math.round(verified / allergies.length * 100) : 100;
  const severity = allergies.reduce((counts, allergy) => ({ ...counts, [allergy.severity]: counts[allergy.severity] + 1 }), { Severe: 0, Moderate: 0, Mild: 0 });
  return (
    <section className={`${panelClass} mb-4`} aria-label="Allergy verification progress">
      <ChartTitle>Allergy summary & verification progress</ChartTitle>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {(["Severe", "Moderate", "Mild"] as const).map((key) => <span key={key} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{key}: {severity[key]}</span>)}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div>
        <strong className="text-sm text-slate-700">{progress}% verified</strong>
      </div>
      <p className="mt-1 text-xs text-slate-500">{verified} of {allergies.length} allergies verified by clinical staff.</p>
    </section>
  );
}
