const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Attendance = require("../models/Attendance");
const LeaveBalance = require("../models/LeaveBalance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveRequestHistory = require("../models/LeaveRequestHistory");
const RefreshSession = require("../models/RefreshSession");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const { createHRAuditLog } = require("../utils/auditLog");

const publicFields =
  "_id name email role departmentId managerId isActive phoneNumber address dateOfBirth gender emergencyContact bloodGroup joiningDate profilePicture.url profilePicture.originalName createdAt updatedAt";
const permittedProfileFields = [
  "name",
  "phoneNumber",
  "address",
  "dateOfBirth",
  "gender",
  "emergencyContact",
  "bloodGroup",
];
const fail = (res, err) =>
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
const problem = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const _changed = (before, after, fields) =>
  Object.fromEntries(
    fields
      .filter((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null))
      .map((key) => [key, { before: before[key] ?? null, after: after[key] ?? null }])
  );

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(publicFields)
      .populate("departmentId", "name description isActive")
      .populate("managerId", "name email role isActive")
      .lean();
    return res
      .status(200)
      .json({ success: true, message: "Profile fetched successfully", data: { user } });
  } catch (err) {
    return fail(res, err);
  }
};

const listEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, departmentId, isActive, managerId } = req.query;
    const filter = {};
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    if (role) filter.role = role;
    if (departmentId) filter.departmentId = departmentId;
    if (managerId) filter.managerId = managerId;
    if (typeof isActive === "boolean") filter.isActive = isActive;
    const [users, totalRecords] = await Promise.all([
      User.find(filter)
        .select(publicFields)
        .populate("departmentId", "name isActive")
        .populate("managerId", "name email role isActive")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: {
        users,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) },
      },
    });
  } catch (err) {
    return fail(res, err);
  }
};

const getEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(publicFields)
      .populate("departmentId", "name description isActive")
      .populate("managerId", "name email role isActive")
      .lean();
    if (!user) throw problem("Employee not found", 404);
    if (
      req.user.role === "manager" &&
      String(user.managerId?._id) !== String(req.user._id) &&
      String(user._id) !== String(req.user._id)
    )
      throw problem("You can view only your direct reports", 403);
    if (req.user.role === "employee" && String(user._id) !== String(req.user._id))
      throw problem("You can view only your own profile", 403);
    return res
      .status(200)
      .json({ success: true, message: "Employee fetched successfully", data: { user } });
  } catch (err) {
    return fail(res, err);
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const _before = user.toObject();
    permittedProfileFields.forEach((field) => {
      if (Object.hasOwn(req.body, field)) user[field] = req.body[field];
    });
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: await User.findById(user._id).select(publicFields).lean() },
    });
  } catch (err) {
    return fail(res, err);
  }
};

const uploadMyProfilePicture = async (req, res) => {
  let uploaded;
  try {
    if (!req.file) throw problem("A profilePicture file is required", 400);
    const jpeg =
      req.file.buffer.length >= 3 &&
      req.file.buffer[0] === 0xff &&
      req.file.buffer[1] === 0xd8 &&
      req.file.buffer[2] === 0xff;
    const png = req.file.buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (!(
      (req.file.mimetype === "image/jpeg" && jpeg) ||
      (req.file.mimetype === "image/png" && png)
    ))
      throw problem("Profile picture content does not match its declared file type", 400);
    const user = await User.findById(req.user._id).select("+profilePicture.publicId");
    uploaded = await uploadToCloudinary(req.file.buffer, {
      folder: "profile_pictures",
      resource_type: "image",
    });
    const oldPublicId = user.profilePicture?.publicId;
    user.profilePicture = {
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      originalName: String(req.file.originalname || "profile-picture")
        .replace(/[\\/\0]/g, "_")
        .slice(0, 255),
    };
    await user.save();
    if (oldPublicId) await deleteFromCloudinary(oldPublicId).catch(() => null);
    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profilePicture: {
          url: user.profilePicture.url,
          originalName: user.profilePicture.originalName,
        },
      },
    });
  } catch (err) {
    if (uploaded) await deleteFromCloudinary(uploaded.public_id).catch(() => null);
    return fail(res, err);
  }
};

