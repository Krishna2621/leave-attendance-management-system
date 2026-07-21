import client from "./client";

const getData = (response) => response.data.data;
const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));

export const getAttendanceReport = (params) => client.get("/reports/attendance", { params: cleanParams(params) }).then(getData);
