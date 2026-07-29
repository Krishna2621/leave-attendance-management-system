import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { setPasswordRequest } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/apiError";

export default function SetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });
  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await setPasswordRequest(token, values);
      toast.success("Password set. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to set password."));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"
      >
        <div className="mb-8">
          <div className="mb-4 grid size-11 place-items-center rounded-xl bg-teal-100 text-teal-800">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set your password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a secure password to activate your LeaveFlow account.
          </p>
        </div>
        <div className="space-y-5">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              maxLength: { value: 128, message: "Password must be at most 128 characters" },
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === getValues("password") || "Passwords do not match",
            })}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Set password
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Back to login
          </Link>
        </p>
      </form>
    </main>
  );
}
