import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const attendanceHomeByRole = { employee: "/attendance/my", manager: "/attendance/team", hr: "/attendance/organization", admin: "/attendance/organization" };

export default function AttendanceDashboardPage() {
  const { user } = useAuth();
  return <Navigate to={attendanceHomeByRole[user?.role] || "/attendance/my"} replace />;
}
