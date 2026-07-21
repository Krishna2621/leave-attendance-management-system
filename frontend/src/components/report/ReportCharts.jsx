import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";
import EmptyState from "../common/EmptyState";

const STATUS_COLORS = ["#0f766e", "#e11d48", "#f59e0b", "#2563eb"];

const ChartShell = ({ title, detail, hasData, children }) => (
  <Card className="p-5">
    <h2 className="font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
    {hasData ? <div className="mt-5 h-64">{children}</div> : <div className="mt-5"><EmptyState title="No data for this range" description="Adjust the filters to see chart data." /></div>}
  </Card>
);

export function StatusBreakdownChart({ summary }) {
  const data = [
    { name: "Present", value: summary.presentDays },
    { name: "Absent", value: summary.absentDays },
    { name: "Half day", value: summary.halfDays },
    { name: "Holiday", value: summary.holidayDays },
  ].filter((item) => item.value > 0);
  return <ChartShell title="Status Breakdown" detail="Distribution of attendance records by status" hasData={data.length > 0}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{data.map((item, index) => <Cell key={item.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}</Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div className="-mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600">{data.map((item, index) => <span key={item.name} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }} />{item.name}: {item.value}</span>)}</div>
  </ChartShell>;
}

export function DepartmentAttendanceChart({ departmentWise }) {
  const data = (departmentWise || []).map((item) => ({ name: item.department.name, rate: item.attendanceRate, late: item.lateArrivals }));
  return <ChartShell title="Attendance Rate by Department" detail="Attendance rate across departments in the selected range" hasData={data.length > 0}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} unit="%" />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="rate" name="Attendance rate" fill="#0f766e" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartShell>;
}

export function DailyTrendChart({ dailyTrend }) {
  const data = (dailyTrend || []).map((item) => ({ name: new Date(`${item.date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" }), rate: item.attendanceRate, late: item.lateArrivals }));
  return <ChartShell title="Attendance Trend" detail="Daily attendance rate and late arrivals over time" hasData={data.length > 0}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="rate" name="Attendance rate" stroke="#0f766e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="late" name="Late arrivals" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </ChartShell>;
}
