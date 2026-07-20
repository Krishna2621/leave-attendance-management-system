import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useDepartment, useDepartmentActions } from "../../hooks/useDepartments";
import { useManagerOptions } from "../../hooks/useEmployees";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DepartmentFormModal from "../../components/department/DepartmentFormModal";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/attendance";

const Row = ({ label, value }) => <div className="flex justify-between gap-4 py-2 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value ?? "—"}</span></div>;

export default function DepartmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = useDepartment(id);
  const managers = useManagerOptions();
  const { update, remove } = useDepartmentActions();
  const [dialog, setDialog] = useState(null);
  const isAdmin = user.role === "admin";

  if (query.isLoading) return <Loader label="Loading department…" />;
  if (query.isError) return <DashboardError error={query.error} onRetry={query.refetch} />;
  const department = query.data?.department;
  if (!department) return <DashboardError error={{}} onRetry={query.refetch} />;

  const submitEdit = async (payload) => {
    try { await update.mutateAsync({ id, payload }); toast.success("Department updated successfully."); setDialog(null); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };
  const submitDelete = async () => {
    try { await remove.mutateAsync(id); toast.success("Department deleted successfully."); navigate("/departments"); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  return <div className="mt-6 space-y-5">
    <button onClick={() => navigate("/departments")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"><ArrowLeft size={16} />Back to departments</button>
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <div className="text-center"><h1 className="text-xl font-bold text-slate-900">{department.name}</h1><div className="mt-3"><Badge tone={department.isActive ? "success" : "danger"}>{department.isActive ? "Active" : "Inactive"}</Badge></div></div>
        <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
          <Button className="w-full" variant="secondary" onClick={() => setDialog("edit")}>Edit department</Button>
          {isAdmin && <Button className="w-full" variant="danger" onClick={() => setDialog("delete")}>Delete department</Button>}
        </div>
      </Card>
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Overview</h2><div className="divide-y divide-slate-100"><Row label="Name" value={department.name} /><Row label="Status" value={department.isActive ? "Active" : "Inactive"} /><Row label="Department head" value={department.managerId?.name} /><Row label="Head email" value={department.managerId?.email} /></div></Card>
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Description</h2><p className="text-sm text-slate-700">{department.description || "No description provided."}</p></Card>
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Timeline</h2><div className="divide-y divide-slate-100"><Row label="Created" value={formatDate(department.createdAt)} /><Row label="Last updated" value={formatDate(department.updatedAt)} /></div></Card>
      </div>
    </div>
    <DepartmentFormModal open={dialog === "edit"} department={department} managers={managers.data?.users || []} loading={update.isPending} onClose={() => setDialog(null)} onSubmit={submitEdit} />
    <ConfirmDialog open={dialog === "delete"} title="Delete department" message={`Delete ${department.name}? This cannot be undone and only works if no employees are assigned.`} confirmLabel="Delete" loading={remove.isPending} onClose={() => setDialog(null)} onConfirm={submitDelete} />
  </div>;
}
