import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";
export default function DashboardError({ error, onRetry }) { return <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center"><AlertCircle className="mx-auto text-rose-600" /><h2 className="mt-3 font-semibold text-rose-950">Dashboard data could not be loaded</h2><p className="mt-1 text-sm text-rose-800">{getApiErrorMessage(error)}</p><Button className="mt-4" variant="danger" onClick={onRetry}><RefreshCw size={16} />Try again</Button></div>; }
