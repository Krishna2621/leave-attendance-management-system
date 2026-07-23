import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { getApiErrorMessage } from "../../utils/apiError";

const PasswordInput = ({ label, error, visible, onToggle, ...props }) => (
  <div className="relative">
    <Input label={label} error={error} type={visible ? "text" : "password"} className="pr-11" {...props} />
    <button type="button" onClick={onToggle} className="absolute right-3 top-9 rounded p-1 text-slate-500 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/30" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible}>
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { name: "", email: "", password: "", confirmPassword: "" } });
  const password = watch("password");

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerAccount({ name: values.name.trim(), email: values.email.trim(), password: values.password, confirmPassword: values.confirmPassword });
      toast.success("Account created. Welcome to LeaveFlow!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
    <section className="hidden bg-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="text-2xl font-bold">Leave<span className="text-teal-300">Flow</span></div><div><p className="text-4xl font-bold leading-tight">Your workforce, in perfect flow.</p><p className="mt-4 max-w-md text-teal-100">A simple, secure place for attendance, leave, and people operations.</p></div><p className="text-sm text-teal-200">Leave & Attendance Management System</p></section>
    <section className="grid place-items-center p-6"><form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
      <div className="mb-8"><div className="mb-6 text-xl font-bold text-slate-900 lg:hidden">Leave<span className="text-teal-700">Flow</span></div><div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-800"><UserPlus size={22} /></div><h1 className="text-2xl font-bold text-slate-900">Create your account</h1><p className="mt-2 text-sm text-slate-600">Get started with your LeaveFlow workspace.</p></div>
      <div className="space-y-5">
        <Input label="Full name" autoComplete="name" placeholder="Your full name" error={errors.name?.message} {...register("name", { required: "Full name is required", validate: (value) => value.trim().length > 0 || "Full name is required" })} />
        <Input label="Email address" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" } })} />
        <PasswordInput label="Password" autoComplete="new-password" placeholder="Create a password" error={errors.password?.message} visible={showPassword} onToggle={() => setShowPassword((current) => !current)} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" }, maxLength: { value: 128, message: "Password must be at most 128 characters" } })} />
        <PasswordInput label="Confirm password" autoComplete="new-password" placeholder="Confirm your password" error={errors.confirmPassword?.message} visible={showConfirmation} onToggle={() => setShowConfirmation((current) => !current)} {...register("confirmPassword", { required: "Please confirm your password", validate: (value) => value === password || "Passwords do not match" })} />
        <Button type="submit" className="w-full" loading={submitting}>Create account</Button>
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-teal-700 transition hover:text-teal-800">Log In</Link></p>
    </form></section>
  </main>;
}
