import { Search, SlidersHorizontal } from "lucide-react";
import Button from "../ui/Button";

export default function AttendanceFilters({ filters, onChange, scope }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  return <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={(event) => event.preventDefault()}>
    <label className="text-sm font-medium text-slate-700">From<input aria-label="From date" type="date" value={filters.startDate} onChange={(event) => update("startDate", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
    <label className="text-sm font-medium text-slate-700">To<input aria-label="To date" type="date" value={filters.endDate} onChange={(event) => update("endDate", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
    <label className="text-sm font-medium text-slate-700">Status<select value={filters.status} onChange={(event) => update("status", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">All statuses</option><option value="present">Present</option><option value="absent">Absent</option><option value="half-day">Half day</option><option value="holiday">Holiday</option></select></label>
    {scope === "organization" && <label className="mt-7 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={filters.isLate === "true"} onChange={(event) => update("isLate", event.target.checked ? "true" : "")} />Late arrivals only</label>}
    <label className="relative text-sm font-medium text-slate-700">Search loaded records<Search size={16} className="absolute bottom-2.5 left-3 text-slate-400" /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Name or status" className="mt-1.5 w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" /></label>
    <Button variant="secondary" className="self-end" onClick={() => onChange({ page: 1, limit: 20, startDate: "", endDate: "", status: "", isLate: "", search: "" })}><SlidersHorizontal size={16} />Clear</Button>
  </form>;
}
