const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const RefreshSession = require("../models/RefreshSession");
const Department = require("../models/Department");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const { initializeLeaveBalancesForUser } = require("../utils/leaveBalance");

const ACCESS_TOKEN_DURATION_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 10;
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  departmentId: user.departmentId,
  managerId: user.managerId,
  isActive: user.isActive,
  forcePasswordChange: user.forcePasswordChange,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: ACCESS_TOKEN_DURATION_MS });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: REFRESH_TOKEN_DURATION_MS });
};
const getSessionMetadata = (req) => ({
  deviceInfo: String(req.get("x-device-info") || "").slice(0, 500),
  ipAddress: String(req.ip || "").slice(0, 45),
  userAgent: String(req.get("user-agent") || "").slice(0, 512),
});
const createRefreshSession = async ({ user, token, req, session }) => {
  const decoded = jwt.decode(token);
  const refreshSession = {
    userId: user._id,
    tokenHash: hashToken(token),
    issuedAt: new Date((decoded?.iat || Math.floor(Date.now() / 1000)) * 1000),
    expiresAt: new Date(
      (decoded?.exp || Math.floor((Date.now() + REFRESH_TOKEN_DURATION_MS) / 1000)) * 1000
    ),
    ...getSessionMetadata(req),
  };
  if (session) {
    const [created] = await RefreshSession.create([refreshSession], { session });
    return created;
  }
  return RefreshSession.create(refreshSession);
};

const generateTemporaryPassword = () => {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%^&*-_+=",
  ];
  const randomCharacter = (characters) => characters[crypto.randomInt(characters.length)];
  const password = groups.map(randomCharacter);
  const allCharacters = groups.join("");
  while (password.length < 14) password.push(randomCharacter(allCharacters));
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }
  return password.join("");
};

const validateEmployeeReferences = async ({ departmentId, managerId }) => {
  if (departmentId && !(await Department.exists({ _id: departmentId, isActive: true }))) {
    const error = new Error("Department must exist and be active");
    error.statusCode = 400;
    throw error;
  }
  if (managerId && !(await User.exists({ _id: managerId, isActive: true }))) {
    const error = new Error("Manager must exist and be active");
    error.statusCode = 400;
    throw error;
  }
};

const createEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { name, email, departmentId, managerId, role, joiningDate } = req.body;
    if (req.user.role === "hr" && role === "admin")
      return res.status(403).json({ success: false, message: "HR users cannot create Admin accounts" });
    if (await User.exists({ email }))
      return res.status(409).json({ success: false, message: "User with this email already exists" });

    await validateEmployeeReferences({ departmentId, managerId });
    const temporaryPassword = generateTemporaryPassword();
    const password = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
    let user;
    await session.withTransaction(async () => {
      const [createdUser] = await User.create(
        [{ name, email, password, departmentId: departmentId || null, managerId: managerId || null, role, joiningDate, forcePasswordChange: true }],
        { session }
      );
      user = createdUser;
      await initializeLeaveBalancesForUser({ userId: user._id, session });
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { user: sanitizeUser(user), temporaryPassword },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to create employee",
    });
  } finally {
    await session.endSession();
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !user.isActive || !user.password || !(await bcrypt.compare(req.body.password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await createRefreshSession({ user, token: refreshToken, req });
    setAuthCookies(res, accessToken, refreshToken);
    return res.status(200).json({
      success: true,
      requirePasswordChange: user.forcePasswordChange === true,
      message: "Login successful",
      data: { user: sanitizeUser(user) },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Unable to complete login" });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id, isActive: true }).select("+password");
    if (!user || !user.password || !(await bcrypt.compare(req.body.currentPassword, user.password)))
      return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(req.body.newPassword, BCRYPT_ROUNDS);
    user.forcePasswordChange = false;
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully", data: {} });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Unable to change password" });
  }
};

const logout = async (req, res) => {
  try {
    if (req.cookies.refreshToken)
      await RefreshSession.updateOne(
        { tokenHash: hashToken(req.cookies.refreshToken), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: "Logout successful", data: {} });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Unable to log out" });
  }
};

const logoutAll = async (req, res) => {
  try {
    await RefreshSession.updateMany({ userId: req.user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: "Logged out from all devices successfully", data: {} });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Unable to log out from all devices" });
  }
};

const refreshToken = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "Refresh token is missing" });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    let user;
    let nextRefreshToken;
    await session.withTransaction(async () => {
      const now = new Date();
      const currentSession = await RefreshSession.findOneAndUpdate(
        { userId: decoded.id, tokenHash: hashToken(token), revokedAt: null, expiresAt: { $gt: now } },
        { $set: { revokedAt: now, lastUsedAt: now } },
        { new: true, session }
      );
      if (!currentSession) {
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
      }
      user = await User.findOne({ _id: decoded.id, isActive: true }).session(session);
      if (!user) {
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
      }
      nextRefreshToken = generateRefreshToken(user);
      await createRefreshSession({ user, token: nextRefreshToken, req, session });
    });
    setAuthCookies(res, generateAccessToken(user), nextRefreshToken);
    return res.status(200).json({ success: true, message: "Access token refreshed successfully", data: {} });
  } catch (_error) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  } finally {
    await session.endSession();
  }
};

module.exports = { login, changePassword, logout, logoutAll, refreshToken, createEmployee };
