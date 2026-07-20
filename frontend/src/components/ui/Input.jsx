export default function Input({ label, error, className = "", ...props }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}</span><input className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 ${error ? "border-rose-500" : "border-slate-300"} ${className}`} {...props} />{error && <span className="text-xs text-rose-600">{error}</span>}</label>;
}
