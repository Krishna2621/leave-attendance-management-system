import client from "./client";

export const loginRequest = (credentials) => client.post("/auth/login", credentials);
export const createEmployeeRequest = (payload) => client.post("/auth/employees", payload);
export const changePasswordRequest = (payload) => client.post("/auth/change-password", payload);
export const logoutRequest = () => client.post("/auth/logout");
