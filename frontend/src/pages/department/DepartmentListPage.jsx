import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useDepartmentActions, useDepartments } from "../../hooks/useDepartments";
import { useManagerOptions } from "../../hooks/useEmployees";
import DepartmentFilters, { emptyFilters } from "../../components/department/DepartmentFilters";
import DepartmentTable from "../../components/department/DepartmentTable";
import DepartmentFormModal from "../../components/department/DepartmentFormModal";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import { getApiErrorMessage } from "../../utils/apiError";

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [creating, setCreating] = useState(false);
  const { status, ...backendFilters } = filters;
  const query = useDepartments(backendFilters);
  const managers = useManagerOptions();
  const { create } = useDepartmentActions();
  const pagination = query.data?.pagination;
  const departments = useMemo(() => {
    const rows = query.data?.departments || [];
    if (status === "") return rows;
    return rows.filter((row) => row.isActive === (status === "true"));
  }, [query.data, status]);

  const submitCreate = async (payload) => {
    try { await create.mutateAsync(payload); toast.success("Department created successfully."); setCreating(false); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  return <div className="mt-6 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">Departments</h1><p className="mt-1 text-sm text-slate-600">Organize teams, assign department heads, and manage status.</p></div>
      <Button onClick={() => setCreating(true)}><Plus size={16} />New department</Button>
    </div>
    <DepartmentFilters filters={filters} onChange={setFilters} />
    {query.isLoading ? <Loader label="Loading departments…" /> : query.isError ? <DashboardError error={query.error} onRetry={query.refetch} /> : <>
      <DepartmentTable departments={departments} onView={(row) => navigate(`/departments/${row._id}`)} />
      <Pagination page={pagination?.page || 1} totalPages={pagination?.totalPages || 1} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
    </>}
    <DepartmentFormModal open={creating} managers={managers.data?.users || []} loading={create.isPending} onClose={() => setCreating(false)} onSubmit={submitCreate} />
  </div>;
}
