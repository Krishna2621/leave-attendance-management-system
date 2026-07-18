const logger = require("../utils/logger");

const notFound = (req, res) => res.status(404).json({ success: false, message: "Route not found" });

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const isOperational = statusCode >= 400 && statusCode < 500;
  logger.error("Unhandled request error", { method: req.method, endpoint: req.baseUrl + req.path, statusCode, error: error.message, stack: error.stack });

  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : "Internal server error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
