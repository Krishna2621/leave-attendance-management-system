import { Menu } from "lucide-react";
import Avatar from "../ui/Avatar";
import useAuth from "../../hooks/useAuth";

export default function TopNavbar({ onMenuClick }) { const { user } = useAuth(); return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8"><button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={onMenuClick} aria-label="Open navigation"><Menu size={21} /></button><div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{user?.name}</p><p className="text-xs capitalize text-slate-500">{user?.role}</p></div><Avatar name={user?.name} /></div></header>; }
