const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info("HTTP request completed", { method: req.method, endpoint: req.baseUrl + req.path, statusCode: res.statusCode, executionTimeMs: Number(durationMs.toFixed(2)) });
  });
  next();
};

module.exports = requestLogger;
