import Badge from "../ui/Badge";
import { statusTone } from "../../utils/attendance";
export default function AttendanceStatusBadge({ status }) { return <Badge tone={statusTone(status)}>{status?.replace("-", " ") || "unknown"}</Badge>; }
