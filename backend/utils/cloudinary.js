const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "leave_documents", resource_type: "auto", ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    Readable.from(buffer).pipe(stream);
  });

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;

  const imageResult = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });

  if (imageResult.result !== "not found") return imageResult;

  return cloudinary.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
