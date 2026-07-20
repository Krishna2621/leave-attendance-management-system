import { useQuery } from "@tanstack/react-query";
import { getAttendanceHistory, getDashboard, getLeaveBalances, getLeaveStatistics, getNotifications, getRecentLeaveRequests } from "../api/dashboard.api";

export default function useDashboard(role) {
  const dashboard = useQuery({ queryKey: ["dashboard", role], queryFn: () => getDashboard(role) });
  const notifications = useQuery({ queryKey: ["notifications", "recent"], queryFn: getNotifications });
  const leaveRequests = useQuery({ queryKey: ["leave-requests", role, "recent"], queryFn: () => getRecentLeaveRequests(role) });
  const leaveStatistics = useQuery({ queryKey: ["leave-statistics", role], queryFn: () => getLeaveStatistics(role) });
  const leaveBalances = useQuery({ queryKey: ["leave-balances", "me"], queryFn: getLeaveBalances, enabled: role === "employee" });
  const attendanceHistory = useQuery({ queryKey: ["attendance", "me", "recent"], queryFn: getAttendanceHistory, enabled: role === "employee" });
  return { dashboard, notifications, leaveRequests, leaveStatistics, leaveBalances, attendanceHistory };
}
