import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDepartment, deleteDepartment, getDepartment, getDepartments, updateDepartment } from "../api/department.api";

export const useDepartments = (filters) => useQuery({ queryKey: ["departments", filters], queryFn: () => getDepartments(filters), placeholderData: (previous) => previous });
export const useDepartment = (id) => useQuery({ queryKey: ["department", id], queryFn: () => getDepartment(id), enabled: Boolean(id) });

export function useDepartmentActions() {
  const client = useQueryClient();
  const refresh = (id) => Promise.all([client.invalidateQueries({ queryKey: ["departments"] }), id ? client.invalidateQueries({ queryKey: ["department", id] }) : Promise.resolve()]);
  return {
    create: useMutation({ mutationFn: (payload) => createDepartment(payload), onSuccess: () => refresh() }),
    update: useMutation({ mutationFn: ({ id, payload }) => updateDepartment(id, payload), onSuccess: (_data, variables) => refresh(variables.id) }),
    remove: useMutation({ mutationFn: (id) => deleteDepartment(id), onSuccess: () => refresh() }),
  };
}
