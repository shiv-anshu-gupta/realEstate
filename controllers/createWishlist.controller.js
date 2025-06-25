const pool = require("../connect");

// Add a property to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { user_id, property_id } = req.body;

    if (!user_id || !property_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result = await pool.query(
      `INSERT INTO wishlist (user_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, property_id) DO NOTHING
       RETURNING *`,
      [user_id, property_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "Already in wishlist." });
    }

    res.status(201).json({
      message: "Property added to wishlist successfully",
      wishlist: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};
