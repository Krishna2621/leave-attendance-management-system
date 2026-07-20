# Changelog

All notable changes to the **Leave & Attendance Management System** are documented in this file.

The format is based on semantic project versioning, with each release summarizing the major features introduced.

---

# Frontend v1.5.0 - Department Management & Profile
**Release Date:** July 21, 2026

### Added
- **Department Management** (HR/Admin): `api/department.api.js`, `hooks/useDepartments.js`, department directory with search, status filter, and pagination, and a details page.
- Create Department, Edit Department, Assign Department Head (restricted to manager-role users), and Activate/Deactivate via a shared form modal.
- Delete Department action (Admin-only) with a confirmation dialog.
- **User Profile** (all roles): `hooks/useProfile.js`, profile endpoints in `api/user.api.js`, and a Profile page showing avatar, name, email, role, department, manager, and personal/contact details.
- Edit Profile form limited to the backend-permitted fields (name, phone, address, date of birth, gender, blood group, emergency contact).
- Profile picture upload using the existing `PUT /api/users/me/profile-picture` endpoint (JPG/PNG, 5 MB).
- `updateUser` on the auth context so profile name/picture changes reflect immediately in the top navbar.

### Changed
- Added `/departments`, `/departments/:id` (HR/Admin) and `/profile` (all roles) routes.
- Added Departments (HR/Admin) and Profile (all roles) sidebar links.
- Extended Breadcrumbs with department and profile labels.
- Restored the Departments dashboard Quick Action for HR/Admin.
- The top-navbar user chip now links to the Profile page and shows the uploaded avatar.

### Security
- Department create/edit/head-assignment routes follow backend RBAC (HR/Admin); delete is Admin-only.
- Profile editing is limited to self via `/api/users/me`; only backend-permitted fields are sent.

### Testing
- Verified a successful production build (`npm run build`).
- Verified department listing, search, status filter, create, edit, head assignment, and delete.
- Verified profile view, edit, and picture upload.

---

# Frontend v1.4.1 - Employee Management Integration Fixes
**Release Date:** July 21, 2026

### Fixed
- Department dropdown was empty because `GET /api/departments?isActive=true` was rejected (400). Express-validator v7 `isBoolean({ strict: true })` only accepts real JS booleans, which a query string can never be. The frontend no longer sends `isActive` as a query param and filters active departments/managers client-side.
- Employee Directory status filter returned "Invalid value" for the same reason. The `isActive` filter is now applied client-side over the returned page, matching the existing attendance status-filter pattern.

---

# Frontend v1.4.0 - Employee Management Module
**Release Date:** July 21, 2026

### Added
- Employee Directory page with server-side search, role filter, department filter, and status filter.
- Paginated employee listing with profile pictures, role badges, and active/inactive badges.
- Employee Details page showing employment, personal, and contact information.
- Edit Employee modal (name, phone, address, date of birth, joining date, gender, blood group, emergency contact).
- Assign Department, Assign Manager, and Change Role actions via a shared assignment modal.
- Activate / Deactivate employee action with confirmation dialog.
- `api/user.api.js` client covering the users and departments endpoints.
- `hooks/useEmployees.js` React Query hooks (list, detail, department options, manager options, mutations).
- Employee shared components (`EmployeeFilters`, `EmployeeTable`, `EditEmployeeModal`, `AssignmentModal`) and `utils/employee.js` helpers.

### Changed
- Wired `/employees` and `/employees/:id` routes behind an HR/Admin protected route.
- Added an Employees link to the sidebar for HR and Admin.
- Extended Breadcrumbs label map for attendance, leave, and employee segments.
- Replaced the dead Departments Quick Action; the Employee Directory Quick Action now navigates to the live directory.

### Security
- Employee management routes are gated to HR and Admin via `ProtectedRoute`.
- Role change, activate/deactivate, and role filter controls follow the backend RBAC (role change is Admin-only).
- All mutations use only existing backend endpoints; no client-side privilege assumptions.

### Testing
- Verified a successful production build (`npm run build`).
- Verified employee listing, search, filters, and pagination.
- Verified role-based access and navigation.
- Verified responsive table and detail layout.

---

# Frontend v1.0.0–v1.3.0 - Foundation, Attendance & Leave UI
**Release Date:** July 20, 2026

### Added
- Vite + React 19 application scaffold with Tailwind CSS v4 and React Router v7.
- Cookie-based authentication flow: `AuthContext`, `useAuth`, session restore, and pub/sub auth events.
- Centralized Axios client with credentials, a deduplicated refresh-token retry interceptor, and session-expiry handling.
- React Query architecture with domain hooks for attendance, leave, and dashboards.
- Protected and public route guards with role-aware gating.
- Application layout: sidebar, top navbar, breadcrumbs, and main content outlet.
- Shared UI component library (Button, Input, Select, TextArea, Card, Badge, Avatar, Modal, ConfirmDialog, Spinner, Loader) and common components (Table, Pagination, SearchBox, EmptyState).
- Dashboard module with role-specific stat cards, Recharts visualizations, and quick actions.
- Attendance module: dashboard summary, mark attendance (punch in/out), list with filters and correction, and calendar view.
- Leave module: dashboard, apply leave with document upload and progress, request list with approve/reject/cancel decision modals, balance view, and history.

### Testing
- Verified authentication, refresh flow, and protected routing.
- Verified attendance and leave workflows against the backend APIs.
- Verified production builds.

---

# Backend v1.1.1 - Automatic Leave Balance Initialization
**Release Date:** July 20, 2026

### Added
- `utils/leaveBalance.js` with `getCurrentLeaveYear` and `initializeLeaveBalancesForUser`.
- Automatic seeding of leave balances from active leave types during registration.

### Changed
- Registration now wraps user creation and leave-balance seeding in a single MongoDB transaction.

### Fixed
- Removed a leftover debug `console.log` from the leave application upload flow.

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
