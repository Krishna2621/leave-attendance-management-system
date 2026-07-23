import client from "./client";

export const loginRequest = (credentials) => client.post("/auth/login", credentials);
export const registerRequest = (payload) => client.post("/auth/register", payload);
export const logoutRequest = () => client.post("/auth/logout");
