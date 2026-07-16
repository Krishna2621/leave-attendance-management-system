const Department = require("../models/Department");
const User = require("../models/User");
const { createHRAuditLog } = require("../utils/auditLog");

const fail = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });
const error = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const changes = (before, after, fields) => Object.fromEntries(fields.filter((field) => String(before[field] ?? "") !== String(after[field] ?? "")).map((field) => [field, { before: before[field] ?? null, after: after[field] ?? null }]));

const verifyHead = async (managerId) => {
  if (!managerId) return null;
  const head = await User.findOne({ _id: managerId, isActive: true }).lean();
  if (!head) throw error("Department head must be an active user in the organization", 400);
  if (head.role !== "manager") throw error("Department head must have the manager role", 400);
  return head;
};

const createDepartment = async (req, res) => {
  try {
    await verifyHead(req.body.managerId);
    const department = await Department.create(req.body);
    await createHRAuditLog({ entityType: "department", entityId: department._id, action: "created", actor: req.user, changedFields: { name: { before: null, after: department.name } } });
    return res.status(201).json({ success: true, message: "Department created successfully", data: { department } });
  } catch (err) {
    if (err.code === 11000) return fail(res, error("A department with this name already exists", 409));
    return fail(res, err);
  }
};

const listDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (typeof isActive === "boolean") filter.isActive = isActive;
    const [departments, totalRecords] = await Promise.all([
      Department.find(filter).populate("managerId", "name email role isActive").sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Department.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, message: "Departments fetched successfully", data: { departments, pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) } } });
  } catch (err) { return fail(res, err); }
};

const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate("managerId", "name email role isActive").lean();
    if (!department) throw error("Department not found", 404);
    return res.status(200).json({ success: true, message: "Department fetched successfully", data: { department } });
  } catch (err) { return fail(res, err); }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) throw error("Department not found", 404);
    if (Object.hasOwn(req.body, "managerId")) await verifyHead(req.body.managerId);
    if (req.body.isActive === false) {
      const employees = await User.exists({ departmentId: department._id, isActive: true });
      if (employees) throw error("Reassign or deactivate active employees before deactivating this department", 409);
    }
    const before = department.toObject();
    ["name", "description", "managerId", "isActive"].forEach((field) => { if (Object.hasOwn(req.body, field)) department[field] = req.body[field]; });
    await department.save();
    await createHRAuditLog({ entityType: "department", entityId: department._id, action: "updated", actor: req.user, changedFields: changes(before, department, ["name", "description", "managerId", "isActive"]) });
    return res.status(200).json({ success: true, message: "Department updated successfully", data: { department } });
  } catch (err) { if (err.code === 11000) return fail(res, error("A department with this name already exists", 409)); return fail(res, err); }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) throw error("Department not found", 404);
    if (await User.exists({ departmentId: department._id })) throw error("Cannot delete a department that still contains employees", 409);
    await department.deleteOne();
    await createHRAuditLog({ entityType: "department", entityId: department._id, action: "deleted", actor: req.user, changedFields: { name: { before: department.name, after: null } } });
    return res.status(200).json({ success: true, message: "Department deleted successfully", data: {} });
  } catch (err) { return fail(res, err); }
};

module.exports = { createDepartment, listDepartments, getDepartment, updateDepartment, deleteDepartment };
