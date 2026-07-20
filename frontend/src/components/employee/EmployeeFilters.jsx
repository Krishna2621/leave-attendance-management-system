import { Search, SlidersHorizontal } from "lucide-react";
import Button from "../ui/Button";
import { roleLabels } from "../../utils/employee";

const emptyFilters = { page: 1, limit: 20, search: "", role: "", departmentId: "", isActive: "" };

export default function EmployeeFilters({ filters, onChange, departments = [] }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  return <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
    <label className="relative text-sm font-medium text-slate-700">Search<Search size={16} className="absolute bottom-2.5 left-3 text-slate-400" /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Name or email" className="mt-1.5 w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" /></label>
    <label className="text-sm font-medium text-slate-700">Role<select value={filters.role} onChange={(event) => update("role", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All roles</option>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Department<select value={filters.departmentId} onChange={(event) => update("departmentId", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All departments</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Status<select value={filters.isActive} onChange={(event) => update("isActive", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
    <Button variant="secondary" className="self-end xl:col-start-4" onClick={() => onChange({ ...emptyFilters })}><SlidersHorizontal size={16} />Clear</Button>
  </form>;
}

export { emptyFilters };
