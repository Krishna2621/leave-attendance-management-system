export const leaveTone = (status) => status === "approved" ? "success" : status === "rejected" ? "danger" : status === "pending" ? "warning" : "neutral";
export const dateText = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";
