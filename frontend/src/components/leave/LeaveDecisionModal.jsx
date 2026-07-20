import { useState } from "react";
import Modal from "../ui/Modal";
import TextArea from "../ui/TextArea";
import Button from "../ui/Button";
export default function LeaveDecisionModal({ request, action, onClose, onSubmit, loading }) { const [comment, setComment] = useState(""); if (!request) return null; const rejecting = action === "reject"; return <Modal open onClose={onClose} title={`${rejecting ? "Reject" : "Approve"} Leave Request`}><p className="mb-4 text-sm text-slate-600">{request.userId?.name || "Employee"} · {request.leaveTypeId?.name}</p><TextArea label={rejecting ? "Rejection reason" : "Comment (optional)"} value={comment} onChange={(event) => setComment(event.target.value)} required={rejecting} /><div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={rejecting ? "danger" : "primary"} loading={loading} onClick={() => onSubmit(comment)}>{rejecting ? "Reject" : "Approve"}</Button></div></Modal>; }
