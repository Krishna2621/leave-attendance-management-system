import { Bell, CalendarClock, CircleCheckBig, CircleX, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useDashboard from "../../hooks/useDashboard";
import { useProfile } from "../../hooks/useProfile";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import DashboardError from "../../components/dashboard/DashboardError";
import StatCard from "../../components/dashboard/StatCard";
import { AttendanceOverview, LeaveStatistics } from "../../components/dashboard/DashboardCharts";
import QuickActions from "../../components/dashboard/QuickActions";
import { RecentActivity, RecentLeaveRequests, RecentNotifications } from "../../components/dashboard/DashboardLists";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getProfileCompletion } from "../../utils/profileCompletion";

const titleByRole = { employee: "My Dashboard", manager: "Team Dashboard", hr: "HR Dashboard", admin: "Organization Dashboard" };

function getCards(role, data, leaveStatistics, notifications) {
  const notificationCount = notifications?.pagination?.totalRecords ?? 0;
  const pendingLeaves = leaveStatistics?.pending ?? 0;
  if (role === "employee") return [
    { icon: CircleCheckBig, title: "Today’s Attendance", value: data.todayAttendance?.status?.replace("-", " ") || "Not marked", subtitle: data.todayAttendance?.punchIn ? "Attendance recorded today" : "No record for today", tone: "teal" },
    { icon: CircleCheckBig, title: "Present Records", value: data.presentCount ?? 0, subtitle: "Across your attendance history", tone: "blue" },
    { icon: CalendarClock, title: "Pending Leaves", value: pendingLeaves, subtitle: "Awaiting a decision", tone: "amber" },
    { icon: Bell, title: "Notifications", value: notificationCount, subtitle: "All notification updates", tone: "violet" },
  ];
  if (role === "manager") return [
    { icon: Users, title: "Team Members", value: data.teamSize ?? 0, subtitle: "Active direct reports", tone: "blue" },
    { icon: CircleCheckBig, title: "Present Today", value: data.employeesPresentToday ?? 0, subtitle: "Recorded team attendance", tone: "teal" },
    { icon: CircleX, title: "Absent Today", value: data.employeesAbsentToday ?? 0, subtitle: "Recorded team attendance", tone: "rose" },
    { icon: CalendarClock, title: "Pending Leaves", value: pendingLeaves, subtitle: "Team requests awaiting review", tone: "amber" },
  ];
  return [
    { icon: Users, title: "Total Employees", value: data.totalEmployees ?? 0, subtitle: `${data.activeEmployees ?? 0} active employees`, tone: "blue" },
    { icon: CircleCheckBig, title: "Present Today", value: data.employeesPresentToday ?? 0, subtitle: "Recorded organization attendance", tone: "teal" },
    { icon: CircleX, title: "Absent Today", value: data.employeesAbsentToday ?? 0, subtitle: "Recorded organization attendance", tone: "rose" },
    { icon: CalendarClock, title: "Pending Leaves", value: pendingLeaves, subtitle: "Organization requests awaiting review", tone: "amber" },
    { icon: Bell, title: "Notifications", value: notificationCount, subtitle: "Your notification updates", tone: "violet" },
  ];
}

function ProfileReminder({ completion, onComplete }) {
  if (!completion || completion.isComplete) return null;
  return <Card className="border-teal-100 bg-teal-50 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-teal-950">Complete Your Profile</h2><span className="text-sm font-bold text-teal-800">{completion.percentage}%</span></div><p className="mt-1 text-sm text-teal-900/80">Completing your profile helps HR maintain accurate employee information.</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-teal-100" role="progressbar" aria-label="Profile completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completion.percentage}><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${completion.percentage}%` }} /></div><p className="mt-2 text-xs font-medium text-teal-900/75">{completion.completedRequiredFields} of {completion.totalRequiredFields} required fields completed</p></div><Button className="shrink-0" onClick={onComplete}>Complete Profile</Button></div></Card>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboard, notifications, leaveRequests, leaveStatistics, leaveBalances, attendanceHistory } = useDashboard(user.role);
  const profile = useProfile();
  if (dashboard.isLoading) return <DashboardSkeleton />;
  if (dashboard.isError) return <DashboardError error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  const data = dashboard.data;
  const cards = getCards(user.role, data, leaveStatistics.data, notifications.data);
  const activity = data.recentAttendance || data.recentAttendanceActivities || [];
  const completion = profile.data?.user ? getProfileCompletion(profile.data.user) : null;
  return <div className="mt-6 space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">{titleByRole[user.role]}</h1><p className="mt-1 text-sm text-slate-600">Welcome back, {user.name.split(" ")[0]}. Here is your latest overview.</p></div><ProfileReminder completion={completion} onComplete={() => navigate("/profile")} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <StatCard key={card.title} {...card} />)}</section><section className="grid gap-6 xl:grid-cols-2"><AttendanceOverview role={user.role} dashboard={data} attendanceHistory={attendanceHistory.data} /><LeaveStatistics statistics={leaveStatistics.data} /></section><section className="grid gap-6 xl:grid-cols-3"><RecentLeaveRequests requests={leaveRequests.data} /><RecentNotifications notifications={notifications.data} /><RecentActivity activity={activity} role={user.role} /></section>{user.role === "employee" && leaveBalances.data?.leaveBalances?.length > 0 && <section className="rounded-xl border border-teal-100 bg-teal-50 px-5 py-4 text-sm text-teal-950"><span className="font-semibold">Leave Summary: </span>{leaveBalances.data.leaveBalances.map((balance) => `${balance.leaveTypeId?.name}: ${balance.remaining} remaining`).join(" · ")}</section>}<QuickActions role={user.role} /></div>;
}
