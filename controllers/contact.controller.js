const { z } = require("zod");
const dotenv = require("dotenv");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
dotenv.config();

// ✅ Define schema inside this file
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

    // ✅ Send to admin or you
    await sendVerificationEmail(
      process.env.ADMIN_EMAIL,
      subject,
      htmlBody,
      email
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
