const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const PasswordResetToken = require("../models/PasswordResetToken");
const RefreshSession = require("../models/RefreshSession");
const User = require("../models/User");
const { sendEmail } = require("../services/email.service");
const passwordResetTemplate = require("../templates/email/passwordReset");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const logger = require("../utils/logger");

const ACCESS_TOKEN_DURATION_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_DURATION_MS = 20 * 60 * 1000;
const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" };

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  departmentId: user.departmentId,
  managerId: user.managerId,
  isActive: user.isActive,
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
    expiresAt: new Date((decoded?.exp || Math.floor((Date.now() + REFRESH_TOKEN_DURATION_MS) / 1000)) * 1000),
    ...getSessionMetadata(req),
  };

  if (session) {
    const [created] = await RefreshSession.create([refreshSession], { session });
    return created;
  }

  return RefreshSession.create(refreshSession);
};

const register = async (req, res) => {
  try {
    const { name, email, password, departmentId, managerId } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "User with this email already exists" });

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), departmentId, managerId });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await createRefreshSession({ user, token: refreshToken, req });
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ success: true, message: "User registered successfully", data: { user: sanitizeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to register user" });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await createRefreshSession({ user, token: refreshToken, req });
    setAuthCookies(res, accessToken, refreshToken);
    return res.status(200).json({ success: true, message: "Login successful", data: { user: sanitizeUser(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to complete login" });
  }
};

const logout = async (req, res) => {
  try {
    if (req.cookies.refreshToken) {
      await RefreshSession.updateOne({ tokenHash: hashToken(req.cookies.refreshToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
    }
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: "Logout successful", data: {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to log out" });
  }
};

const logoutAll = async (req, res) => {
  try {
    await RefreshSession.updateMany({ userId: req.user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: "Logged out from all devices successfully", data: {} });
  } catch (error) {
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
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  } finally {
    await session.endSession();
  }
};

const forgotPassword = async (req, res) => {
  const response = { success: true, message: "If an account exists, password reset instructions have been sent." };
  try {
    const user = await User.findOne({ email: req.body.email, isActive: true });
    if (!user) return res.status(200).json(response);

    const token = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({ userId: user._id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + PASSWORD_RESET_DURATION_MS) });

    const resetUrl = new URL("/reset-password", process.env.FRONTEND_URL || process.env.CLIENT_URL);
    resetUrl.searchParams.set("token", token);
    await sendEmail({ to: user.email, ...passwordResetTemplate({ recipientName: user.name, resetUrl: resetUrl.toString() }) });
  } catch (error) {
    logger.error("Password reset request could not be completed", { error: error.message });
  }
  return res.status(200).json(response);
};

const resetPassword = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let user;
    await session.withTransaction(async () => {
      const resetToken = await PasswordResetToken.findOneAndDelete(
        { tokenHash: hashToken(req.body.token), expiresAt: { $gt: new Date() } },
        { session }
      );
      if (!resetToken) {
        const error = new Error("Invalid or expired password reset token");
        error.statusCode = 400;
        throw error;
      }

      user = await User.findOne({ _id: resetToken.userId, isActive: true }).select("+password").session(session);
      if (!user) {
        const error = new Error("Invalid or expired password reset token");
        error.statusCode = 400;
        throw error;
      }

      user.password = await bcrypt.hash(req.body.password, 10);
      await user.save({ session });
      await PasswordResetToken.deleteMany({ userId: user._id }).session(session);
      await RefreshSession.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
    });
    clearAuthCookies(res);
    return res.status(200).json({ success: true, message: "Password reset successfully. Please log in again.", data: {} });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to reset password",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = { register, login, logout, logoutAll, refreshToken, forgotPassword, resetPassword };
