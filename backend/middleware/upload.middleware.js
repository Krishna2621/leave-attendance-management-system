const multer = require("multer");

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const error = new Error("Only PDF, JPG, JPEG, and PNG documents are allowed");
      error.statusCode = 400;
      return callback(error);
    }

    return callback(null, true);
  },
}).single("document");

const uploadLeaveDocument = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "Document must not exceed 10 MB"
        : error.message || "Invalid document upload";
      return res.status(error.statusCode || 400).json({ success: false, message });
    }

    return next();
  });
};

module.exports = { uploadLeaveDocument, ALLOWED_MIME_TYPES, MAX_DOCUMENT_SIZE };
