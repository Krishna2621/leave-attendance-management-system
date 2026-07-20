import client from "./client";

export const loginRequest = (credentials) => client.post("/auth/login", credentials);
export const logoutRequest = () => client.post("/auth/logout");
