const notImplemented = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Attendance APIs are scheduled for Phase 2",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  notImplemented,
};
