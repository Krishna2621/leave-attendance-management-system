import { Clock3 } from "lucide-react";
import Card from "../ui/Card";

export default function ReportComingSoon({ title = "Coming Soon", description }) {
  return <Card className="p-10 text-center">
    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Clock3 size={26} /></span>
    <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
  </Card>;
}
