import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useLeaveHistory, useLeaveRequests } from "../../hooks/useLeave";
import LeaveStatusBadge from "../../components/leave/LeaveStatusBadge";
import LeaveDetailsModal from "../../components/leave/LeaveDetailsModal";
import Table from "../../components/common/Table";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import { dateText } from "../../utils/leave";
import Button from "../../components/ui/Button";

const completedStatuses = new Set(["approved", "rejected", "cancelled"]);

export default function LeaveHistoryPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const requests = useLeaveRequests("my", { page: 1, limit: 100 });
  const history = useLeaveHistory(selected?._id);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests.data?.leaveRequests || []).filter((request) => {
      const matchesCompletedStatus = completedStatuses.has(request.status);
      const matchesSelectedStatus = !status || request.status === status;
      const matchesSearch = !term || `${request.leaveTypeId?.name || ""} ${request.reason} ${request.status}`.toLowerCase().includes(term);
      return matchesCompletedStatus && matchesSelectedStatus && matchesSearch;
    });
  }, [requests.data, status, search]);
  const columns = [
    { key: "leaveType", label: "Leave type", render: (row) => row.leaveTypeId?.name || "—" },
    { key: "dates", label: "Dates", render: (row) => `${dateText(row.startDate)} – ${dateText(row.endDate)}` },
    { key: "days", label: "Days", render: (row) => row.totalDays },
    { key: "status", label: "Status", render: (row) => <LeaveStatusBadge status={row.status} /> },
    { key: "details", label: "Details", render: (row) => <Button variant="ghost" className="px-2 py-2" onClick={() => setSelected(row)} aria-label="View leave details"><Eye size={17} /></Button> },
  ];
  if (requests.isLoading) return <Loader label="Loading leave history…" />;
  if (requests.isError) return <DashboardError error={requests.error} onRetry={requests.refetch} />;
  return <div className="mt-6 space-y-5"><div><h1 className="text-2xl font-bold text-slate-900">Leave History</h1><p className="mt-1 text-sm text-slate-600">View completed leave requests</p></div><section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Completed status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 p-2"><option value="">All completed statuses</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select></label><label className="text-sm font-medium text-slate-700">Search completed requests<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Leave type, reason, or status" className="mt-1.5 w-full rounded-lg border border-slate-300 p-2" /></label></section><Table columns={columns} data={rows} keyField="_id" emptyMessage="No completed leave requests found." /><LeaveDetailsModal request={selected} onClose={() => setSelected(null)} history={history.data} /></div>;
}
