const SENSITIVE_KEYS = /password|token|secret|authorization|cookie|smtp_pass|api_key/i;

const redact = (value) => {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SENSITIVE_KEYS.test(key) ? "[REDACTED]" : redact(item)]));
  return value;
};

const write = (level, message, metadata = {}) => {
  const entry = { timestamp: new Date().toISOString(), level, message, ...redact(metadata) };
  const output = JSON.stringify(entry);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
};

module.exports = { info: (message, metadata) => write("info", message, metadata), warn: (message, metadata) => write("warn", message, metadata), error: (message, metadata) => write("error", message, metadata), debug: (message, metadata) => { if (process.env.NODE_ENV !== "production") write("debug", message, metadata); } };
