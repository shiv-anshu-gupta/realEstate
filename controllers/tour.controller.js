const pool = require("../connect");

// Create a tour request
exports.createTour = async (req, res) => {
  try {
    const { user_id, property_id, tour_date, tour_time } = req.body;
    console.log("Creating tour with data:", {
      user_id,
      property_id,
      tour_date,
      tour_time,
    });
    if (!user_id || !property_id || !tour_date || !tour_time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result = await pool.query(
      `INSERT INTO tours (user_id, property_id, tour_date, tour_time)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, property_id, tour_date, tour_time]
    );

    res
      .status(201)
      .json({ message: "Tour scheduled successfully", tour: result.rows[0] });
  } catch (err) {
    console.error("Error creating tour:", err);
    res.status(500).json({ error: "Failed to schedule tour" });
  }
};
