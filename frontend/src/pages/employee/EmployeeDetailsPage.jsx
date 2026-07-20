import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import { useDepartmentOptions, useEmployee, useEmployeeActions, useManagerOptions } from "../../hooks/useEmployees";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EditEmployeeModal from "../../components/employee/EditEmployeeModal";
import AssignmentModal from "../../components/employee/AssignmentModal";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/attendance";
import { canManage, genderText, roleLabels, roleText, roleTone } from "../../utils/employee";

const Row = ({ label, value }) => <div className="flex justify-between gap-4 py-2 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value ?? "—"}</span></div>;

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = useEmployee(id);
  const actions = useEmployeeActions();
  const [dialog, setDialog] = useState(null);
  const isAdmin = user.role === "admin";
  const isManager = canManage(user.role);
  const departments = useDepartmentOptions(isManager);
  const managers = useManagerOptions(isManager);

  if (query.isLoading) return <Loader label="Loading employee…" />;
  if (query.isError) return <DashboardError error={query.error} onRetry={query.refetch} />;
  const employee = query.data?.user;
  if (!employee) return <DashboardError error={{}} onRetry={query.refetch} />;

  const run = async (mutation, variables, message) => {
    try { await mutation.mutateAsync({ id, ...variables }); toast.success(message); setDialog(null); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };
  return <div className="mt-6 space-y-5">
    <button onClick={() => navigate("/employees")} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700"><ArrowLeft size={16} />Back to directory</button>
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <Avatar name={employee.name} src={employee.profilePicture?.url} className="size-20 text-2xl" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{employee.name}</h1>
          <p className="text-sm text-slate-500">{employee.email}</p>
          <div className="mt-3 flex gap-2"><Badge tone={roleTone(employee.role)}>{roleText(employee.role)}</Badge><Badge tone={employee.isActive ? "success" : "danger"}>{employee.isActive ? "Active" : "Inactive"}</Badge></div>
        </div>
        {isManager && <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
          <Button className="w-full" variant="secondary" onClick={() => setDialog("edit")}>Edit employee</Button>
          <Button className="w-full" variant="secondary" onClick={() => setDialog("department")}>Assign department</Button>
          <Button className="w-full" variant="secondary" onClick={() => setDialog("manager")}>Assign manager</Button>
          {isAdmin && <Button className="w-full" variant="secondary" onClick={() => setDialog("role")}>Change role</Button>}
          {isAdmin && <Button className="w-full" variant={employee.isActive ? "danger" : "primary"} onClick={() => setDialog("status")}>{employee.isActive ? "Deactivate" : "Activate"}</Button>}
        </div>}
      </Card>
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Employment</h2><div className="divide-y divide-slate-100"><Row label="Role" value={roleText(employee.role)} /><Row label="Status" value={employee.isActive ? "Active" : "Inactive"} /><Row label="Department" value={employee.departmentId?.name} /><Row label="Manager" value={employee.managerId?.name} /><Row label="Joining date" value={formatDate(employee.joiningDate)} /></div></Card>
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Personal</h2><div className="divide-y divide-slate-100"><Row label="Date of birth" value={formatDate(employee.dateOfBirth)} /><Row label="Gender" value={genderText(employee.gender)} /><Row label="Blood group" value={employee.bloodGroup} /></div></Card>
        <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Contact</h2><div className="divide-y divide-slate-100"><Row label="Phone" value={employee.phoneNumber} /><Row label="Address" value={employee.address} /><Row label="Emergency contact" value={employee.emergencyContact?.name} /><Row label="Emergency phone" value={employee.emergencyContact?.phoneNumber} /></div></Card>
      </div>
    </div>

    {dialog === "edit" && <EditEmployeeModal employee={employee} loading={actions.update.isPending} onClose={() => setDialog(null)} onSubmit={(payload) => run(actions.update, { payload }, "Employee updated successfully.")} />}
    <AssignmentModal open={dialog === "department"} title="Assign department" label="Department" allowNone noneLabel="No department" value={employee.departmentId?._id || ""} options={(departments.data?.departments || []).map((d) => ({ value: d._id, label: d.name }))} loading={actions.changeDepartment.isPending} onClose={() => setDialog(null)} onSubmit={(departmentId) => run(actions.changeDepartment, { departmentId }, "Department updated successfully.")} />
    <AssignmentModal open={dialog === "manager"} title="Assign manager" label="Manager" allowNone noneLabel="No manager" value={employee.managerId?._id || ""} options={(managers.data?.users || []).filter((m) => m._id !== employee._id).map((m) => ({ value: m._id, label: `${m.name} (${m.email})` }))} loading={actions.changeManager.isPending} onClose={() => setDialog(null)} onSubmit={(managerId) => run(actions.changeManager, { managerId }, "Manager updated successfully.")} />
    <AssignmentModal open={dialog === "role"} title="Change role" label="Role" value={employee.role} options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))} loading={actions.changeRole.isPending} onClose={() => setDialog(null)} onSubmit={(role) => run(actions.changeRole, { role }, "Role updated successfully.")} />
    <ConfirmDialog open={dialog === "status"} title={employee.isActive ? "Deactivate employee" : "Activate employee"} message={`Are you sure you want to ${employee.isActive ? "deactivate" : "activate"} ${employee.name}?`} confirmLabel={employee.isActive ? "Deactivate" : "Activate"} loading={actions.setStatus.isPending} onClose={() => setDialog(null)} onConfirm={() => run(actions.setStatus, { isActive: !employee.isActive }, "Status updated successfully.")} />
  </div>;
}
