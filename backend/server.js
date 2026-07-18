const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);  // Set global DNS
dns.setDefaultResultOrder("ipv4first");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./config/db");
const { validateEnvironment } = require("./config/env");
const swaggerSpec = require("./config/swagger");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const auditLogRoutes = require("./routes/auditLog.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const leaveRoutes = require("./routes/leave.routes");
const notificationRoutes = require("./routes/notification.routes");
const automationRoutes = require("./routes/automation.routes");
const reportRoutes = require("./routes/report.routes");
const departmentRoutes = require("./routes/department.routes");
const startCronJobs = require("./utils/cronJobs");
const { stopCronJobs } = require("./utils/cronJobs");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const requestLogger = require("./middleware/requestLogger.middleware");
const logger = require("./utils/logger");

const app = express();
const PORT = Number(process.env.PORT);

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many requests. Please try again later." } }));

app.use("/health", healthRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    data: {
      service: "leave-attendance-backend",
    },
  });
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true, customSiteTitle: "Leave & Attendance API Docs" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  validateEnvironment();
  await connectDB();
  const cronJobs = startCronJobs();
  const server = app.listen(PORT, () => logger.info("Server started", { port: PORT, environment: process.env.NODE_ENV }));
  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Graceful shutdown started", { signal });
    stopCronJobs(cronJobs);
    server.close(async () => {
      try {
        await require("mongoose").connection.close(false);
        logger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.error("Graceful shutdown failed", { error: error.message });
        process.exit(1);
      }
    });
    setTimeout(() => { logger.error("Graceful shutdown timed out"); process.exit(1); }, 30000).unref();
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  return server;
};

if (require.main === module) {
  startServer().catch((error) => { logger.error("Server startup failed", { error: error.message }); process.exit(1); });
}

module.exports = { app, startServer };
