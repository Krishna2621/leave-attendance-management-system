export const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";
export const formatTime = (value) => value ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";
export const formatHours = (value) => value === undefined || value === null ? "—" : `${Number(value).toFixed(2)}h`;
export const statusTone = (status) => status === "present" ? "success" : status === "absent" ? "danger" : status === "half-day" ? "warning" : "neutral";
export const monthBounds = (date) => ({ startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10), endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10) });
export const toDateTimeLocal = (value) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "";
