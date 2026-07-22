import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AttendanceDashboardPage from "../pages/attendance/AttendanceDashboardPage";
import MarkAttendancePage from "../pages/attendance/MarkAttendancePage";
import AttendanceListPage from "../pages/attendance/AttendanceListPage";
import AttendanceCalendarPage from "../pages/attendance/AttendanceCalendarPage";
import LeaveDashboardPage from "../pages/leave/LeaveDashboardPage";
import ApplyLeavePage from "../pages/leave/ApplyLeavePage";
import LeaveListPage from "../pages/leave/LeaveListPage";
import LeaveBalancePage from "../pages/leave/LeaveBalancePage";
import EmployeeListPage from "../pages/employee/EmployeeListPage";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import DepartmentListPage from "../pages/department/DepartmentListPage";
import DepartmentDetailsPage from "../pages/department/DepartmentDetailsPage";
import AttendanceReportPage from "../pages/reports/AttendanceReportPage";
import LeaveReportPage from "../pages/reports/LeaveReportPage";
import ProfilePage from "../pages/profile/ProfilePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

export default function AppRoutes() {
  return <Routes>
    <Route element={<PublicRoute />}><Route path="/login" element={<LoginPage />} /></Route>
    <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/attendance" element={<AttendanceDashboardPage />} />
      <Route path="/attendance/my" element={<AttendanceListPage scope="my" />} />
      <Route path="/attendance/mark" element={<MarkAttendancePage />} />
      <Route path="/attendance/history" element={<AttendanceListPage scope="my" />} />
      <Route path="/attendance/calendar" element={<AttendanceCalendarPage />} />
      <Route path="/leave" element={<LeaveDashboardPage />} />
      <Route path="/leave/apply" element={<ApplyLeavePage />} />
      <Route path="/leave/my" element={<LeaveListPage scope="my" />} />
      <Route path="/leave/history" element={<Navigate to="/leave/my" replace />} />
      <Route path="/leave/balance" element={<LeaveBalancePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route element={<ProtectedRoute roles={["manager"]} />}><Route path="/attendance/team" element={<AttendanceListPage scope="team" />} /><Route path="/leave/team" element={<LeaveListPage scope="team" />} /></Route>
      <Route element={<ProtectedRoute roles={["hr", "admin"]} />}><Route path="/attendance/organization" element={<AttendanceListPage scope="organization" />} /><Route path="/leave/all" element={<LeaveListPage scope="organization" />} /><Route path="/employees" element={<EmployeeListPage />} /><Route path="/employees/:id" element={<EmployeeDetailsPage />} /><Route path="/departments" element={<DepartmentListPage />} /><Route path="/departments/:id" element={<DepartmentDetailsPage />} /><Route path="/reports/attendance" element={<AttendanceReportPage />} /><Route path="/reports/leaves" element={<LeaveReportPage />} /></Route>
    </Route></Route>
    <Route path="/unauthorized" element={<UnauthorizedPage />} /><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
