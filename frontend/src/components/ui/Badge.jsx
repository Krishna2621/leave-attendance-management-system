const tones = { success: "bg-emerald-50 text-emerald-700", warning: "bg-amber-50 text-amber-700", danger: "bg-rose-50 text-rose-700", neutral: "bg-slate-100 text-slate-700" };
export default function Badge({ children, tone = "neutral" }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>; }
