const mongoose = require("mongoose");

const changedFieldSchema = new mongoose.Schema(
  {
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const auditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["attendance"],
      required: true,
      immutable: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: ["punch_in", "punch_out", "corrected", "absence_marked"],
      required: true,
      immutable: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      immutable: true,
    },
    actorRole: {
      type: String,
      enum: ["employee", "manager", "hr", "admin", null],
      default: null,
      immutable: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    changedFields: {
      type: Map,
      of: changedFieldSchema,
      required: true,
      immutable: true,
    },
    correctionReason: {
      type: String,
      trim: true,
      default: "",
      immutable: true,
    },
    source: {
      type: String,
      enum: ["api", "cron"],
      required: true,
      immutable: true,
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 45,
      default: null,
      immutable: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 512,
      default: null,
      immutable: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    strict: "throw",
    versionKey: false,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ targetUserId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

auditLogSchema.pre("save", function preventExistingAuditLogSave(next) {
  if (!this.isNew) {
    return next(new Error("Audit logs are append-only and cannot be modified"));
  }

  return next();
});

const preventAuditLogMutation = function preventAuditLogMutation(next) {
  next(new Error("Audit logs are append-only and cannot be modified or deleted"));
};

auditLogSchema.pre("updateOne", preventAuditLogMutation);
auditLogSchema.pre("updateMany", preventAuditLogMutation);
auditLogSchema.pre("findOneAndUpdate", preventAuditLogMutation);
auditLogSchema.pre("replaceOne", preventAuditLogMutation);
auditLogSchema.pre("findOneAndReplace", preventAuditLogMutation);
auditLogSchema.pre("deleteOne", preventAuditLogMutation);
auditLogSchema.pre("deleteMany", preventAuditLogMutation);
auditLogSchema.pre("findOneAndDelete", preventAuditLogMutation);

module.exports = mongoose.model("AuditLog", auditLogSchema);
