const variants = { primary: "bg-teal-700 text-white hover:bg-teal-800", secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200", danger: "bg-rose-600 text-white hover:bg-rose-700", ghost: "text-slate-600 hover:bg-slate-100" };

export default function Button({ children, className = "", variant = "primary", type = "button", loading = false, ...props }) {
  return <button type={type} disabled={loading || props.disabled} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`} {...props}>{loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{children}</button>;
}
