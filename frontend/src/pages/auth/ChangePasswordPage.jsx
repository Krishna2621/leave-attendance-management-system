import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAuth from "../../hooks/useAuth";
import { changePasswordRequest } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiError";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await changePasswordRequest(values);
      updateUser({ forcePasswordChange: false });
      toast.success("Password changed successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to change password."));
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="mb-8"><div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-800"><KeyRound size={22} /></div><h1 className="text-2xl font-bold text-slate-900">Change your password</h1><p className="mt-2 text-sm text-slate-600">Use your temporary password once, then choose a new secure password.</p></div><div className="space-y-5"><Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword", { required: "Current password is required" })} /><Input label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword", { required: "New password is required", minLength: { value: 8, message: "Password must be at least 8 characters" }, maxLength: { value: 128, message: "Password must be at most 128 characters" } })} /><Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Please confirm your new password", validate: (value) => value === getValues("newPassword") || "Passwords do not match" })} /><Button type="submit" className="w-full" loading={submitting}>Change password</Button></div></form></main>;
}