const ensureDepartment = async (departmentId) => {
  if (!departmentId) return null;
  const department = await Department.findOne({ _id: departmentId, isActive: true }).lean();
  if (!department) throw problem("Department must exist and be active", 400);
  return department;
};
const ensureManager = async (managerId, userId) => {
  if (!managerId) return null;
  if (String(managerId) === String(userId))
    throw problem("An employee cannot be their own manager", 400);
  let current = await User.findById(managerId).select("managerId isActive").lean();
  if (!current || !current.isActive) throw problem("Manager must exist and be active", 400);
  const visited = new Set();
  while (current) {
    if (String(current._id) === String(userId))
      throw problem("Manager assignment would create a circular hierarchy", 409);
    if (visited.has(String(current._id)))
      throw problem("Existing manager hierarchy is invalid", 409);
    visited.add(String(current._id));
    current = current.managerId
      ? await User.findById(current.managerId).select("managerId isActive").lean()
      : null;
  }
};
const getMutableUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw problem("Employee not found", 404);
  return user;
};

const updateEmployee = async (req, res) => {
  try {
    const user = await getMutableUser(req.params.id);
    const _before = user.toObject();
    permittedProfileFields.concat(["joiningDate"]).forEach((field) => {
      if (Object.hasOwn(req.body, field)) user[field] = req.body[field];
    });
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: { user: await User.findById(user._id).select(publicFields).lean() },
    });
  } catch (err) {
    return fail(res, err);
  }
};
const setActive = async (req, res) => {
  try {
    const user = await getMutableUser(req.params.id);
    const isActive = req.body.isActive;
    if (!isActive && String(user._id) === String(req.user._id))
      throw problem("You cannot deactivate your own account", 400);
    if (
      !isActive &&
      user.role === "admin" &&
      (await User.countDocuments({ role: "admin", isActive: true })) === 1
    )
      throw problem("Cannot deactivate the final active Admin account", 409);
    const before = user.isActive;
    user.isActive = isActive;
    await user.save();
    await createHRAuditLog({
      entityType: "employee",
      entityId: user._id,
      action: isActive ? "activated" : "deactivated",
      actor: req.user,
      targetUserId: user._id,
      changedFields: { isActive: { before, after: isActive } },
    });
    return res.status(200).json({
      success: true,
      message: `Employee ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: await User.findById(user._id).select(publicFields).lean() },
    });
  } catch (err) {
    return fail(res, err);
  }
};
const changeManager = async (req, res) => {
  try {
    const user = await getMutableUser(req.params.id);
    await ensureManager(req.body.managerId, user._id);
    const before = user.managerId;
    user.managerId = req.body.managerId || null;
    await user.save();
    await createHRAuditLog({
      entityType: "employee",
      entityId: user._id,
      action: "manager_changed",
      actor: req.user,
      targetUserId: user._id,
      changedFields: { managerId: { before, after: user.managerId } },
    });
    return res
      .status(200)
      .json({ success: true, message: "Manager changed successfully", data: { user } });
  } catch (err) {
    return fail(res, err);
  }
};
const changeDepartment = async (req, res) => {
  try {
    const user = await getMutableUser(req.params.id);
    await ensureDepartment(req.body.departmentId);
    const before = user.departmentId;
    user.departmentId = req.body.departmentId || null;
    await user.save();
    await createHRAuditLog({
      entityType: "employee",
      entityId: user._id,
      action: "department_changed",
      actor: req.user,
      targetUserId: user._id,
      changedFields: { departmentId: { before, after: user.departmentId } },
    });
    return res
      .status(200)
      .json({ success: true, message: "Department changed successfully", data: { user } });
  } catch (err) {
    return fail(res, err);
  }
};
const changeRole = async (req, res) => {
  try {
    const user = await getMutableUser(req.params.id);
    if (
      user.role === "admin" &&
      req.body.role !== "admin" &&
      (await User.countDocuments({ role: "admin", isActive: true })) === 1
    )
      throw problem("Cannot remove the final active Admin account", 409);
    const before = user.role;
    user.role = req.body.role;
    await user.save();
    await createHRAuditLog({
      entityType: "employee",
      entityId: user._id,
      action: "role_changed",
      actor: req.user,
      targetUserId: user._id,
      changedFields: { role: { before, after: user.role } },
    });
    return res
      .status(200)
      .json({ success: true, message: "Role changed successfully", data: { user } });
  } catch (err) {
    return fail(res, err);
  }
};

const deleteEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const employeeId = req.params.id;
    if (String(employeeId) === String(req.user._id))
      throw problem("You cannot delete your own account.", 400);

    let profilePicturePublicId = "";
    let leaveDocumentPublicIds = [];
    await session.withTransaction(async () => {
      const employee = await User.findById(employeeId)
        .select("+profilePicture.publicId")
        .session(session);
      if (!employee) throw problem("Employee not found", 404);

      if (
        employee.role === "admin" &&
        (await User.countDocuments({ role: "admin" }).session(session)) === 1
      )
        throw problem("Cannot delete the last remaining Admin account", 409);

      const leaveRequests = await LeaveRequest.find({ userId: employee._id })
        .select("_id document.publicId")
        .session(session)
        .lean();
      const leaveRequestIds = leaveRequests.map((leaveRequest) => leaveRequest._id);
      profilePicturePublicId = employee.profilePicture?.publicId || "";
      leaveDocumentPublicIds = leaveRequests
        .map((leaveRequest) => leaveRequest.document?.publicId)
        .filter(Boolean);

      await Promise.all([
        Attendance.deleteMany({ userId: employee._id }).session(session),
        LeaveBalance.deleteMany({ userId: employee._id }).session(session),
        LeaveRequest.deleteMany({ userId: employee._id }).session(session),
        RefreshSession.deleteMany({ userId: employee._id }).session(session),
        Notification.deleteMany({
          $or: [
            { recipientId: employee._id },
            ...(leaveRequestIds.length ? [{ referenceId: { $in: leaveRequestIds } }] : []),
          ],
        }).session(session),
        User.updateMany({ managerId: employee._id }, { $set: { managerId: null } }).session(
          session
        ),
        Department.updateMany({ managerId: employee._id }, { $set: { managerId: null } }).session(
          session
        ),
        LeaveRequest.updateMany(
          { approvedBy: employee._id },
          { $set: { approvedBy: null } }
        ).session(session),
      ]);

      // These immutable history/audit models intentionally reject Mongoose deletes.
      // The raw collection operations keep employee deletion comprehensive.
      await Promise.all([
        LeaveRequestHistory.collection.deleteMany(
          {
            $or: [{ leaveRequestId: { $in: leaveRequestIds } }, { actorId: employee._id }],
          },
          { session }
        ),
        AuditLog.collection.deleteMany(
          {
            $or: [
              { actorId: employee._id },
              { targetUserId: employee._id },
              { entityType: "employee", entityId: employee._id },
            ],
          },
          { session }
        ),
      ]);
      await employee.deleteOne({ session });
    });

    await Promise.all(
      [profilePicturePublicId, ...leaveDocumentPublicIds]
        .filter(Boolean)
        .map((publicId) => deleteFromCloudinary(publicId).catch(() => null))
    );
    return res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully", data: {} });
  } catch (err) {
    return fail(res, err);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getMe,
  listEmployees,
  getEmployee,
  updateMyProfile,
  uploadMyProfilePicture,
  updateEmployee,
  setActive,
  changeManager,
  changeDepartment,
  changeRole,
  deleteEmployee,
};
