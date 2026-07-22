import { Building2, CalendarCheck, CalendarDays, ChartColumn, ClipboardList, LayoutDashboard, LogOut, UserCircle, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const allRoles = ["employee", "manager", "hr", "admin"];

const navSections = [
  { items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: allRoles }] },
  { heading: "Attendance", items: [{ label: "Attendance", to: "/attendance", icon: CalendarCheck, roles: allRoles }] },
  {
    heading: "Leave",
    items: [
      { label: "Leave Dashboard", to: "/leave", icon: CalendarDays, roles: allRoles },
      { label: "My Leave Requests", to: "/leave/my", icon: ClipboardList, roles: allRoles },
      { label: "Team Leave Requests", to: "/leave/team", icon: ClipboardList, roles: ["manager"] },
      { label: "All Leave Requests", to: "/leave/all", icon: ClipboardList, roles: ["hr", "admin"] },
    ],
  },
  {
    heading: "Workforce",
    items: [
      { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"] },
      { label: "Departments", to: "/departments", icon: Building2, roles: ["hr", "admin"] },
    ],
  },
  {
    heading: "Reports",
    items: [
      { label: "Attendance Reports", to: "/reports/attendance", icon: ChartColumn, roles: ["hr", "admin"] },
      { label: "Leave Reports", to: "/reports/leaves", icon: ClipboardList, roles: ["hr", "admin"] },
    ],
  },
  { heading: "Account", items: [{ label: "Profile", to: "/profile", icon: UserCircle, roles: allRoles }] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const visibleSections = navSections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(user?.role)) }))
    .filter((section) => section.items.length > 0);
  return <><button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="Close navigation" onClick={onClose} hidden={!open} /><aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 px-4 py-5 text-slate-300 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-9 flex items-center justify-between px-2"><span className="text-xl font-bold text-white">Leave<span className="text-teal-400">Flow</span></span><button className="lg:hidden" onClick={onClose} aria-label="Close navigation"><X /></button></div><nav className="flex-1 space-y-6 overflow-y-auto">{visibleSections.map((section) => <div key={section.heading || "primary"} className="space-y-1">{section.heading && <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{section.heading}</p>}{section.items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} end={to === "/leave"} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-teal-700 text-white" : "hover:bg-slate-800 hover:text-white"}`}><Icon size={19} />{label}</NavLink>)}</div>)}</nav><div className="mt-auto pt-4"><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-white"><LogOut size={19} />Sign out</button></div></aside></>;
}
