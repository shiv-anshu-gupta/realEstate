const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const OWNER_PHONE = process.env.OWNER_PHONE || "7440248190";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "owner@123";

// 📱 Login or Register using phone number
exports.loginWithPhone = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    // ❌ Prevent login with superadmin number here
    if (phone === OWNER_PHONE) {
      return res.status(403).json({
        error: "This number is restricted. you cannot use this number",
      });
    }

    let user = await userModel.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      user = await userModel.createUser({
        name: name || "User",
        phone,
        role: "user",
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

// 🔐 Secret Login (for Owner/Superadmin only)
exports.loginWithSecret = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res
        .status(400)
        .json({ error: "Phone and password are required." });
    }

    // ✅ Only allow access if phone and password match .env
    if (phone !== OWNER_PHONE || password !== OWNER_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create or find superadmin user in DB
    let user = await userModel.findByPhone(phone);

    if (!user) {
      user = await userModel.createUser({
        name: "Super Admin",
        phone,
        role: "superadmin",
      });
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
      message: "✅ Superadmin login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Secret login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 👤 Get Profile
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
