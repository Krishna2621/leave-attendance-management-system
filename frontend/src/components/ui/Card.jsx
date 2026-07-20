export default function Card({ children, className = "" }) { return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>; }
