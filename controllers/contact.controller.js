const { z } = require("zod");
const dotenv = require("dotenv");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
const pool = require("../connect");
dotenv.config();

// ✅ Schema for validation
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is too short"),
  message: z.string().min(1, "Message cannot be empty"),
});

exports.handleContactForm = async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const { name, email, phone, message } = validatedData;

    // ✉️ Email content
    const subject = "New Inquiry from Real Estate Website";
    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `;

    // ✅ Send email to admin
    await sendVerificationEmail(
      process.env.ADMIN_EMAIL,
      subject,
      htmlBody,
      email
    );

    // ✅ Insert message into DB
    await pool.query(
      `INSERT INTO messages (name, email, phone, message) VALUES ($1, $2, $3, $4)`,
      [name, email, phone, message]
    );

    res
      .status(200)
      .json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }

    console.error("❌ Error in contact form:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMessageCount = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM messages");
    const count = parseInt(result.rows[0].count, 10);

    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Failed to fetch message count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRecentMessages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, message, sent_at
      FROM messages
      ORDER BY sent_at DESC
      LIMIT 3;
    `);

    res.status(200).json({
      message: "Recent messages fetched successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching recent messages:", err);
    res.status(500).json({ error: "Failed to fetch recent messages" });
  }
};
