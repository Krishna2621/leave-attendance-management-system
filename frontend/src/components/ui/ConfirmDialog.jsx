import Modal from "./Modal";
import Button from "./Button";
export default function ConfirmDialog({ open, onClose, onConfirm, title = "Confirm action", message, confirmLabel = "Confirm", loading }) { return <Modal open={open} onClose={onClose} title={title}><p className="text-sm text-slate-600">{message}</p><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button></div></Modal>; }
