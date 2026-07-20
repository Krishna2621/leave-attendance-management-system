import client from "./client";

const getData = (response) => response.data.data;
const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([key, value]) => key !== "search" && value !== "" && value !== undefined && value !== null && value !== false));

export const getMyAttendance = (params) => client.get("/attendance/me", { params: cleanParams(params) }).then(getData);
export const getTeamAttendance = (params) => client.get("/attendance/team", { params: cleanParams(params) }).then(getData);
export const getOrganizationAttendance = (params) => client.get("/attendance/all", { params: cleanParams(params) }).then(getData);
export const getAttendanceDashboard = () => client.get("/dashboard/me").then(getData);
export const punchIn = (note) => client.post("/attendance/punch-in", note ? { note } : {}).then(getData);
export const punchOut = () => client.post("/attendance/punch-out", {}).then(getData);
export const correctAttendance = (id, payload) => client.put(`/attendance/${id}/correct`, payload).then(getData);
