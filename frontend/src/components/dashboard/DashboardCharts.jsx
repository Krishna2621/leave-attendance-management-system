import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";
import EmptyState from "../common/EmptyState";

const COLORS = ["#0f766e", "#2563eb", "#f59e0b", "#e11d48"];
const leaveLabels = { pending: "Pending", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };

export function AttendanceOverview({ role, dashboard, attendanceHistory }) {
  let data = [];
  let dataKey = "value";
  if (role === "employee") data = (attendanceHistory?.attendance || []).slice().reverse().map((record) => ({ name: new Date(record.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: record.hoursWorked || 0 }));
  if (role === "manager") data = [{ name: "Present", value: dashboard.employeesPresentToday }, { name: "Absent", value: dashboard.employeesAbsentToday }, { name: "Half day", value: dashboard.employeesOnHalfDayToday }];
  if (["hr", "admin"].includes(role)) { data = (dashboard.topDepartmentsByAttendance || []).map((item) => ({ name: item.department.name, value: item.attendancePercentage })); dataKey = "value"; }
  const title = role === "employee" ? "Attendance Overview" : role === "manager" ? "Team Attendance Overview" : "Department Attendance Overview";
  const detail = role === "employee" ? "Hours worked from your recent attendance records" : role === "manager" ? "Today’s recorded team attendance" : "Today’s attendance rate by department";
  return <Card className="p-5"><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{detail}</p>{data.length ? <div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}><XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey={dataKey} fill="#0f766e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState title="No attendance data yet" description="Attendance activity will appear here once it is recorded." />}</Card>;
}

export function LeaveStatistics({ statistics }) { const data = Object.entries(statistics || {}).map(([key, value]) => ({ name: leaveLabels[key], value })); return <Card className="p-5"><h2 className="font-semibold text-slate-900">Leave Statistics</h2><p className="mt-1 text-xs text-slate-500">Requests by current status</p>{data.some((item) => item.value > 0) ? <div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{data.map((item, index) => <Cell key={item.name} fill={COLORS[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">{data.map((item, index) => <span key={item.name} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />{item.name}: {item.value}</span>)}</div></div> : <EmptyState title="No leave requests yet" description="Leave statistics will appear when requests are created." />}</Card>; }
