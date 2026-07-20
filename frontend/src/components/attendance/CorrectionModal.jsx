import { useForm } from "react-hook-form";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import TextArea from "../ui/TextArea";
import Button from "../ui/Button";
import { toDateTimeLocal } from "../../utils/attendance";
export default function CorrectionModal({ record, onClose, onSubmit, loading }) { const { register, handleSubmit, formState: { errors } } = useForm({ values: { punchIn: toDateTimeLocal(record?.punchIn), punchOut: toDateTimeLocal(record?.punchOut), correctionReason: "" } }); if (!record) return null; return <Modal open onClose={onClose} title="Correct Attendance"><form className="space-y-4" onSubmit={handleSubmit(onSubmit)}><Input label="Check-in" type="datetime-local" error={errors.punchIn?.message} {...register("punchIn", { required: "Check-in time is required" })} /><Input label="Check-out" type="datetime-local" error={errors.punchOut?.message} {...register("punchOut", { required: "Check-out time is required" })} /><TextArea label="Correction reason" rows="3" error={errors.correctionReason?.message} {...register("correctionReason", { required: "A correction reason is required" })} /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={loading}>Save correction</Button></div></form></Modal>; }
