import { SlidersHorizontal } from "lucide-react";
import Button from "../ui/Button";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "half-day", label: "Half day" },
  { value: "holiday", label: "Holiday" },
];

export default function ReportFilters({ filters, onChange, onReset, departments = [], employees = [], loading = false }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  return <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={(event) => event.preventDefault()}>
    <label className="text-sm font-medium text-slate-700">From<input aria-label="Start date" type="date" value={filters.startDate} max={filters.endDate || undefined} onChange={(event) => update("startDate", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label>
    <label className="text-sm font-medium text-slate-700">To<input aria-label="End date" type="date" value={filters.endDate} min={filters.startDate || undefined} onChange={(event) => update("endDate", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10" /></label>
    <label className="text-sm font-medium text-slate-700">Department<select value={filters.departmentId} onChange={(event) => update("departmentId", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"><option value="">All departments</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Employee<select value={filters.userId} onChange={(event) => update("userId", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"><option value="">All employees</option>{employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Status<select value={filters.status} onChange={(event) => update("status", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <div className="flex items-end gap-3">
      <label className="flex flex-1 items-center gap-2 pb-2.5 text-sm text-slate-700"><input type="checkbox" checked={filters.isLate === "true"} onChange={(event) => update("isLate", event.target.checked ? "true" : "")} />Late arrivals only</label>
      <Button variant="secondary" loading={loading} onClick={onReset}><SlidersHorizontal size={16} />Reset</Button>
    </div>
  </form>;
}
