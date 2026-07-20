import { useForm } from "react-hook-form";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import Button from "../ui/Button";

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

export default function EditEmployeeModal({ employee, onClose, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    values: {
      name: employee?.name || "",
      phoneNumber: employee?.phoneNumber || "",
      address: employee?.address || "",
      dateOfBirth: toDateInput(employee?.dateOfBirth),
      joiningDate: toDateInput(employee?.joiningDate),
      gender: employee?.gender || "",
      bloodGroup: employee?.bloodGroup || "",
      emergencyName: employee?.emergencyContact?.name || "",
      emergencyPhone: employee?.emergencyContact?.phoneNumber || "",
    },
  });
  if (!employee) return null;
  const submit = (values) => {
    const payload = {};
    if (values.name.trim()) payload.name = values.name.trim();
    if (values.phoneNumber.trim()) payload.phoneNumber = values.phoneNumber.trim();
    if (values.address.trim()) payload.address = values.address.trim();
    if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
    if (values.joiningDate) payload.joiningDate = values.joiningDate;
    if (values.gender) payload.gender = values.gender;
    if (values.bloodGroup) payload.bloodGroup = values.bloodGroup;
    if (values.emergencyName.trim() || values.emergencyPhone.trim()) payload.emergencyContact = { name: values.emergencyName.trim(), phoneNumber: values.emergencyPhone.trim() };
    onSubmit(payload);
  };
  return <Modal open onClose={onClose} title="Edit Employee">
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <Input label="Full name" error={errors.name?.message} {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone number" placeholder="+15551234567" error={errors.phoneNumber?.message} {...register("phoneNumber", { pattern: { value: /^\+?[1-9]\d{6,14}$/, message: "Enter a valid phone number" } })} />
        <Select label="Gender" {...register("gender")}><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Date of birth" type="date" {...register("dateOfBirth")} />
        <Input label="Joining date" type="date" {...register("joiningDate")} />
      </div>
      <Select label="Blood group" {...register("bloodGroup")}><option value="">Not set</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}</Select>
      <TextArea label="Address" rows="2" {...register("address")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Emergency contact name" {...register("emergencyName")} />
        <Input label="Emergency contact phone" placeholder="+15551234567" error={errors.emergencyPhone?.message} {...register("emergencyPhone", { pattern: { value: /^\+?[1-9]\d{6,14}$/, message: "Enter a valid phone number" } })} />
      </div>
      <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>Save changes</Button></div>
    </form>
  </Modal>;
}
