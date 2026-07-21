import { useQuery } from "@tanstack/react-query";
import { getAttendanceReport } from "../api/report.api";
import { getDepartments, getEmployees } from "../api/user.api";

export const useAttendanceReport = (filters, enabled = true) =>
  useQuery({
    queryKey: ["reports", "attendance", filters],
    queryFn: () => getAttendanceReport(filters),
    enabled: enabled && Boolean(filters.startDate) && Boolean(filters.endDate),
    placeholderData: (previous) => previous,
  });

export const useReportDepartmentOptions = (enabled = true) =>
  useQuery({
    queryKey: ["departments", "options"],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled,
    staleTime: 300_000,
    select: (data) => (data.departments || []).filter((department) => department.isActive),
  });

export const useReportEmployeeOptions = (enabled = true) =>
  useQuery({
    queryKey: ["employees", "report-options"],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled,
    staleTime: 300_000,
    select: (data) => (data.users || []).filter((user) => user.isActive),
  });
