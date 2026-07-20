import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
export default function ProtectedRoute({ roles }) { const { isAuthenticated, isLoading, user } = useAuth(); const location = useLocation(); if (isLoading) return <Loader label="Restoring your session…" />; if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />; if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />; return <Outlet />; }
