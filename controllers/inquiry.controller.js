import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// ✅ Transporter config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ✅ Controller to handle inquiry
export const handleAgentInquiry = async (req, res) => {
  try {
    const { name, email, message, agentEmail, agentName } = req.body;

    if (!name || !email || !message || !agentEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subject = `New Inquiry for ${
      agentName || "Agent"
    } from Real Estate Website`;
    const htmlBody = `
      <h2>New Inquiry</h2>
      <p><strong>Agent:</strong> ${agentName || "N/A"}</p>
      <p><strong>Client Name:</strong> ${name}</p>
      <p><strong>Client Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: agentEmail,
      subject,
      html: htmlBody,
    });

    return res
      .status(200)
      .json({ message: "Inquiry sent to agent successfully." });
  } catch (err) {
    console.error("❌ Inquiry Error:", err);
    res.status(500).json({ error: "Failed to send inquiry" });
  }
};
