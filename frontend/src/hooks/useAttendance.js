import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { correctAttendance, getAttendanceDashboard, getMyAttendance, getOrganizationAttendance, getTeamAttendance, punchIn, punchOut } from "../api/attendance.api";

const queryKey = (scope, params) => ["attendance", scope, params];

export function useAttendance(scope, params, enabled = true) {
  const fetcher = scope === "team" ? getTeamAttendance : scope === "organization" ? getOrganizationAttendance : getMyAttendance;
  const backendParams = scope === "organization" ? params : Object.fromEntries(Object.entries(params).filter(([key]) => !["status", "isLate", "search"].includes(key)));
  return useQuery({ queryKey: queryKey(scope, params), queryFn: () => fetcher(backendParams), enabled, placeholderData: (previous) => previous });
}

export function useAttendanceDashboard(enabled = true) { return useQuery({ queryKey: ["attendance", "dashboard"], queryFn: getAttendanceDashboard, enabled }); }

export function useAttendanceActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["attendance"] });
  const options = { onSuccess: refresh };
  return { punchIn: useMutation({ mutationFn: punchIn, ...options }), punchOut: useMutation({ mutationFn: punchOut, ...options }), correct: useMutation({ mutationFn: ({ id, payload }) => correctAttendance(id, payload), ...options }) };
}
