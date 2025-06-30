const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const testimonialController = require("../controllers/testimonial.controller");

// 🌟 Add a new testimonial with image upload
router.post(
  "/create",
  (req, res, next) => {
    req.folder = "testimonials"; // 👈 Save images to Cloudinary 'testimonials' folder
    next();
  },
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name, location, message, rating } = req.body;
      const image_url = req.files?.image?.[0]?.path || null;

      if (!name || !message) {
        return res
          .status(400)
          .json({ error: "Name and message are required." });
      }

      const result = await require("../connect").query(
        `INSERT INTO testimonials (name, location, message, rating, image_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, location || "", message, rating || 5, image_url]
      );

      res.status(201).json({
        message: "Testimonial added successfully.",
        testimonial: result.rows[0],
      });
    } catch (err) {
      console.error("Error uploading testimonial:", err);
      res.status(500).json({ error: "Failed to upload testimonial." });
    }
  }
);

// 📥 Get all testimonials
router.get("/", testimonialController.getAllTestimonials);

// 🗑️ Delete a testimonial by ID
router.delete("/:id", testimonialController.deleteTestimonial);

// 📊 Count all testimonials
router.get("/count/all", testimonialController.countTestimonials);

module.exports = router;
