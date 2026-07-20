import { Building2, CalendarCheck, CalendarDays, ClipboardList, History, LayoutDashboard, LogOut, Menu, UserCircle, Users, WalletCards, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "hr", "admin"] },
  { label: "Attendance", to: "/attendance", icon: CalendarCheck, roles: ["employee", "manager", "hr", "admin"] },
  { label: "Leave Dashboard", to: "/leave", icon: CalendarDays, roles: ["employee", "manager", "hr", "admin"] },
  { label: "My Leave Requests", to: "/leave/my", icon: ClipboardList, roles: ["employee", "manager", "hr", "admin"] },
  { label: "Leave History", to: "/leave/history", icon: History, roles: ["employee", "manager", "hr", "admin"] },
  { label: "Leave Balance", to: "/leave/balance", icon: WalletCards, roles: ["employee"] },
  { label: "Employees", to: "/employees", icon: Users, roles: ["hr", "admin"] },
  { label: "Departments", to: "/departments", icon: Building2, roles: ["hr", "admin"] },
  { label: "Profile", to: "/profile", icon: UserCircle, roles: ["employee", "manager", "hr", "admin"] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const allowedItems = navItems.filter((item) => item.roles.includes(user?.role));
  return <><button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="Close navigation" onClick={onClose} hidden={!open} /><aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 px-4 py-5 text-slate-300 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><div className="mb-9 flex items-center justify-between px-2"><span className="text-xl font-bold text-white">Leave<span className="text-teal-400">Flow</span></span><button className="lg:hidden" onClick={onClose} aria-label="Close navigation"><X /></button></div><nav className="space-y-1">{allowedItems.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} end={to === "/leave"} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-teal-700 text-white" : "hover:bg-slate-800 hover:text-white"}`}><Icon size={19} />{label}</NavLink>)}</nav><div className="mt-auto"><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-white"><LogOut size={19} />Sign out</button></div></aside></>;
}
