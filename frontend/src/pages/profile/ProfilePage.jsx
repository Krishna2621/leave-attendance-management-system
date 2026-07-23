import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Camera, CheckCircle2, Circle } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useProfile, useProfileActions } from "../../hooks/useProfile";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import TextArea from "../../components/ui/TextArea";
import Select from "../../components/ui/Select";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/attendance";
import { genderText, roleText, roleTone } from "../../utils/employee";
import { getProfileCompletion } from "../../utils/profileCompletion";

const Row = ({ label, value }) => <div className="flex justify-between gap-4 py-2 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-800">{value ?? "—"}</span></div>;
const validImageTypes = ["image/jpeg", "image/png"];

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const query = useProfile();
  const { update, uploadPicture } = useProfileActions();
  const fileInput = useRef(null);
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  if (query.isLoading) return <Loader label="Loading your profile…" />;
  if (query.isError) return <DashboardError error={query.error} onRetry={query.refetch} />;
  const profile = query.data?.user;
  if (!profile) return <DashboardError error={{}} onRetry={query.refetch} />;
  const completion = getProfileCompletion(profile);

  const startEditing = () => {
    reset({
      name: profile.name || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: profile.gender || "",
      bloodGroup: profile.bloodGroup || "",
      emergencyName: profile.emergencyContact?.name || "",
      emergencyPhone: profile.emergencyContact?.phoneNumber || "",
    });
    setEditing(true);
  };

  const submit = async (values) => {
    const payload = {};
    if (values.name.trim()) payload.name = values.name.trim();
    if (values.phoneNumber.trim()) payload.phoneNumber = values.phoneNumber.trim();
    if (values.address.trim()) payload.address = values.address.trim();
    if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
    if (values.gender) payload.gender = values.gender;
    if (values.bloodGroup) payload.bloodGroup = values.bloodGroup;
    if (values.emergencyName.trim() || values.emergencyPhone.trim()) payload.emergencyContact = { name: values.emergencyName.trim(), phoneNumber: values.emergencyPhone.trim() };
    if (!Object.keys(payload).length) { toast.error("Update at least one field."); return; }
    try { const data = await update.mutateAsync(payload); if (payload.name) updateUser({ name: data.user?.name || payload.name }); toast.success("Profile updated successfully."); setEditing(false); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  const onPickFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!validImageTypes.includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Use a JPG, JPEG, or PNG image up to 5 MB."); return; }
    try { const data = await uploadPicture.mutateAsync(file); updateUser({ profilePicture: data.profilePicture }); toast.success("Profile picture updated."); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  return <div className="mt-6 space-y-5">
    <div><h1 className="text-2xl font-bold text-slate-900">My Profile</h1><p className="mt-1 text-sm text-slate-600">View and update your personal information.</p></div>
    {completion.isComplete ? <Card className="border-emerald-100 bg-emerald-50 p-5"><div className="flex gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={24} aria-hidden="true" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-emerald-950">Profile Completed</h2><Badge tone="success">✓ All required fields completed</Badge></div><p className="mt-1 text-sm font-medium text-emerald-800">Congratulations! Your employee profile is fully completed.</p><p className="mt-3 text-sm leading-6 text-emerald-900/80">Thank you for keeping your information up to date. All required profile information has been provided.</p></div></div></Card> : <Card className="p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-slate-900">Profile Completion</h2><p className="mt-1 text-sm text-slate-600">{completion.completedRequiredFields} of {completion.totalRequiredFields} required fields completed</p></div><span className="text-lg font-bold text-teal-700">{completion.percentage}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Profile completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completion.percentage}><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${completion.percentage}%` }} /></div><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">{completion.fields.map((field) => <li key={field.key} className={`flex items-center gap-2 ${field.complete ? "text-emerald-700" : "text-slate-500"}`}>{field.complete ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={17} className="text-rose-500" aria-hidden="true" />}<span>{field.label}</span><span className="sr-only">{field.complete ? "completed" : "pending"}</span></li>)}</ul></Card>}
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Avatar name={profile.name} src={profile.profilePicture?.url} className="size-24 text-3xl" />
            <button type="button" onClick={() => fileInput.current?.click()} disabled={uploadPicture.isPending} className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-teal-700 text-white shadow hover:bg-teal-800 disabled:opacity-60" aria-label="Change profile picture"><Camera size={16} /></button>
            <input ref={fileInput} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" onChange={onPickFile} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <div className="mt-3"><Badge tone={roleTone(profile.role)}>{roleText(profile.role)}</Badge></div>
          {uploadPicture.isPending && <p className="mt-3 text-xs text-slate-500">Uploading…</p>}
        </div>
      </Card>
      <div className="space-y-5 lg:col-span-2">
        {editing ? <Card className="p-6"><form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <h2 className="font-semibold text-slate-900">Edit profile</h2>
          <Input label="Full name" error={errors.name?.message} {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone number" placeholder="+15551234567" error={errors.phoneNumber?.message} {...register("phoneNumber", { pattern: { value: /^\+?[1-9]\d{6,14}$/, message: "Enter a valid phone number" } })} />
            <Select label="Gender" {...register("gender")}><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Date of birth" type="date" {...register("dateOfBirth")} />
            <Select label="Blood group" {...register("bloodGroup")}><option value="">Not set</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}</Select>
          </div>
          <TextArea label="Address" rows="2" {...register("address")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Emergency contact name" {...register("emergencyName")} />
            <Input label="Emergency contact phone" placeholder="+15551234567" error={errors.emergencyPhone?.message} {...register("emergencyPhone", { pattern: { value: /^\+?[1-9]\d{6,14}$/, message: "Enter a valid phone number" } })} />
          </div>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" loading={update.isPending}>Save changes</Button></div>
        </form></Card> : <>
          <Card className="p-6"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Personal & contact</h2><Button variant="secondary" onClick={startEditing}>Edit profile</Button></div><div className="divide-y divide-slate-100"><Row label="Phone" value={profile.phoneNumber} /><Row label="Address" value={profile.address} /><Row label="Date of birth" value={formatDate(profile.dateOfBirth)} /><Row label="Gender" value={genderText(profile.gender)} /><Row label="Blood group" value={profile.bloodGroup} /><Row label="Emergency contact" value={profile.emergencyContact?.name} /><Row label="Emergency phone" value={profile.emergencyContact?.phoneNumber} /></div></Card>
          <Card className="p-6"><h2 className="mb-2 font-semibold text-slate-900">Employment</h2><div className="divide-y divide-slate-100"><Row label="Role" value={roleText(profile.role)} /><Row label="Department" value={profile.departmentId?.name} /><Row label="Manager" value={profile.managerId?.name} /><Row label="Joining date" value={formatDate(profile.joiningDate)} /></div></Card>
        </>}
      </div>
    </div>
  </div>;
}
