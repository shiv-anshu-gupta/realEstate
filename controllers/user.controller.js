const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 📱 Login or Register using phone number
exports.loginWithPhone = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    let user = await userModel.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      user = await userModel.createUser({
        name: name || "User",
        phone,
      });
      isNewUser = true;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: isNewUser
        ? "✅ User registered successfully"
        : "✅ Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
