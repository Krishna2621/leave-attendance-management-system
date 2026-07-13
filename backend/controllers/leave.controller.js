const mongoose = require("mongoose");

const LeaveBalance = require("../models/LeaveBalance");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveRequestHistory = require("../models/LeaveRequestHistory");
const LeaveType = require("../models/LeaveType");
const User = require("../models/User");
const { queueNotification } = require("../services/notification.service");
const {
  getBusinessDate,
  getLeaveDaysByYear,
  getWorkingLeaveDates,
  toBusinessDate,
} = require("../utils/leave.utils");

const leaveRequestFields = "_id userId leaveTypeId startDate endDate totalDays reason documentUrl status approvedBy approverComment approvedAt rejectedAt cancelledAt createdAt updatedAt";
const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sendError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
  });
};

const appendHistory = async ({ leaveRequestId, action, previousStatus, nextStatus, actor, comment = "", session }) => {
  await LeaveRequestHistory.create(
    [
      {
        leaveRequestId,
        action,
        previousStatus,
        nextStatus,
        actorId: actor._id,
        actorRole: actor.role,
        comment,
      },
    ],
    { session }
  );
};

const verifyManagerScope = async (managerId, employeeId, session) => {
  const employee = await User.findOne({ _id: employeeId, managerId }).session(session).lean();

  if (!employee) {
    throw createError("You can manage leave requests only for your direct reports", 403);
  }
};

const verifyDecisionScope = async (actor, leaveRequest, session) => {
  if (actor.role === "manager") {
    await verifyManagerScope(actor._id, leaveRequest.userId, session);
  }
};

const buildLeaveHistoryFilter = (query, userId) => {
  const filter = { userId };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.startDate || query.endDate) {
    filter.startDate = {};
    filter.endDate = {};

    if (query.startDate) {
      filter.endDate.$gte = toBusinessDate(query.startDate);
    }

    if (query.endDate) {
      filter.startDate.$lte = toBusinessDate(query.endDate);
    }
  }

  return filter;
};

const getPaginatedLeaveRequests = async (filter, page, limit, populateUser = false) => {
  const skip = (page - 1) * limit;
  const query = LeaveRequest.find(filter)
    .select(leaveRequestFields)
    .populate("leaveTypeId", "name description")
    .populate("approvedBy", "name role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (populateUser) {
    query.populate("userId", "name email departmentId managerId");
  }

  const [leaveRequests, totalRecords] = await Promise.all([query.lean(), LeaveRequest.countDocuments(filter)]);

  return {
    leaveRequests,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

const createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create({
      name: req.body.name,
      description: req.body.description || "",
      maxDaysPerYear: req.body.maxDaysPerYear,
      carryForward: req.body.carryForward || false,
    });

    return res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: { leaveType },
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, createError("A leave type with this name already exists", 409));
    }

    return sendError(res, error);
  }
};

const getLeaveTypes = async (req, res) => {
  try {
    if (req.query.includeInactive && !["hr", "admin"].includes(req.user.role)) {
      return sendError(res, createError("You do not have permission to view inactive leave types", 403));
    }

    const filter = req.query.includeInactive && ["hr", "admin"].includes(req.user.role) ? {} : { isActive: true };
    const leaveTypes = await LeaveType.find(filter).select("_id name description maxDaysPerYear carryForward isActive createdAt updatedAt").sort({ name: 1 }).lean();

    return res.status(200).json({
      success: true,
      message: "Leave types retrieved successfully",
      data: { leaveTypes },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);

    if (!leaveType) {
      return sendError(res, createError("Leave type not found", 404));
    }

    ["name", "description", "maxDaysPerYear", "carryForward", "isActive"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        leaveType[field] = req.body[field];
      }
    });
    await leaveType.save();

    return res.status(200).json({
      success: true,
      message: "Leave type updated successfully",
      data: { leaveType },
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, createError("A leave type with this name already exists", 409));
    }

    return sendError(res, error);
  }
};

