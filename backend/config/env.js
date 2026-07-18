const isSet = (value) => typeof value === "string" && value.trim().length > 0;

const validateEnvironment = () => {
  const missing = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "NODE_ENV"]
    .filter((name) => !isSet(process.env[name]));

  if (!isSet(process.env.FRONTEND_URL) && isSet(process.env.CLIENT_URL)) {
    process.env.FRONTEND_URL = process.env.CLIENT_URL;
  }
  if (!isSet(process.env.FRONTEND_URL)) missing.push("FRONTEND_URL (or legacy CLIENT_URL)");

  ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].forEach((name) => {
    if (!isSet(process.env[name])) missing.push(name);
  });

  const hasSmtp = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].every((name) => isSet(process.env[name]));
  const hasLegacyEmail = ["EMAIL_USER", "EMAIL_PASS"].every((name) => isSet(process.env[name]));
  if (!hasSmtp && !hasLegacyEmail) missing.push("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (or legacy EMAIL_USER, EMAIL_PASS)");

  if (isSet(process.env.PORT) && (!/^\d+$/.test(process.env.PORT) || Number(process.env.PORT) < 1 || Number(process.env.PORT) > 65535)) {
    throw new Error("Invalid environment configuration: PORT must be an integer between 1 and 65535.");
  }
  if (isSet(process.env.NODE_ENV) && !["development", "test", "production"].includes(process.env.NODE_ENV)) {
    throw new Error("Invalid environment configuration: NODE_ENV must be development, test, or production.");
  }
  if (isSet(process.env.FRONTEND_URL)) {
    try { new URL(process.env.FRONTEND_URL); } catch { throw new Error("Invalid environment configuration: FRONTEND_URL must be a valid URL."); }
  }
  if (missing.length) throw new Error(`Missing required environment configuration: ${missing.join(", ")}.`);
};

const hasCloudinaryConfig = () => ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every((name) => isSet(process.env[name]));

module.exports = { validateEnvironment, hasCloudinaryConfig };
