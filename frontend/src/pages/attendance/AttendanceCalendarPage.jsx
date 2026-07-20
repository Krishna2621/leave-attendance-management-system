import { useState } from "react";
import { useAttendance } from "../../hooks/useAttendance";
import { monthBounds } from "../../utils/attendance";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import AttendanceDetailsModal from "../../components/attendance/AttendanceDetailsModal";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
export default function AttendanceCalendarPage() { const [month, setMonth] = useState(() => new Date()); const [selected, setSelected] = useState(null); const query = useAttendance("my", { ...monthBounds(month), limit: 100 }); if (query.isLoading) return <Loader label="Loading attendance calendar…" />; if (query.isError) return <DashboardError error={query.error} onRetry={query.refetch} />; return <div className="mt-6"><h1 className="text-2xl font-bold">Attendance Calendar</h1><p className="mt-1 mb-6 text-sm text-slate-600">View your monthly attendance and select a day for details.</p><AttendanceCalendar month={month} onMonthChange={setMonth} records={query.data?.attendance || []} onSelect={setSelected} /><AttendanceDetailsModal record={selected} onClose={() => setSelected(null)} /></div>; }
