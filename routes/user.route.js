const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // ✅ Using updated controller
const { verifyUser } = require("../middleware/auth.middleware"); // ✅ For protected routes

// ✅ Login or Register with phone number
router.post("/login", userController.loginWithPhone);

// ✅ Secret route for superadmin login
router.post("/secret", userController.loginWithSecret); // 🔐 secret login with env password

// ✅ Get user profile (protected)
router.get("/profile", verifyUser, userController.getProfile);

// ✅ Logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
