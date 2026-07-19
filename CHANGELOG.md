# Changelog

All notable changes to the **Leave & Attendance Management System** are documented in this file.

The format is based on semantic project versioning, with each release summarizing the major features introduced.

---

# v1.1.0 - Production Hardening & Backend Polish
**Release Date:** July 19, 2026

### Added
- Startup environment validation.
- Health endpoints.
- Swagger UI.
- `.env.example`.
- Structured logger.
- Graceful shutdown.
- Production testing guide.

### Changed
- Improved security middleware.
- Improved startup configuration.
- Improved production readiness.
- Normalized server errors.
- Updated package version to v1.1.0.

### Security
- Production-safe logging.
- Redacted sensitive information.
- Hardened request handling.
- Improved startup validation.

### Testing
- Successfully verified startup validation.
- Successfully verified health endpoints.
- Successfully verified Swagger UI.
- Successfully verified MongoDB connectivity.
- Successfully verified graceful shutdown.
- Successfully verified environment validation.
- Successfully verified production configuration.

---

# v0.9.0 - Authentication Completion Module
**Release Date:** July 16, 2026

## Added
- Refresh Session model for persistent refresh token management.
- Password Reset Token model with automatic expiration (TTL).
- Password Reset email template.
- Logout All Devices endpoint.
- Forgot Password endpoint.
- Reset Password endpoint.

## Changed
- Implemented refresh token rotation with unique JWT IDs (JTI).
- Refresh tokens are now stored as SHA-256 hashes.
- Added persistent refresh-session management.
- Registration now requires `confirmPassword`.
- Password reset now requires `confirmPassword`.
- Successful password reset revokes every active refresh session.
- Logout revokes only the current session.

## Security
- Prevented refresh-token replay attacks.
- Password reset tokens are one-time use.
- Generic forgot-password responses prevent email enumeration.
- Password reset tokens are stored as hashes only.
- Automatic password reset token expiration.

## Testing
- Verified registration.
- Verified login.
- Verified refresh-token rotation.
- Verified refresh-token replay protection.
- Verified logout.
- Verified logout-all-devices.
- Verified forgot-password workflow.
- Verified password reset workflow.
- Verified session revocation after password reset.
- Verified password reset token expiration.

---

# v0.8.0 - Document Management & Cloudinary Integration
**Release Date:** July 15, 2026

## Added
- Cloudinary integration.
- Secure document upload.
- Secure document retrieval.
- Multer memory storage middleware.
- Leave attachment support.
- Cloudinary cleanup on failed transactions.

## Security
- File signature validation.
- MIME type validation.
- Metadata-only storage in MongoDB.
- Role-based document access.

## Testing
- Verified document upload.
- Verified document retrieval.
- Verified Cloudinary storage.
- Verified transaction rollback cleanup.
- Verified authorization rules.

---

# v0.7.0 - Automation & Notification Module
**Release Date:** July 14, 2026

## Added
- Attendance automation.
- Cron job scheduler.
- Notification Outbox architecture.
- Notification Dispatcher.
- Email Service.
- Attendance reminders.
- Leave reminders.
- Scheduled Job management.
- Notification History APIs.

## Security
- Idempotent scheduled jobs.
- Notification deduplication.
- Admin-only automation endpoints.
- Immutable automation audit events.

## Testing
- Verified attendance automation.
- Verified notification delivery.
- Verified scheduled jobs.
- Verified retry mechanism.
- Verified email notifications.

---

# v0.6.0 - Leave Management Module
**Release Date:** July 13, 2026

## Added
- Leave Types.
- Leave Balances.
- Leave Requests.
- Leave Approval workflow.
- Leave Rejection workflow.
- Leave Cancellation.
- Leave History.
- Multi-year leave handling.

## Security
- Transactional leave updates.
- Overlap prevention.
- Weekend-aware leave calculation.
- Manager and HR authorization.

## Testing
- Verified leave workflow.
- Verified transactions.
- Verified leave balances.
- Verified approval and rejection.
- Verified cancellation.

---

# v0.5.0 - Audit Logs, Reports & Dashboard
**Release Date:** July 12, 2026

## Added
- Attendance Audit Logs.
- Attendance Reports.
- Employee Dashboard.
- Manager Dashboard.
- Organization Dashboard.
- Attendance analytics.

## Testing
- Verified reports.
- Verified dashboards.
- Verified audit logs.
- Verified reporting filters.

---

# v0.4.0 - HR & Management Attendance
**Release Date:** July 11, 2026

## Added
- Team Attendance.
- Organization Attendance.
- Attendance Corrections.
- Attendance filtering.
- Attendance query optimization.

## Testing
- Verified manager access.
- Verified HR attendance correction.
- Verified filtering.
- Verified pagination.

---

# v0.3.0 - Attendance Core
**Release Date:** July 10, 2026

## Added
- Punch In.
- Punch Out.
- Attendance History.
- Working Hours calculation.
- Late Arrival detection.
- Attendance Status calculation.

## Testing
- Verified punch workflows.
- Verified duplicate prevention.
- Verified attendance history.

---

# v0.2.0 - Authentication & RBAC
**Release Date:** July 9, 2026

## Added
- JWT Authentication.
- Login.
- Registration.
- Logout.
- Refresh Token.
- Role Based Access Control.
- Security middleware.

## Testing
- Verified authentication.
- Verified authorization.
- Verified RBAC.

---

# v0.1.0 - Backend Foundation
**Release Date:** July 8, 2026

## Added
- Express backend.
- MongoDB Atlas connection.
- Environment configuration.
- Health API.
- Project structure.
- GitHub repository.
- Initial middleware configuration.

## Testing
- Verified MongoDB connection.
- Verified server startup.
- Verified health endpoint.
