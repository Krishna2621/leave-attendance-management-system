import { useState } from "react";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Button from "../ui/Button";

export default function AssignmentModal({ open, title, label, options, value, allowNone = false, noneLabel = "None", onClose, onSubmit, loading }) {
  const [selected, setSelected] = useState(value ?? "");
  if (!open) return null;
  return <Modal open onClose={onClose} title={title}>
    <div className="space-y-4">
      <Select label={label} value={selected} onChange={(event) => setSelected(event.target.value)}>
        {allowNone && <option value="">{noneLabel}</option>}
        {!allowNone && <option value="" disabled>Select an option</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
      <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={loading} disabled={!allowNone && !selected} onClick={() => onSubmit(selected)}>Save</Button></div>
    </div>
  </Modal>;
}
