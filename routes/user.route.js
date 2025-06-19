const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyUser } = require("../middleware/auth.middleware");
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", verifyUser, userController.getProfile);
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/", // MUST match cookie's path
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
