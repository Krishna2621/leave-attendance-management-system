const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["employee", "manager", "hr", "admin"],
      default: "employee",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phoneNumber: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, maxlength: 500, default: "" },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say", null], default: null },
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 100, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
    },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null], default: null },
    joiningDate: { type: Date, default: null },
    profilePicture: {
      publicId: { type: String, select: false },
      url: { type: String, default: "" },
      originalName: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ managerId: 1 });
userSchema.index({ departmentId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ name: 1, email: 1 });

module.exports = mongoose.model("User", userSchema);
