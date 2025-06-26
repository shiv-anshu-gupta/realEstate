const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyUser } = require("../middleware/auth.middleware");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", verifyUser, userController.getProfile);
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/", // MUST match cookie path
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
