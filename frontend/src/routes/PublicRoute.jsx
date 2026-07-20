import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
export default function PublicRoute() { const { isAuthenticated, isLoading } = useAuth(); if (isLoading) return <Loader label="Checking your session…" />; return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />; }
