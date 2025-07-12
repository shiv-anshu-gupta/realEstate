const express = require("express");
const router = express.Router();
const {
  getAllPropertyRequests,
  updatePropertyRequestStatus,
} = require("../controllers/admin.controller");

// Middleware to ensure only admins can access
const { verifyUser } = require("../middleware/auth.middleware");

// ✅ Get all property requests
router.get("/property-requests", verifyUser, getAllPropertyRequests);

// ✅ Update property request status
router.patch("/property-requests/:id", verifyUser, updatePropertyRequestStatus);

module.exports = router;
