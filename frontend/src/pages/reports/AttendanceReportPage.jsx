import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { useAttendanceReport, useReportDepartmentOptions, useReportEmployeeOptions } from "../../hooks/useReports";
import ReportFilters from "../../components/report/ReportFilters";
import ReportSummaryCards from "../../components/report/ReportSummaryCards";
import { DailyTrendChart, DepartmentAttendanceChart, StatusBreakdownChart } from "../../components/report/ReportCharts";
import ReportBreakdownTable from "../../components/report/ReportBreakdownTable";
import Loader from "../../components/ui/Loader";
import DashboardError from "../../components/dashboard/DashboardError";
import EmptyState from "../../components/common/EmptyState";

const toISODate = (date) => date.toISOString().slice(0, 10);
const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { startDate: toISODate(start), endDate: toISODate(end) };
};
const emptyFilters = () => ({ ...defaultRange(), departmentId: "", userId: "", status: "", isLate: "" });

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const report = useAttendanceReport(filters);
  const departments = useReportDepartmentOptions();
  const employees = useReportEmployeeOptions();

  const generatedAt = report.data?.generatedAt ? new Date(report.data.generatedAt).toLocaleString() : null;
  const summary = report.data?.overallSummary;
  const hasRecords = useMemo(() => Boolean(summary && summary.totalRecords > 0), [summary]);

  return <div className="mt-6 space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Reports</h1>
        <p className="mt-1 text-sm text-slate-600">Analyze attendance across departments, managers, and time.</p>
      </div>
      {generatedAt && <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"><CalendarRange size={15} />Generated {generatedAt}</span>}
    </div>

    <ReportFilters
      filters={filters}
      onChange={setFilters}
      onReset={() => setFilters(emptyFilters())}
      departments={departments.data || []}
      employees={employees.data || []}
      loading={report.isFetching}
    />

    {report.isLoading ? <Loader label="Generating attendance report…" />
      : report.isError ? <DashboardError error={report.error} onRetry={report.refetch} />
        : !hasRecords ? <EmptyState title="No attendance records found" description="No records match the selected date range and filters. Try widening the range." />
          : <>
            <ReportSummaryCards summary={summary} />
            <div className="grid gap-5 xl:grid-cols-2">
              <StatusBreakdownChart summary={summary} />
              <DepartmentAttendanceChart departmentWise={report.data.departmentWise} />
            </div>
            <DailyTrendChart dailyTrend={report.data.dailyTrend} />
            <ReportBreakdownTable
              title="Department Attendance Summary"
              detail="Aggregated attendance metrics grouped by department"
              label="Department"
              rows={report.data.departmentWise}
              accessor={(row) => row.department}
            />
            <ReportBreakdownTable
              title="Manager Attendance Summary"
              detail="Aggregated attendance metrics grouped by reporting manager"
              label="Manager"
              rows={report.data.managerWise}
              accessor={(row) => row.manager}
            />
          </>}
  </div>;
}
