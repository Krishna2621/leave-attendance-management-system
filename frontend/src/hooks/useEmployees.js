import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeEmployeeDepartment, changeEmployeeManager, changeEmployeeRole, getDepartments, getEmployee, getEmployees, setEmployeeStatus, updateEmployee } from "../api/user.api";

export const useEmployees = (filters) => useQuery({ queryKey: ["employees", filters], queryFn: () => getEmployees(filters), placeholderData: (previous) => previous });
export const useEmployee = (id) => useQuery({ queryKey: ["employee", id], queryFn: () => getEmployee(id), enabled: Boolean(id) });
export const useDepartmentOptions = (enabled = true) => useQuery({ queryKey: ["departments", "options"], queryFn: () => getDepartments({ limit: 100 }), enabled, staleTime: 300_000, select: (data) => ({ ...data, departments: (data.departments || []).filter((department) => department.isActive) }) });
export const useManagerOptions = (enabled = true) => useQuery({ queryKey: ["employees", "managers"], queryFn: () => getEmployees({ role: "manager", limit: 100 }), enabled, staleTime: 300_000, select: (data) => ({ ...data, users: (data.users || []).filter((user) => user.isActive) }) });

export function useEmployeeActions() {
  const client = useQueryClient();
  const refresh = (id) => Promise.all([client.invalidateQueries({ queryKey: ["employees"] }), id ? client.invalidateQueries({ queryKey: ["employee", id] }) : Promise.resolve()]);
  const withRefresh = (mutationFn) => ({ mutationFn, onSuccess: (_data, variables) => refresh(variables?.id) });
  return {
    update: useMutation(withRefresh(({ id, payload }) => updateEmployee(id, payload))),
    setStatus: useMutation(withRefresh(({ id, isActive }) => setEmployeeStatus(id, isActive))),
    changeRole: useMutation(withRefresh(({ id, role }) => changeEmployeeRole(id, role))),
    changeManager: useMutation(withRefresh(({ id, managerId }) => changeEmployeeManager(id, managerId))),
    changeDepartment: useMutation(withRefresh(({ id, departmentId }) => changeEmployeeDepartment(id, departmentId))),
  };
}