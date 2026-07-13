const developmentOnly = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, message: "Route not found" });
  }

  next();
};

module.exports = developmentOnly;
