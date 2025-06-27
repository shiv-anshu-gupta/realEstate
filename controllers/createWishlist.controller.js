const pool = require("../connect");

// Add to wishlist
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

// Get wishlist by user ID
exports.getWishlistByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*
       FROM wishlist w
       JOIN properties p ON w.property_id = p.id
       WHERE w.user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { user_id, property_id } = req.body;

    if (!user_id || !property_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await pool.query(
      `DELETE FROM wishlist WHERE user_id = $1 AND property_id = $2`,
      [user_id, property_id]
    );

    res.status(200).json({ message: "Property removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
};

exports.countWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`SELECT COUNT(*) FROM wishlist`);

    res.status(200).json({
      message: "Wishlist count fetched successfully",
      count: parseInt(result.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error counting wishlist:", err);
    res.status(500).json({ error: "Failed to count wishlist" });
  }
};
