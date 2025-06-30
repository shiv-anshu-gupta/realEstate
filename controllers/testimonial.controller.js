const pool = require("../connect");

// Add a new testimonial
exports.addTestimonial = async (req, res) => {
  try {
    const { name, location, message, rating, image_url } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required." });
    }

    const result = await pool.query(
      `INSERT INTO testimonials (name, location, message, rating, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, location || "", message, rating || 5, image_url || null]
    );

    res.status(201).json({
      message: "Testimonial added successfully.",
      testimonial: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding testimonial:", err);
    res.status(500).json({ error: "Failed to add testimonial." });
  }
};

// Get all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM testimonials ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Failed to fetch testimonials." });
  }
};

// Delete a testimonial by ID
exports.deleteTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM testimonials WHERE id = $1`, [id]);
    res.status(200).json({ message: "Testimonial deleted successfully." });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    res.status(500).json({ error: "Failed to delete testimonial." });
  }
};

// Count all testimonials
exports.countTestimonials = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM testimonials`);
    res.status(200).json({
      message: "Testimonial count fetched successfully.",
      count: parseInt(result.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error counting testimonials:", err);
    res.status(500).json({ error: "Failed to count testimonials." });
  }
};
