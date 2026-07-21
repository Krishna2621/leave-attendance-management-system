import { CalendarCheck, CalendarX, Clock, Percent, Timer, UserCheck } from "lucide-react";
import StatCard from "../dashboard/StatCard";

export default function ReportSummaryCards({ summary }) {
  const cards = [
    { icon: CalendarCheck, title: "Present Days", value: summary.presentDays, subtitle: `${summary.effectivePresentDays} effective (incl. half-days)`, tone: "teal" },
    { icon: CalendarX, title: "Absent Days", value: summary.absentDays, subtitle: `${summary.halfDays} half-days recorded`, tone: "rose" },
    { icon: Clock, title: "Late Arrivals", value: summary.lateArrivals, subtitle: `Across ${summary.totalRecords} records`, tone: "amber" },
    { icon: Percent, title: "Attendance Rate", value: `${summary.attendanceRate}%`, subtitle: "Of non-holiday records", tone: "blue" },
    { icon: Timer, title: "Hours Worked", value: summary.totalHoursWorked, subtitle: `${summary.averageHoursWorked} avg / record`, tone: "violet" },
    { icon: UserCheck, title: "Total Records", value: summary.totalRecords, subtitle: `${summary.holidayDays} holidays`, tone: "teal" },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <StatCard key={card.title} {...card} />)}</div>;
}
