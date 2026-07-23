import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";

export default function MainLayout() { const [sidebarOpen, setSidebarOpen] = useState(false); return <div className="min-h-screen bg-slate-50"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="lg:pl-72"><TopNavbar onMenuClick={() => setSidebarOpen(true)} /><main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div>; }
