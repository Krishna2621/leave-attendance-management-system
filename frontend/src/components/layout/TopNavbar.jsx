import { useEffect, useRef, useState } from "react";
import { Menu, Search, ChevronDown, LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import useAuth from "../../hooks/useAuth";
import Breadcrumbs from "./Breadcrumbs";
import NotificationDropdown from "./NotificationDropdown";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const userMenu = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!userMenu.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-4 lg:px-8"><button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={onMenuClick} aria-label="Open navigation"><Menu size={21} /></button><div className="hidden min-w-0 md:block md:w-56 lg:w-64"><Breadcrumbs /></div><div className="hidden flex-1 sm:block"><label className="relative mx-auto block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="search" aria-label="Global search" placeholder="Search employees, departments..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10" /></label></div><div className="ml-auto flex items-center gap-1 sm:gap-2"><NotificationDropdown /><div ref={userMenu} className="relative"><button type="button" onClick={() => setOpen((current) => !current)} className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-slate-100" aria-label="Open user menu" aria-expanded={open}><div className="hidden text-right xl:block"><p className="text-xs font-medium text-slate-500">{getGreeting()}</p><p className="text-sm font-semibold text-slate-800">{user?.name}</p></div><Avatar name={user?.name} src={user?.profilePicture?.url} /><ChevronDown size={16} className="hidden text-slate-500 sm:block" /></button>{open && <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"><Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-teal-700"><UserCircle size={17} />My Profile</Link><button type="button" onClick={logout} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-teal-700"><LogOut size={17} />Logout</button></div>}</div></div></header>;
}
