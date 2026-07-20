import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartmentOptions, useEmployees } from "../../hooks/useEmployees";
import EmployeeFilters, { emptyFilters } from "../../components/employee/EmployeeFilters";
import EmployeeTable from "../../components/employee/EmployeeTable";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ ...emptyFilters });
  const { isActive, ...backendFilters } = filters;
  const query = useEmployees(backendFilters);
  const departments = useDepartmentOptions();
  const pagination = query.data?.pagination;
  const employees = useMemo(() => {
    const users = query.data?.users || [];
    if (isActive === "") return users;
    return users.filter((user) => user.isActive === (isActive === "true"));
  }, [query.data, isActive]);

  return <div className="mt-6 space-y-5">
    <div><h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1><p className="mt-1 text-sm text-slate-600">Search, filter, and manage employees across the organization.</p></div>
    <EmployeeFilters filters={filters} onChange={setFilters} departments={departments.data?.departments || []} />
    {query.isLoading ? <Loader label="Loading employees…" /> : query.isError ? <DashboardError error={query.error} onRetry={query.refetch} /> : <>
      <EmployeeTable employees={employees} onView={(row) => navigate(`/employees/${row._id}`)} />
      <Pagination page={pagination?.page || 1} totalPages={pagination?.totalPages || 1} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
    </>}
  </div>;
}
