import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useAttendance, useAttendanceActions } from "../../hooks/useAttendance";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import AttendanceDetailsModal from "../../components/attendance/AttendanceDetailsModal";
import CorrectionModal from "../../components/attendance/CorrectionModal";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import { getApiErrorMessage } from "../../utils/apiError";

const pageTitle = { my: "My Attendance", team: "Team Attendance", organization: "Organization Attendance" };

export default function AttendanceListPage({ scope }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 1, limit: 20, startDate: "", endDate: "", status: "", isLate: "", search: "" });
  const [selected, setSelected] = useState(null);
  const [correcting, setCorrecting] = useState(null);
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const query = useAttendance(scope, filters);
  const { correct } = useAttendanceActions();
  const rows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const records = query.data?.attendance || [];
    const statusFiltered = filters.status && scope !== "organization" ? records.filter((row) => row.status === filters.status) : records;
    const searched = term ? statusFiltered.filter((row) => `${row.employee?.name || ""} ${row.status} ${row.date}`.toLowerCase().includes(term)) : statusFiltered;
    return [...searched].sort((a, b) => {
      const left = sort.key === "employee" ? a.employee?.name || "" : a[sort.key] || "";
      const right = sort.key === "employee" ? b.employee?.name || "" : b[sort.key] || "";
      return String(left).localeCompare(String(right)) * (sort.direction === "asc" ? 1 : -1);
    });
  }, [query.data, filters.search, filters.status, scope, sort]);
  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  const submitCorrection = async (payload) => {
    try {
      await correct.mutateAsync({ id: correcting._id, payload: { ...payload, punchIn: new Date(payload.punchIn).toISOString(), punchOut: new Date(payload.punchOut).toISOString() } });
      toast.success("Attendance corrected successfully.");
      setCorrecting(null);
    } catch (error) { toast.error(getApiErrorMessage(error)); }
  };
  if (query.isLoading) return <Loader label="Loading attendance records…" />;
  if (query.isError) return <DashboardError error={query.error} onRetry={query.refetch} />;
  return <div className="mt-6 space-y-5"><div><h1 className="text-2xl font-bold text-slate-900">{pageTitle[scope]}</h1><p className="mt-1 text-sm text-slate-600">Filter, sort, and inspect available attendance records.</p></div><AttendanceFilters filters={filters} onChange={setFilters} scope={scope} /><AttendanceTable records={rows} scope={scope} onDetails={setSelected} onCorrect={["hr", "admin"].includes(user.role) && scope === "organization" ? setCorrecting : undefined} sort={sort} onSort={toggleSort} /><Pagination page={query.data?.pagination?.page || 1} totalPages={query.data?.pagination?.totalPages || 1} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} /><AttendanceDetailsModal record={selected} onClose={() => setSelected(null)} /><CorrectionModal record={correcting} onClose={() => setCorrecting(null)} onSubmit={submitCorrection} loading={correct.isPending} /></div>;
}
