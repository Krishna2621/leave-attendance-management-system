import Table from "../common/Table";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { roleText, roleTone } from "../../utils/employee";

export default function EmployeeTable({ employees, onView }) {
  const columns = [
    { key: "name", label: "Employee", render: (row) => <div className="flex items-center gap-3"><Avatar name={row.name} src={row.profilePicture?.url} /><div><p className="font-medium text-slate-800">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></div></div> },
    { key: "role", label: "Role", render: (row) => <Badge tone={roleTone(row.role)}>{roleText(row.role)}</Badge> },
    { key: "department", label: "Department", render: (row) => row.departmentId?.name || "—" },
    { key: "manager", label: "Manager", render: (row) => row.managerId?.name || "—" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.isActive ? "success" : "danger"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "actions", label: "", render: (row) => <Button variant="ghost" onClick={() => onView(row)}>View</Button> },
  ];
  return <Table columns={columns} data={employees} keyField="_id" emptyMessage="No employees match the current filters." />;
}
