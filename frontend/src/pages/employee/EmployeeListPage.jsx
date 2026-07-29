import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartmentOptions, useEmployees } from "../../hooks/useEmployees";
import EmployeeFilters from "../../components/employee/EmployeeFilters";
import EmployeeTable from "../../components/employee/EmployeeTable";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useEmployeeActions } from "../../hooks/useEmployees";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../utils/apiError";

const emptyFilters = { page: 1, limit: 20, search: "", role: "", departmentId: "", isActive: "" };

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ ...emptyFilters });
  const { isActive, ...backendFilters } = filters;
  const query = useEmployees(backendFilters);
  const departments = useDepartmentOptions();
  const actions = useEmployeeActions();
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const pagination = query.data?.pagination;
  const employees = useMemo(() => {
    const users = query.data?.users || [];
    if (isActive === "") return users;
    return users.filter((user) => user.isActive === (isActive === "true"));
  }, [query.data, isActive]);
  const deleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await actions.delete.mutateAsync({ id: employeeToDelete._id });
      toast.success("Employee deleted successfully.");
      setEmployeeToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete employee."));
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
            <p className="mt-1 text-sm text-slate-600">
              Search, filter, and manage employees across the organization.
            </p>
          </div>
          <button
            onClick={() => navigate("/register")}
            className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Add employee
          </button>
        </div>
      </div>
      <EmployeeFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({ ...emptyFilters })}
        departments={departments.data?.departments || []}
      />
      {query.isLoading ? (
        <Loader label="Loading employees…" />
      ) : query.isError ? (
        <DashboardError error={query.error} onRetry={query.refetch} />
      ) : (
        <>
          <EmployeeTable
            employees={employees}
            onView={(row) => navigate(`/employees/${row._id}`)}
            onDelete={setEmployeeToDelete}
          />
          <Pagination
            page={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        </>
      )}
      <ConfirmDialog
        open={Boolean(employeeToDelete)}
        onClose={() => !actions.delete.isPending && setEmployeeToDelete(null)}
        onConfirm={deleteEmployee}
        title="Delete Employee"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Permanently"
        loading={actions.delete.isPending}
      />
    </div>
  );
}
