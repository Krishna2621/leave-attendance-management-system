import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import useAuth from "../../hooks/useAuth";
import { useDepartmentOptions, useManagerOptions } from "../../hooks/useEmployees";
import { createEmployeeRequest } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiError";

export default function RegisterPage() {
  const { user } = useAuth();
  const departments = useDepartmentOptions();
  const managers = useManagerOptions();
  const [creating, setCreating] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { name: "", email: "", departmentId: "", managerId: "", role: "employee", joiningDate: "" } });
  const onSubmit = async (values) => {
    setCreating(true);
    try {
      const { data } = await createEmployeeRequest({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase(), departmentId: values.departmentId || null, managerId: values.managerId || null });
      setTemporaryPassword(data.data.temporaryPassword);
      toast.success(data.message || "Employee created successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create employee."));
    } finally { setCreating(false); }
  };
  const copyPassword = async () => {
    await navigator.clipboard.writeText(temporaryPassword);
    toast.success("Temporary password copied.");
  };
  return <main className="min-h-screen bg-slate-50 p-6 sm:p-10"><form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="mb-8 flex items-start justify-between gap-4"><div><div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-800"><UserPlus size={22} /></div><h1 className="text-2xl font-bold text-slate-900">Add employee</h1><p className="mt-2 text-sm text-slate-600">A secure temporary password will be generated for the employee.</p></div><Link to="/employees" className="text-sm font-semibold text-teal-700 hover:text-teal-800">Back to employees</Link></div>{temporaryPassword && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-900">Share this temporary password securely</p><div className="mt-2 flex items-center gap-3"><code className="min-w-0 flex-1 break-all rounded bg-white px-3 py-2 text-sm text-slate-900">{temporaryPassword}</code><Button type="button" variant="secondary" onClick={copyPassword}><Copy size={16} /> Copy</Button></div><p className="mt-2 text-sm text-amber-800">It is shown only now. The employee must change it after signing in.</p></div>}<div className="grid gap-5 sm:grid-cols-2"><Input label="Full name" placeholder="Employee full name" error={errors.name?.message} {...register("name", { required: "Full name is required" })} /><Input label="Email address" type="email" placeholder="employee@company.com" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" } })} /><Select label="Department" error={errors.departmentId?.message} {...register("departmentId")}><option value="">No department</option>{(departments.data?.departments || []).map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</Select><Select label="Manager" error={errors.managerId?.message} {...register("managerId")}><option value="">No manager</option>{(managers.data?.users || []).map((manager) => <option key={manager._id} value={manager._id}>{manager.name}</option>)}</Select><Select label="Role" error={errors.role?.message} {...register("role", { required: "Role is required" })}><option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>{user?.role === "admin" && <option value="admin">Admin</option>}</Select><Input label="Joining date" type="date" error={errors.joiningDate?.message} {...register("joiningDate", { required: "Joining date is required" })} /></div><Button type="submit" className="mt-7 w-full" loading={creating}>Create employee</Button></form></main>;
}