const allocateLeaveBalance = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let leaveBalance;

    await session.withTransaction(async () => {
      const [user, leaveType] = await Promise.all([
        User.findOne({ _id: req.body.userId, isActive: true }).session(session).lean(),
        LeaveType.findById(req.body.leaveTypeId).session(session).lean(),
      ]);

      if (!user) {
        throw createError("Active user not found", 404);
      }

      if (!leaveType) {
        throw createError("Leave type not found", 404);
      }

      leaveBalance = await LeaveBalance.findOne({
        userId: req.body.userId,
        leaveTypeId: req.body.leaveTypeId,
        year: req.body.year,
      }).session(session);

      if (leaveBalance) {
        if (req.body.allocated < leaveBalance.used) {
          throw createError("Allocated leave cannot be lower than already used leave", 400);
        }

        leaveBalance.allocated = req.body.allocated;
        await leaveBalance.save({ session });
      } else {
        [leaveBalance] = await LeaveBalance.create(
          [
            {
              userId: req.body.userId,
              leaveTypeId: req.body.leaveTypeId,
              year: req.body.year,
              allocated: req.body.allocated,
              used: 0,
            },
          ],
          { session }
        );
      }
    });

    return res.status(200).json({
      success: true,
      message: "Leave balance allocated successfully",
      data: { leaveBalance },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

const getMyLeaveBalances = async (req, res) => {
  try {
    const year = req.query.year || getBusinessDate(new Date()).getUTCFullYear();
    const leaveBalances = await LeaveBalance.find({ userId: req.user._id, year })
      .populate("leaveTypeId", "name description maxDaysPerYear carryForward")
      .sort({ "leaveTypeId.name": 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Leave balances retrieved successfully",
      data: { year, leaveBalances },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getLeaveBalances = async (req, res) => {
  try {
    const year = req.query.year || getBusinessDate(new Date()).getUTCFullYear();
    const leaveBalances = await LeaveBalance.find({ userId: req.query.userId, year })
      .populate("leaveTypeId", "name description maxDaysPerYear carryForward")
      .populate("userId", "name email departmentId managerId")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Leave balances retrieved successfully",
      data: { year, leaveBalances },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const applyForLeave = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const startDate = toBusinessDate(req.body.startDate);
    const endDate = toBusinessDate(req.body.endDate);
    const leaveDates = getWorkingLeaveDates(startDate, endDate);
    const leaveDaysByYear = getLeaveDaysByYear(leaveDates);
    let leaveRequest;

    if (startDate < getBusinessDate(new Date())) {
      throw createError("Leave start date cannot be in the past", 400);
    }

    if (leaveDates.length === 0) {
      throw createError("Leave request must include at least one working day", 400);
    }

    await session.withTransaction(async () => {
      const [leaveType, overlappingRequest, balances] = await Promise.all([
        LeaveType.findOne({ _id: req.body.leaveTypeId, isActive: true }).session(session).lean(),
        LeaveRequest.findOne({
          userId: req.user._id,
          status: { $in: ["pending", "approved"] },
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        })
          .session(session)
          .lean(),
        LeaveBalance.find({
          userId: req.user._id,
          leaveTypeId: req.body.leaveTypeId,
          year: { $in: leaveDaysByYear.map((entry) => entry.year) },
        })
          .session(session)
          .lean(),
      ]);

      if (!leaveType) {
        throw createError("Active leave type not found", 404);
      }

      if (overlappingRequest) {
        throw createError("Leave request overlaps with an existing pending or approved request", 409);
      }

      const balanceByYear = new Map(balances.map((balance) => [balance.year, balance]));
      leaveDaysByYear.forEach(({ year, days }) => {
        const balance = balanceByYear.get(year);

        if (!balance || balance.allocated - balance.used < days) {
          throw createError(`Insufficient leave balance for ${year}`, 409);
        }
      });

      [leaveRequest] = await LeaveRequest.create(
        [
          {
            userId: req.user._id,
            leaveTypeId: req.body.leaveTypeId,
            startDate,
            endDate,
            totalDays: leaveDates.length,
            leaveDates,
            leaveDaysByYear,
            reason: req.body.reason,
            documentUrl: req.body.documentUrl || "",
          },
        ],
        { session }
      );
      await appendHistory({
        leaveRequestId: leaveRequest._id,
        action: "submitted",
        previousStatus: null,
        nextStatus: "pending",
        actor: req.user,
        session,
      });
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: { leaveRequest },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

const getMyLeaveRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await getPaginatedLeaveRequests(buildLeaveHistoryFilter(req.query, req.user._id), page, limit);

    return res.status(200).json({
      success: true,
      message: "Leave history retrieved successfully",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getTeamLeaveRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const teamMembers = await User.find({ managerId: req.user._id }).select("_id").lean();
    const teamMemberIds = teamMembers.map((teamMember) => teamMember._id);

    if (teamMemberIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Team leave requests retrieved successfully",
        data: {
          leaveRequests: [],
          pagination: { page, limit, totalRecords: 0, totalPages: 0 },
        },
      });
    }

    const filter = buildLeaveHistoryFilter(req.query, { $in: teamMemberIds });
    const data = await getPaginatedLeaveRequests(filter, page, limit, true);

    return res.status(200).json({
      success: true,
      message: "Team leave requests retrieved successfully",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getOrganizationLeaveRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = buildLeaveHistoryFilter(req.query, req.query.userId);
    const data = await getPaginatedLeaveRequests(filter, page, limit, true);

    return res.status(200).json({
      success: true,
      message: "Organization leave requests retrieved successfully",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const approveLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let leaveRequest;

    await session.withTransaction(async () => {
      leaveRequest = await LeaveRequest.findOne({ _id: req.params.id, status: "pending" }).session(session);

      if (!leaveRequest) {
        throw createError("Pending leave request not found", 409);
      }

      await verifyDecisionScope(req.user, leaveRequest, session);

      for (const { year, days } of leaveRequest.leaveDaysByYear) {
        const leaveBalance = await LeaveBalance.findOneAndUpdate(
          {
            userId: leaveRequest.userId,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
            $expr: { $gte: [{ $subtract: ["$allocated", "$used"] }, days] },
          },
          [
            {
              $set: {
                used: { $add: ["$used", days] },
                remaining: { $subtract: ["$allocated", { $add: ["$used", days] }] },
              },
            },
          ],
          { new: true, session }
        );

        if (!leaveBalance) {
          throw createError(`Insufficient leave balance for ${year}`, 409);
        }
      }

      leaveRequest.status = "approved";
      leaveRequest.approvedBy = req.user._id;
      leaveRequest.approverComment = req.body.approverComment || "";
      leaveRequest.approvedAt = new Date();
      await leaveRequest.save({ session });
      await appendHistory({
        leaveRequestId: leaveRequest._id,
        action: "approved",
        previousStatus: "pending",
        nextStatus: "approved",
        actor: req.user,
        comment: leaveRequest.approverComment,
        session,
      });
      const leaveType = await LeaveType.findById(leaveRequest.leaveTypeId).select("name").session(session).lean();
      await queueNotification({
        recipientId: leaveRequest.userId,
        type: "leave_approved",
        referenceType: "LeaveRequest",
        referenceId: leaveRequest._id,
        template: "leave_approved",
        payload: { leaveTypeName: leaveType?.name || "Leave", startDate: formatDate(leaveRequest.startDate), endDate: formatDate(leaveRequest.endDate), totalDays: leaveRequest.totalDays, approverComment: leaveRequest.approverComment },
        metadata: { source: "leave-approval" },
        dedupeKey: `leave-approved:${leaveRequest._id}`,
        session,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: { leaveRequest },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

const rejectLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let leaveRequest;

    await session.withTransaction(async () => {
      leaveRequest = await LeaveRequest.findOne({ _id: req.params.id, status: "pending" }).session(session);

      if (!leaveRequest) {
        throw createError("Pending leave request not found", 409);
      }

      await verifyDecisionScope(req.user, leaveRequest, session);
      leaveRequest.status = "rejected";
      leaveRequest.approvedBy = req.user._id;
      leaveRequest.approverComment = req.body.approverComment;
      leaveRequest.rejectedAt = new Date();
      await leaveRequest.save({ session });
      await appendHistory({
        leaveRequestId: leaveRequest._id,
        action: "rejected",
        previousStatus: "pending",
        nextStatus: "rejected",
        actor: req.user,
        comment: leaveRequest.approverComment,
        session,
      });
      const leaveType = await LeaveType.findById(leaveRequest.leaveTypeId).select("name").session(session).lean();
      await queueNotification({
        recipientId: leaveRequest.userId,
        type: "leave_rejected",
        referenceType: "LeaveRequest",
        referenceId: leaveRequest._id,
        template: "leave_rejected",
        payload: { leaveTypeName: leaveType?.name || "Leave", startDate: formatDate(leaveRequest.startDate), endDate: formatDate(leaveRequest.endDate), approverComment: leaveRequest.approverComment },
        metadata: { source: "leave-rejection" },
        dedupeKey: `leave-rejected:${leaveRequest._id}`,
        session,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      data: { leaveRequest },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

const cancelLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let leaveRequest;

    await session.withTransaction(async () => {
      leaveRequest = await LeaveRequest.findOne({ _id: req.params.id, userId: req.user._id, status: "pending" }).session(session);

      if (!leaveRequest) {
        throw createError("Your pending leave request was not found", 409);
      }

      leaveRequest.status = "cancelled";
      leaveRequest.cancelledAt = new Date();
      await leaveRequest.save({ session });
      await appendHistory({
        leaveRequestId: leaveRequest._id,
        action: "cancelled",
        previousStatus: "pending",
        nextStatus: "cancelled",
        actor: req.user,
        session,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Leave request cancelled successfully",
      data: { leaveRequest },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    await session.endSession();
  }
};

const getLeaveRequestHistory = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id).select("userId").lean();

    if (!leaveRequest) {
      return sendError(res, createError("Leave request not found", 404));
    }

    if (req.user.role === "employee" && String(leaveRequest.userId) !== String(req.user._id)) {
      return sendError(res, createError("You can view history only for your own leave requests", 403));
    }

    if (req.user.role === "manager") {
      await verifyManagerScope(req.user._id, leaveRequest.userId);
    }

    const history = await LeaveRequestHistory.find({ leaveRequestId: req.params.id })
      .select("_id action previousStatus nextStatus actorId actorRole comment createdAt")
      .populate("actorId", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Leave request history retrieved successfully",
      data: { history },
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  allocateLeaveBalance,
  applyForLeave,
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveType,
  getLeaveBalances,
  getLeaveRequestHistory,
  getLeaveTypes,
  getMyLeaveBalances,
  getMyLeaveRequests,
  getOrganizationLeaveRequests,
  getTeamLeaveRequests,
  rejectLeaveRequest,
  updateLeaveType,
};
