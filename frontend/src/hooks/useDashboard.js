import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNotification, getAttendanceHistory, getDashboard, getLeaveBalances, getLeaveStatistics, getNotifications, getRecentLeaveRequests, markAllNotificationsAsRead, markNotificationAsRead } from "../api/dashboard.api";

const unreadCount = (notifications) => notifications.filter((notification) => !notification.isRead).length;
const updateNotificationCache = (queryClient, update) => queryClient.setQueriesData({ queryKey: ["notifications"] }, (current) => current ? update(current) : current);

export default function useDashboard(role) {
  const dashboard = useQuery({ queryKey: ["dashboard", role], queryFn: () => getDashboard(role) });
  const notifications = useQuery({ queryKey: ["notifications", "recent"], queryFn: getNotifications });
  const leaveRequests = useQuery({ queryKey: ["leave-requests", role, "recent"], queryFn: () => getRecentLeaveRequests(role) });
  const leaveStatistics = useQuery({ queryKey: ["leave-statistics", role], queryFn: () => getLeaveStatistics(role) });
  const leaveBalances = useQuery({ queryKey: ["leave-balances", "me"], queryFn: getLeaveBalances, enabled: role === "employee" });
  const attendanceHistory = useQuery({ queryKey: ["attendance", "me", "recent"], queryFn: getAttendanceHistory, enabled: role === "employee" });
  return { dashboard, notifications, leaveRequests, leaveStatistics, leaveBalances, attendanceHistory };
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  return {
    markAsRead: useMutation({ mutationFn: markNotificationAsRead, onSuccess: ({ notification }) => { updateNotificationCache(queryClient, (current) => { const notifications = current.notifications.map((item) => item._id === notification._id ? notification : item); return { ...current, notifications, unreadCount: unreadCount(notifications) }; }); refresh(); } }),
    markAllAsRead: useMutation({ mutationFn: markAllNotificationsAsRead, onSuccess: () => { updateNotificationCache(queryClient, (current) => { const notifications = current.notifications.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() })); return { ...current, notifications, unreadCount: 0 }; }); refresh(); } }),
    delete: useMutation({ mutationFn: deleteNotification, onSuccess: ({ notificationId }) => { updateNotificationCache(queryClient, (current) => { const deleted = current.notifications.find((item) => item._id === notificationId); const notifications = current.notifications.filter((item) => item._id !== notificationId); return { ...current, notifications, unreadCount: Math.max(0, (current.unreadCount ?? unreadCount(current.notifications)) - (deleted && !deleted.isRead ? 1 : 0)), pagination: { ...current.pagination, totalRecords: Math.max(0, current.pagination.totalRecords - (deleted ? 1 : 0)) } }; }); refresh(); } }),
  };
}
