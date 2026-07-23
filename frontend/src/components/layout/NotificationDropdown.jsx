import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";
import { getNotifications } from "../../api/dashboard.api";
import { formatDate } from "../../utils/attendance";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const query = useQuery({ queryKey: ["notifications", "recent"], queryFn: getNotifications });
  const notifications = query.data?.notifications || [];
  const count = query.data?.pagination?.totalRecords ?? 0;

  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!container.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return <div ref={container} className="relative"><button type="button" onClick={() => setOpen((current) => !current)} className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-teal-700" aria-label="Notifications" aria-expanded={open}><Bell size={20} />{count > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-teal-700 px-1 text-[10px] font-bold leading-4 text-white">{count > 9 ? "9+" : count}</span>}</button>{open && <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="font-semibold text-slate-900">Notifications</h2><button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close notifications"><X size={17} /></button></div><div className="max-h-80 overflow-y-auto">{query.isLoading ? <p className="px-4 py-6 text-center text-sm text-slate-500">Loading notifications…</p> : notifications.length ? notifications.map((item) => <div key={item._id} className="border-b border-slate-100 px-4 py-3 last:border-0"><p className="text-sm font-medium capitalize text-slate-800">{item.type?.replaceAll("_", " ") || "Notification"}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p></div>) : <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>}</div></div>}</div>;
}
