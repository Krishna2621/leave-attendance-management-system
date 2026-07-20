import Table from "../common/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function DepartmentTable({ departments, onView }) {
  const columns = [
    { key: "name", label: "Department", render: (row) => <div><p className="font-medium text-slate-800">{row.name}</p>{row.description && <p className="max-w-xs truncate text-xs text-slate-500">{row.description}</p>}</div> },
    { key: "head", label: "Department head", render: (row) => row.managerId?.name || "—" },
    { key: "status", label: "Status", render: (row) => <Badge tone={row.isActive ? "success" : "danger"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "actions", label: "", render: (row) => <Button variant="ghost" onClick={() => onView(row)}>View</Button> },
  ];
  return <Table columns={columns} data={departments} keyField="_id" emptyMessage="No departments match the current filters." />;
}
