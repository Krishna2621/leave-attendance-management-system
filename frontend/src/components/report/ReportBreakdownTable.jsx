import Card from "../ui/Card";
import EmptyState from "../common/EmptyState";

export default function ReportBreakdownTable({ title, detail, label, rows = [], accessor }) {
  return <Card className="p-5">
    <h2 className="font-semibold text-slate-900">{title}</h2>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
    {rows.length ? <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2.5 pr-4 font-semibold">{label}</th>
            <th className="px-4 py-2.5 text-right font-semibold">Present</th>
            <th className="px-4 py-2.5 text-right font-semibold">Absent</th>
            <th className="px-4 py-2.5 text-right font-semibold">Half day</th>
            <th className="px-4 py-2.5 text-right font-semibold">Late</th>
            <th className="px-4 py-2.5 text-right font-semibold">Hours</th>
            <th className="py-2.5 pl-4 text-right font-semibold">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => <tr key={accessor(row)._id || accessor(row).name} className="text-slate-700">
            <td className="py-2.5 pr-4 font-medium text-slate-900">{accessor(row).name}</td>
            <td className="px-4 py-2.5 text-right">{row.presentDays}</td>
            <td className="px-4 py-2.5 text-right">{row.absentDays}</td>
            <td className="px-4 py-2.5 text-right">{row.halfDays}</td>
            <td className="px-4 py-2.5 text-right">{row.lateArrivals}</td>
            <td className="px-4 py-2.5 text-right">{row.totalHoursWorked}</td>
            <td className="py-2.5 pl-4 text-right"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${row.attendanceRate >= 90 ? "bg-teal-50 text-teal-700" : row.attendanceRate >= 75 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{row.attendanceRate}%</span></td>
          </tr>)}
        </tbody>
      </table>
    </div> : <div className="mt-4"><EmptyState title="No breakdown available" description="There are no records for this grouping in the selected range." /></div>}
  </Card>;
}
