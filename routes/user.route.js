const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // ✅ rename to match updated controller
const { verifyUser } = require("../middleware/auth.middleware"); // ✅ renamed for clarity

// ✅ Login or register with phone number
router.post("/login", userController.loginWithPhone);

// ✅ Get user profile (protected route)
router.get("/profile", verifyUser, userController.getProfile);

// ✅ Logout route
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
