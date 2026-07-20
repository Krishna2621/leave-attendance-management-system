import Spinner from "./Spinner";
export default function Loader({ label = "Loading…" }) { return <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-600"><Spinner />{label}</div>; }
