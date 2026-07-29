import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MailCheck, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import useAuth from "../../hooks/useAuth";
import { useDepartmentOptions, useManagerOptions } from "../../hooks/useEmployees";
import {
  createEmployeeRequest,
  sendEmployeeOtpRequest,
  verifyEmployeeOtpRequest,
} from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiError";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const departments = useDepartmentOptions();
  const managers = useManagerOptions();
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creating, setCreating] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      departmentId: "",
      managerId: "",
      role: "employee",
      joiningDate: "",
      otp: "",
    },
  });

  const email = () => getValues("email").trim().toLowerCase();
  const sendOtp = async () => {
    if (!(await trigger("email"))) return;
    setSendingOtp(true);
    try {
      await sendEmployeeOtpRequest(email());
      setOtpSent(true);
      setEmailVerified("");
      toast.success("Verification code sent to the employee email.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to send verification code."));
    } finally {
      setSendingOtp(false);
    }
  };
  const verifyOtp = async () => {
    if (!(await trigger(["email", "otp"]))) return;
    setVerifyingOtp(true);
    try {
      await verifyEmployeeOtpRequest(email(), getValues("otp").trim());
      setEmailVerified(email());
      toast.success("Employee email verified.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to verify code."));
    } finally {
      setVerifyingOtp(false);
    }
  };
  const onSubmit = async (values) => {
    if (emailVerified !== email()) {
      toast.error("Verify this employee email before creating the account.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await createEmployeeRequest({
        name: values.name.trim(),
        email: email(),
        departmentId: values.departmentId || null,
        managerId: values.managerId || null,
        role: values.role,
        joiningDate: values.joiningDate,
      });
      toast.success(data.message || "Employee created successfully.");
      navigate("/employees", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create employee."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-800">
              <UserPlus size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Add employee</h1>
            <p className="mt-2 text-sm text-slate-600">
              Verify the employee email before creating their LeaveFlow account.
            </p>
          </div>
          <Link to="/employees" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            Back to employees
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Employee full name"
            error={errors.name?.message}
            {...register("name", { required: "Full name is required" })}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="employee@company.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              onChange: () => setEmailVerified(""),
            })}
          />
          <Select
            label="Department"
            error={errors.departmentId?.message}
            {...register("departmentId")}
          >
            <option value="">No department</option>
            {(departments.data?.departments || []).map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </Select>
          <Select label="Manager" error={errors.managerId?.message} {...register("managerId")}>
            <option value="">No manager</option>
            {(managers.data?.users || []).map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name}
              </option>
            ))}
          </Select>
          <Select
            label="Role"
            error={errors.role?.message}
            {...register("role", { required: "Role is required" })}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            {user?.role === "admin" && <option value="admin">Admin</option>}
          </Select>
          <Input
            label="Joining date"
            type="date"
            error={errors.joiningDate?.message}
            {...register("joiningDate", { required: "Joining date is required" })}
          />
        </div>
        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <Input
                label="Email verification"
                value={otpSent ? "Code sent" : "Send a code to the email above"}
                readOnly
              />
            </div>
            <Button loading={sendingOtp} onClick={sendOtp}>
              Send OTP
            </Button>
          </div>
          {otpSent && (
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <Input
                  label="6-digit OTP"
                  inputMode="numeric"
                  maxLength="6"
                  error={errors.otp?.message}
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: { value: /^\d{6}$/, message: "Enter the 6-digit OTP" },
                  })}
                />
              </div>
              <Button variant="secondary" loading={verifyingOtp} onClick={verifyOtp}>
                <MailCheck size={17} /> Verify OTP
              </Button>
            </div>
          )}
          {emailVerified === email() && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Email verified. You can create the employee account.
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="mt-7 w-full"
          loading={creating}
          disabled={emailVerified !== email()}
        >
          Create employee
        </Button>
      </form>
    </main>
  );
}
