const pool = require("../connect");

// GET all property requests
exports.getAllPropertyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM property_requests ORDER BY submitted_at DESC"
    );
    res
      .status(200)
      .json({ message: "Fetched successfully", data: result.rows });
  } catch (err) {
    console.error("❌ Error fetching property requests:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};

// PATCH to update request status
exports.updatePropertyRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const result = await pool.query(
      "UPDATE property_requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property request not found" });
    }

    res.status(200).json({
      message: `Property request ${status}`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating request status:", err);
    res
      .status(500)
      .json({ error: "Failed to update status", message: err.message });
  }
};
