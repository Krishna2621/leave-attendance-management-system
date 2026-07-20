import Badge from "../ui/Badge";
import { leaveTone } from "../../utils/leave";
export default function LeaveStatusBadge({ status }) { return <Badge tone={leaveTone(status)}>{status}</Badge>; }
