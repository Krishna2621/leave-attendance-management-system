import client from "./client";

export const loginRequest = (credentials) => client.post("/auth/login", credentials);
export const registerRequest = (payload) => client.post("/auth/register", payload);
export const sendEmployeeOtpRequest = (email) => client.post("/auth/employees/send-otp", { email });
export const verifyEmployeeOtpRequest = (email, otp) =>
  client.post("/auth/employees/verify-otp", { email, otp });
export const createEmployeeRequest = (payload) => client.post("/auth/employees", payload);
export const setPasswordRequest = (token, payload) =>
  client.post(`/auth/set-password/${token}`, payload);
export const logoutRequest = () => client.post("/auth/logout");
