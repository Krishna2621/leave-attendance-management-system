const hasText = (value) => typeof value === "string" && value.trim().length > 0;

export const profileCompletionFields = [
  { key: "phoneNumber", label: "Phone number", isComplete: (profile) => hasText(profile?.phoneNumber) },
  { key: "address", label: "Address", isComplete: (profile) => hasText(profile?.address) },
  { key: "dateOfBirth", label: "Date of birth", isComplete: (profile) => Boolean(profile?.dateOfBirth) },
  { key: "gender", label: "Gender", isComplete: (profile) => hasText(profile?.gender) },
  { key: "emergencyContact", label: "Emergency contact", isComplete: (profile) => hasText(profile?.emergencyContact?.name) },
  { key: "emergencyPhone", label: "Emergency phone", isComplete: (profile) => hasText(profile?.emergencyContact?.phoneNumber) },
];

export function getProfileCompletion(profile) {
  const fields = profileCompletionFields.map((field) => ({ ...field, complete: field.isComplete(profile) }));
  const completedRequiredFields = fields.filter((field) => field.complete).length;
  const totalRequiredFields = fields.length;
  return { fields, completedRequiredFields, totalRequiredFields, percentage: Math.round((completedRequiredFields / totalRequiredFields) * 100), isComplete: completedRequiredFields === totalRequiredFields };
}
