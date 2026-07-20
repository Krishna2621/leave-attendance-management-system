import client from "./client";

const getData = (response) => response.data.data;

export const getDashboard = (role) => {
  const endpoint = role === "employee" ? "/dashboard/me" : role === "manager" ? "/dashboard/team" : "/dashboard/organization";
  return client.get(endpoint).then(getData);
};

export const getNotifications = () => client.get("/notifications/me", { params: { limit: 5 } }).then(getData);

const getLeaveEndpoint = (role) => role === "employee" ? "/leaves/me" : role === "manager" ? "/leaves/team" : "/leaves/all";

export const getRecentLeaveRequests = (role) => client.get(getLeaveEndpoint(role), { params: { limit: 5 } }).then(getData);

export const getLeaveStatistics = async (role) => {
  const endpoint = getLeaveEndpoint(role);
  const statuses = ["pending", "approved", "rejected", "cancelled"];
  const responses = await Promise.all(statuses.map((status) => client.get(endpoint, { params: { status, limit: 1 } })));
  return Object.fromEntries(responses.map((response, index) => [statuses[index], response.data.data.pagination.totalRecords]));
};

export const getLeaveBalances = () => client.get("/leaves/balance/me").then(getData);
export const getAttendanceHistory = () => client.get("/attendance/me", { params: { limit: 30 } }).then(getData);
