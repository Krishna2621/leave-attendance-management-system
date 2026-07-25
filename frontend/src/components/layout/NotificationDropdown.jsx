import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, Trash2, X } from "lucide-react";
import { getNotifications } from "../../api/dashboard.api";
import { useNotificationActions } from "../../hooks/useDashboard";
import { formatDate } from "../../utils/attendance";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const query = useQuery({ queryKey: ["notifications", "recent"], queryFn: getNotifications });
  const actions = useNotificationActions();
  const notifications = query.data?.notifications || [];
  const count =
    query.data?.unreadCount ?? notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-teal-700 px-1 text-[10px] font-bold leading-4 text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => actions.markAllAsRead.mutate()}
                disabled={count === 0 || actions.markAllAsRead.isPending}
                className="rounded-md px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:text-slate-400"
                aria-label="Mark all notifications as read"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notifications"
              >
                <X size={17} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {query.isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading notifications…</p>
            ) : notifications.length ? (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-0 ${item.isRead ? "bg-white" : "bg-teal-50/70"}`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-teal-600"}`}
                    aria-label={item.isRead ? "Read" : "Unread"}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm capitalize ${item.isRead ? "font-normal text-slate-600" : "font-medium text-slate-800"}`}
                    >
                      {item.type?.replaceAll("_", " ") || "Notification"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => actions.markAsRead.mutate(item._id)}
                      disabled={item.isRead || actions.markAsRead.isPending}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-300"
                      aria-label="Mark notification as read"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.delete.mutate(item._id)}
                      disabled={actions.delete.isPending}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
