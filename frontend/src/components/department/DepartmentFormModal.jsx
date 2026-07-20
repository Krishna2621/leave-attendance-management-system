import { useForm } from "react-hook-form";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Select from "../ui/Select";
import Button from "../ui/Button";

export default function DepartmentFormModal({ open, department, managers = [], onClose, onSubmit, loading }) {
  const editing = Boolean(department);
  const { register, handleSubmit, formState: { errors } } = useForm({
    values: {
      name: department?.name || "",
      description: department?.description || "",
      managerId: department?.managerId?._id || "",
      isActive: department ? String(department.isActive) : "true",
    },
  });
  if (!open) return null;
  const submit = (values) => {
    const payload = { name: values.name.trim(), description: values.description.trim(), managerId: values.managerId || null };
    if (editing) payload.isActive = values.isActive === "true";
    onSubmit(payload);
  };
  return <Modal open onClose={onClose} title={editing ? "Edit Department" : "Create Department"}>
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <Input label="Name" error={errors.name?.message} {...register("name", { required: "Department name is required", minLength: { value: 2, message: "Name must be at least 2 characters" }, maxLength: { value: 100, message: "Name cannot exceed 100 characters" } })} />
      <TextArea label="Description" rows="3" error={errors.description?.message} {...register("description", { maxLength: { value: 500, message: "Description cannot exceed 500 characters" } })} />
      <Select label="Department head (manager)" {...register("managerId")}><option value="">No head assigned</option>{managers.map((manager) => <option key={manager._id} value={manager._id}>{manager.name} ({manager.email})</option>)}</Select>
      {editing && <Select label="Status" {...register("isActive")}><option value="true">Active</option><option value="false">Inactive</option></Select>}
      <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>{editing ? "Save changes" : "Create department"}</Button></div>
    </form>
  </Modal>;
}
