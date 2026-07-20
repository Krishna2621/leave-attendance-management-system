import { Search } from "lucide-react";

const emptyFilters = { page: 1, limit: 20, search: "", status: "" };

export default function DepartmentFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  return <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
    <label className="relative text-sm font-medium text-slate-700">Search<Search size={16} className="absolute bottom-2.5 left-3 text-slate-400" /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Department name" className="mt-1.5 w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" /></label>
    <label className="text-sm font-medium text-slate-700">Status<select value={filters.status} onChange={(event) => update("status", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
  </form>;
}

export { emptyFilters };
