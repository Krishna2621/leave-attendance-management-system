import client from "./client";

const getData = (response) => response.data.data;
const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));

export const getDepartments = (params) => client.get("/departments", { params: cleanParams(params) }).then(getData);
export const getDepartment = (id) => client.get(`/departments/${id}`).then(getData);
export const createDepartment = (payload) => client.post("/departments", payload).then(getData);
export const updateDepartment = (id, payload) => client.put(`/departments/${id}`, payload).then(getData);
export const deleteDepartment = (id) => client.delete(`/departments/${id}`).then(getData);
