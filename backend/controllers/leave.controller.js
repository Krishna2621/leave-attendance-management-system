const notImplemented = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Leave APIs are scheduled for Phase 3",
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
