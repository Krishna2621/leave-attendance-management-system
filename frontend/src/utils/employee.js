export const roleLabels = { employee: "Employee", manager: "Manager", hr: "HR", admin: "Admin" };
export const roleTone = (role) => role === "admin" ? "danger" : role === "hr" ? "warning" : role === "manager" ? "success" : "neutral";
export const roleText = (role) => roleLabels[role] || role || "—";
export const genderLabels = { male: "Male", female: "Female", other: "Other", prefer_not_to_say: "Prefer not to say" };
export const genderText = (value) => genderLabels[value] || "—";
export const canManage = (role) => ["hr", "admin"].includes(role);
