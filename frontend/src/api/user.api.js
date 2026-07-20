import client from "./client";

const getData = (response) => response.data.data;
const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));

export const getEmployees = (params) => client.get("/users", { params: cleanParams(params) }).then(getData);
export const getEmployee = (id) => client.get(`/users/${id}`).then(getData);
export const updateEmployee = (id, payload) => client.put(`/users/${id}`, payload).then(getData);
export const setEmployeeStatus = (id, isActive) => client.put(`/users/${id}/status`, { isActive }).then(getData);
export const changeEmployeeRole = (id, role) => client.put(`/users/${id}/role`, { role }).then(getData);
export const changeEmployeeManager = (id, managerId) => client.put(`/users/${id}/manager`, { managerId: managerId || null }).then(getData);
export const changeEmployeeDepartment = (id, departmentId) => client.put(`/users/${id}/department`, { departmentId: departmentId || null }).then(getData);
export const getDepartments = (params) => client.get("/departments", { params: cleanParams(params) }).then(getData);

export const getMyProfile = () => client.get("/users/me").then(getData);
export const updateMyProfile = (payload) => client.put("/users/me", payload).then(getData);
export const uploadMyProfilePicture = (file) => {
  const form = new FormData();
  form.append("profilePicture", file);
  return client.put("/users/me/profile-picture", form, { headers: { "Content-Type": "multipart/form-data" } }).then(getData);
};