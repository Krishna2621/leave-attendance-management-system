import { useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAttendance, useAttendanceDashboard } from "../../hooks/useAttendance";
import { monthBounds } from "../../utils/attendance";
import AttendanceDashboardSummary from "../../components/attendance/AttendanceDashboardSummary";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import Button from "../../components/ui/Button";
export default function AttendanceDashboardPage() { const { user } = useAuth(); const month = useMemo(() => monthBounds(new Date()), []); const dashboard = useAttendanceDashboard(user.role === "employee"); const history = useAttendance("my", { ...month, limit: 100 }, user.role === "employee"); if (user.role !== "employee") return <div className="mt-6"><h1 className="text-2xl font-bold">Attendance Dashboard</h1><p className="mt-2 text-slate-600">Use the organization or team attendance view available for your role.</p><Link to={user.role === "manager" ? "/attendance/team" : "/attendance/organization"}><Button className="mt-5">View attendance</Button></Link></div>; if (dashboard.isLoading || history.isLoading) return <Loader label="Loading attendance summary…" />; if (dashboard.isError) return <DashboardError error={dashboard.error} onRetry={dashboard.refetch} />; return <div className="mt-6"><div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Attendance Dashboard</h1><p className="mt-1 text-sm text-slate-600">Your current attendance overview and monthly summary.</p></div><AttendanceDashboardSummary dashboard={dashboard.data} monthRecords={history.data?.attendance || []} /></div>; }
