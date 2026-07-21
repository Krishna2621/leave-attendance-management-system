import ReportComingSoon from "../../components/report/ReportComingSoon";

export default function LeaveReportPage() {
  return <div className="mt-6 space-y-5">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Leave Reports</h1>
      <p className="mt-1 text-sm text-slate-600">Aggregated leave analytics and summaries.</p>
    </div>
    <ReportComingSoon
      title="Leave Reports Coming Soon"
      description="Backend support for leave reporting is not yet available (the reporting endpoint is scheduled for a later phase). This section will be enabled automatically once the API is live — no leave report requests are being made in the meantime."
    />
  </div>;
}
